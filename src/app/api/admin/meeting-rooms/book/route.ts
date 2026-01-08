import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminActivity } from "@/lib/activityLogger";
import { sendEmail } from "@/lib/email-service";
import MeetingRoomBookingEmail from "@/app/components/email-template/MeetingRoomBookingEmail";

// ✅ Updated to properly increment meeting room booking payment references
async function generatePaymentReference(prefix: string): Promise<string> {
  const currentYear = new Date().getFullYear();

  // ✅ Search in both user and customer meeting room booking payment tables
  const [latestUserPayment, latestCustomerPayment] = await Promise.all([
    // Check user meeting room bookings (Payment table)
    prisma.payment.findFirst({
      where: {
        paymentReference: {
          startsWith: `${prefix}_${currentYear}`,
        },
      },
      orderBy: {
        createdAt: "desc", // ✅ Use createdAt instead of paymentReference for accuracy
      },
      select: {
        paymentReference: true,
      },
    }),
    // Check customer meeting room bookings (CustomerPayment table)
    prisma.customerPayment.findFirst({
      where: {
        paymentReference: {
          startsWith: `${prefix}_${currentYear}`,
        },
      },
      orderBy: {
        createdAt: "desc", // ✅ Use createdAt instead of paymentReference for accuracy
      },
      select: {
        paymentReference: true,
      },
    }),
  ]);

  // ✅ Extract the number from both payment references and find the highest
  let nextNumber = 1;

  const extractNumber = (ref: string | null | undefined): number => {
    if (!ref) return 0;
    const parts = ref.split("_");
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart, 10);
    return isNaN(num) ? 0 : num;
  };

  const userNumber = extractNumber(latestUserPayment?.paymentReference);
  const customerNumber = extractNumber(latestCustomerPayment?.paymentReference);

  // ✅ Get the highest number from both tables
  const highestNumber = Math.max(userNumber, customerNumber);
  nextNumber = highestNumber + 1;

  // ✅ Format with leading zeros (3 digits)
  const paddedNumber = nextNumber.toString().padStart(3, "0");

  return `${prefix}_${currentYear}_${paddedNumber}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      bookingType, // 'CUSTOMER' | 'MEMBER' | 'GUEST'
      customerId,
      memberId,
      roomId,
      bookingDate,
      startTime,
      endTime,
      duration,
      contactName,
      contactMobile,
      contactEmail,
      company,
      designation,
      numberOfAttendees = 1,
      purpose,
      totalAmount,
      paymentMethod = "CASH",
      notes,
    } = body;

    // Validate required fields
    if (
      !bookingType ||
      !roomId ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !contactName ||
      !contactMobile
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify room exists
    const room = await prisma.meetingRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Meeting room not found" },
        { status: 404 }
      );
    }

    // Check for existing bookings (same conflict check as before)
    const bookingDateObj = new Date(bookingDate);
    const checkConflict = await prisma.$transaction(async (tx) => {
      const userConflicts = await tx.meetingRoomBooking.findMany({
        where: {
          roomId,
          bookingDate: bookingDateObj,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      const customerConflicts = await tx.customerMeetingRoomBooking.findMany({
        where: {
          roomId,
          bookingDate: bookingDateObj,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      const allBookings = [
        ...userConflicts.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
        })),
        ...customerConflicts.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      ];

      for (const booking of allBookings) {
        if (startTime < booking.endTime && endTime > booking.startTime) {
          return true;
        }
      }
      return false;
    });

    if (checkConflict) {
      return NextResponse.json(
        { success: false, error: "This time slot is already booked" },
        { status: 400 }
      );
    }

    // ✅ Generate payment reference (checks both Payment and CustomerPayment tables)
    const paymentReference = await generatePaymentReference("mrb_kita");

    let result;

    // Handle different booking types
    if (bookingType === "MEMBER" && memberId) {
      // MEMBER BOOKING - Use MeetingRoomBooking table
      result = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId: memberId,
            amount: totalAmount,
            paymentMethod,
            status: "PENDING",
            paymentReference,
            notes: notes
              ? `Admin booking: ${notes}`
              : `Admin booking for ${contactName}`,
          },
        });

        const booking = await tx.meetingRoomBooking.create({
          data: {
            userId: memberId,
            roomId,
            bookingDate: bookingDateObj,
            startTime,
            endTime,
            duration,
            company: company || null,
            contactName,
            designation: designation || null,
            contactEmail: contactEmail || null,
            contactMobile,
            numberOfAttendees,
            purpose: purpose || null,
            status: "PENDING",
            totalAmount,
            paymentId: payment.id,
            notes: notes || null,
          },
          include: {
            room: true,
            payment: true,
            user: true,
          },
        });

        return { booking, payment, customer: null };
      });
    } else {
      // CUSTOMER or GUEST BOOKING - Use CustomerMeetingRoomBooking table
      result = await prisma.$transaction(async (tx) => {
        let customer;

        if (bookingType === "CUSTOMER" && customerId) {
          // Use existing customer
          customer = await tx.customer.findUnique({
            where: { id: customerId },
          });

          if (!customer) {
            throw new Error("Customer not found");
          }

          // ✅ Update customer info if needed - with proper typing
          const updateData: {
            name?: string;
            company?: string | null;
            email?: string | null;
          } = {};

          if (contactName && contactName !== customer.name) {
            updateData.name = contactName;
          }
          if (company && company !== customer.company) {
            updateData.company = company;
          }
          if (
            contactEmail &&
            contactEmail.trim() &&
            contactEmail.toLowerCase() !== customer.email
          ) {
            updateData.email = contactEmail.toLowerCase();
          }

          if (Object.keys(updateData).length > 0) {
            customer = await tx.customer.update({
              where: { id: customerId },
              data: updateData,
            });
          }
        } else {
          // GUEST - Create new customer (email is optional)
          customer = await tx.customer.create({
            data: {
              name: contactName,
              contactNumber: contactMobile,
              email:
                contactEmail && contactEmail.trim()
                  ? contactEmail.toLowerCase()
                  : null,
              company: company || null,
              notes: notes
                ? `Admin booking: ${notes}`
                : "Created from admin booking",
            },
          });
        }

        const payment = await tx.customerPayment.create({
          data: {
            customerId: customer.id,
            amount: totalAmount,
            paymentMethod,
            status: "PENDING",
            paymentReference,
            notes: notes
              ? `Admin booking: ${notes}`
              : `Admin booking for ${contactName}`,
          },
        });

        const booking = await tx.customerMeetingRoomBooking.create({
          data: {
            customerId: customer.id,
            roomId,
            bookingDate: bookingDateObj,
            startTime,
            endTime,
            duration,
            company: company || null,
            contactPerson: contactName,
            contactName,
            designation: designation || null,
            contactEmail: contactEmail || null,
            contactPhone: contactMobile,
            contactMobile,
            numberOfAttendees,
            purpose: purpose || "MEETING",
            status: "PENDING",
            totalAmount,
            paymentId: payment.id,
            notes: notes || null,
          },
          include: {
            room: true,
            payment: true,
            customer: true,
          },
        });

        return { booking, payment, customer };
      });
    }

    // Send confirmation email
    if (contactEmail && contactEmail.trim()) {
      try {
        const formatDuration = (hours: number): string => {
          if (hours === 1) return "1 hour";
          if (hours % 1 === 0) return `${hours} hours`;
          return `${Math.floor(hours)} hour${Math.floor(hours) > 1 ? "s" : ""} 30 mins`;
        };

        await sendEmail({
          to: contactEmail,
          subject: `Meeting Room Booking Confirmation - ${room.name}`,
          react: MeetingRoomBookingEmail({
            customerName: contactName,
            roomName: room.name,
            bookingDate: bookingDateObj.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            startTime,
            endTime,
            duration: formatDuration(duration),
            totalAmount,
            paymentReference,
            paymentMethod,
            status: "PENDING",
            company: company || undefined,
            designation: designation || undefined,
            purpose: purpose || "MEETING",
            numberOfAttendees,
          }),
        });

        console.info(`✅ Confirmation email sent to ${contactEmail}`);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    } else {
      console.info("ℹ️ No email provided, skipping confirmation email");
    }

    // Log admin activity
    await logAdminActivity(
      session.user.id!,
      "ADMIN_BOOKING_CREATED",
      `Created meeting room booking for ${contactName} - ${room.name} on ${bookingDateObj.toLocaleDateString()}`,
      {
        referenceId: result.booking.id,
        referenceType:
          bookingType === "MEMBER"
            ? "MEETING_ROOM_BOOKING"
            : "CUSTOMER_MEETING_ROOM_BOOKING",
        metadata: {
          bookingType,
          customerId: result.customer?.id,
          memberId: bookingType === "MEMBER" ? memberId : undefined,
          roomId,
          roomName: room.name,
          bookingDate,
          startTime,
          endTime,
          contactName,
          contactEmail: contactEmail || "Not provided",
          totalAmount,
          paymentReference,
          status: "PENDING",
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        bookingId: result.booking.id,
        customerId: result.customer?.id,
        paymentReference,
        booking: result.booking,
        emailSent: !!(contactEmail && contactEmail.trim()),
      },
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error creating admin booking:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
