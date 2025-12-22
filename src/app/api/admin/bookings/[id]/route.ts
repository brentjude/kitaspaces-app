import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma";
import { Resend } from "resend";
import MeetingRoomBookingEmail from "@/app/components/email-template/MeetingRoomBookingEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await context.params;
    const { status, type } = await request.json();

    // Validate status
    if (!Object.values(BookingStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Determine if this is a user or customer booking
    const isUserBooking = type === "user";

    if (isUserBooking) {
      // Update user booking
      const booking = await prisma.meetingRoomBooking.update({
        where: { id: bookingId },
        data: { status },
        include: {
          room: true,
          user: true,
          payment: true,
        },
      });

      // Send email notification
      try {
        const statusMessages = {
          CONFIRMED: "Your booking has been confirmed!",
          CANCELLED: "Your booking has been cancelled.",
          COMPLETED: "Your booking has been completed. Thank you!",
          NO_SHOW: "You did not show up for your booking.",
        };

        const duration = `${booking.duration} ${booking.duration === 1 ? "hour" : "hours"}`;

        await resend.emails.send({
          from: "KITA Spaces <noreply@notifications.kitaspaces.com>",
          to: booking.contactEmail || booking.user.email,
          subject: `Booking ${status} - ${booking.room.name}`,
          react: MeetingRoomBookingEmail({
            customerName: booking.contactName,
            roomName: booking.room.name,
            bookingDate: new Date(booking.bookingDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            startTime: booking.startTime,
            endTime: booking.endTime,
            duration,
            totalAmount: booking.totalAmount,
            paymentReference: booking.payment?.paymentReference || "N/A",
            paymentMethod: booking.payment?.paymentMethod || "CASH",
            status: booking.status,
            company: booking.company || undefined,
            designation: booking.designation || undefined,
            purpose: booking.purpose || "Meeting",
            numberOfAttendees: booking.numberOfAttendees,
          }),
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        success: true,
        data: booking,
        message: "Booking status updated successfully",
      });
    } else {
      // Update customer booking
      const booking = await prisma.customerMeetingRoomBooking.update({
        where: { id: bookingId },
        data: { status },
        include: {
          room: true,
          customer: true,
          payment: true,
        },
      });

      // Send email notification
      try {
        const duration = `${booking.duration} ${booking.duration === 1 ? "hour" : "hours"}`;

        await resend.emails.send({
          from: "KITA Spaces <noreply@notifications.kitaspaces.com>",
          to: booking.contactEmail || booking.customer.email || "",
          subject: `Booking ${status} - ${booking.room.name}`,
          react: MeetingRoomBookingEmail({
            customerName: booking.contactName,
            roomName: booking.room.name,
            bookingDate: new Date(booking.bookingDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            startTime: booking.startTime,
            endTime: booking.endTime,
            duration,
            totalAmount: booking.totalAmount,
            paymentReference: booking.payment?.paymentReference || "N/A",
            paymentMethod: booking.payment?.paymentMethod || "CASH",
            status: booking.status,
            company: booking.company || undefined,
            designation: booking.designation || undefined,
            purpose: booking.purpose || "Meeting",
            numberOfAttendees: booking.numberOfAttendees,
          }),
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }

      return NextResponse.json({
        success: true,
        data: booking,
        message: "Booking status updated successfully",
      });
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "user") {
      const booking = await prisma.meetingRoomBooking.findUnique({
        where: { id: bookingId },
        include: {
          room: true,
          user: true,
          payment: true,
        },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: { ...booking, type: "user" } });
    } else {
      const booking = await prisma.customerMeetingRoomBooking.findUnique({
        where: { id: bookingId },
        include: {
          room: true,
          customer: true,
          payment: true,
        },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: { ...booking, type: "customer" } });
    }
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}