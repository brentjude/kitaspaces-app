import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';
import { generateUniqueReference } from '@/lib/paymentReference';
import MeetingRoomBookingEmail from '@/app/components/email-template/MeetingRoomBookingEmail';

interface BookingRequest {
  roomId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  company?: string;
  contactName: string;
  designation?: string;
  contactEmail?: string;
  contactMobile?: string;
  numberOfAttendees?: number;
  purpose: string;
  totalAmount: number;
  paymentMethod?: "GCASH" | "BANK_TRANSFER" | "CASH" | "CREDIT_CARD";
}

// POST /api/public/meeting-rooms/book - Create booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body: BookingRequest = await request.json();

    const {
      roomId,
      bookingDate,
      startTime,
      endTime,
      duration,
      company,
      contactName,
      designation,
      contactEmail,
      contactMobile,
      numberOfAttendees = 1,
      purpose,
      totalAmount,
      paymentMethod = 'CASH',
    } = body;

    // Validate required fields
    if (!roomId || !bookingDate || !startTime || !endTime || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking details' },
        { status: 400 }
      );
    }

    if (!contactName || !contactEmail || !contactMobile || !purpose) {
      return NextResponse.json(
        { success: false, error: 'Missing required contact details' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate duration (must be in 0.5 hour increments)
    if (duration % 0.5 !== 0 || duration <= 0) {
      return NextResponse.json(
        { success: false, error: 'Duration must be in 30-minute increments' },
        { status: 400 }
      );
    }

    // Validate time slots (must be in 30-minute increments)
    const validateTimeSlot = (time: string): boolean => {
      const [hours, minutes] = time.split(':').map(Number);
      return minutes === 0 || minutes === 30;
    };

    if (!validateTimeSlot(startTime) || !validateTimeSlot(endTime)) {
      return NextResponse.json(
        { success: false, error: 'Time slots must be in 30-minute increments (e.g., 09:00, 09:30)' },
        { status: 400 }
      );
    }

    // Calculate and validate duration matches time difference
    const calculateDuration = (start: string, end: string): number => {
      const [startHours, startMinutes] = start.split(':').map(Number);
      const [endHours, endMinutes] = end.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      return (endTotalMinutes - startTotalMinutes) / 60;
    };

    const calculatedDuration = calculateDuration(startTime, endTime);
    if (Math.abs(calculatedDuration - duration) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Duration does not match time slot difference' },
        { status: 400 }
      );
    }

    // Check if room exists and is active
    const room = await prisma.meetingRoom.findUnique({
      where: { id: roomId },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { success: false, error: 'Room not available' },
        { status: 400 }
      );
    }

    // Validate number of attendees against room capacity
    if (numberOfAttendees > room.capacity) {
      return NextResponse.json(
        { success: false, error: `Room capacity is ${room.capacity} people. Please select a larger room.` },
        { status: 400 }
      );
    }

    // Validate booking date (must be today or in the future)
    const bookingDateObj = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDateObj < today) {
      return NextResponse.json(
        { success: false, error: 'Cannot book for past dates' },
        { status: 400 }
      );
    }

    // Check for conflicting bookings with 30-minute precision
    const checkConflict = await prisma.$transaction(async (tx) => {
      const userConflicts = await tx.meetingRoomBooking.findMany({
        where: {
          roomId,
          bookingDate: bookingDateObj,
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
      });

      const customerConflicts = await tx.customerMeetingRoomBooking.findMany({
        where: {
          roomId,
          bookingDate: bookingDateObj,
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
      });

      const allBookings = [
        ...userConflicts.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
        ...customerConflicts.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
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
        { success: false, error: 'This time slot is already booked. Please select a different time.' },
        { status: 400 }
      );
    }

    // 🔧 FIX: Use 'meeting-room' or 'room' as the type
    const paymentReference = await generateUniqueReference('meeting-room');

    const paymentNotes = `Meeting room booking: ${room.name} | ${bookingDate} ${startTime}-${endTime} | ${duration}hr | Purpose: ${purpose}`;

    let booking;
    let payment;

    if (session?.user?.id) {
      // REGISTERED USER BOOKING
      payment = await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: totalAmount,
          paymentMethod,
          status: 'PENDING',
          paymentReference,
          notes: paymentNotes,
        },
      });

      booking = await prisma.meetingRoomBooking.create({
        data: {
          roomId,
          userId: session.user.id,
          bookingDate: bookingDateObj,
          startTime,
          endTime,
          duration,
          company: company || undefined,
          contactName,
          designation: designation || undefined,
          contactEmail: contactEmail || undefined,
          contactMobile: contactMobile || undefined,
          numberOfAttendees,
          purpose,
          status: 'PENDING',
          totalAmount,
          paymentId: payment.id,
        },
        include: {
          room: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      // GUEST CUSTOMER BOOKING
      let customer = await prisma.customer.findFirst({
        where: {
          email: contactEmail,
        },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: contactName,
            email: contactEmail,
            contactNumber: contactMobile || undefined,
            company: company || undefined,
            notes: 'Walk-in meeting room booking',
          },
        });
      }

      payment = await prisma.customerPayment.create({
        data: {
          customerId: customer.id,
          amount: totalAmount,
          paymentMethod,
          status: 'PENDING',
          paymentReference,
          notes: paymentNotes,
        },
      });

      booking = await prisma.customerMeetingRoomBooking.create({
        data: {
          roomId,
          customerId: customer.id,
          bookingDate: bookingDateObj,
          startTime,
          endTime,
          duration,
          company: company || undefined,
          contactPerson: contactName,
          contactName,
          designation: designation || undefined,
          contactEmail: contactEmail || undefined,
          contactPhone: contactMobile || undefined,
          contactMobile: contactMobile || undefined,
          numberOfAttendees,
          purpose,
          status: 'PENDING',
          totalAmount,
          paymentId: payment.id,
        },
        include: {
          room: true,
          customer: true,
        },
      });
    }

    const formatDuration = (hours: number): string => {
      if (hours === 1) return '1 hour';
      if (hours % 1 === 0) return `${hours} hours`;
      return `${Math.floor(hours)} hour${Math.floor(hours) > 1 ? 's' : ''} 30 mins`;
    };

    // Send confirmation email
    try {
      await sendEmail({
        to: contactEmail,
        subject: `Meeting Room Booking Confirmation - ${room.name}`,
        react: MeetingRoomBookingEmail({
          customerName: contactName,
          roomName: room.name,
          bookingDate: bookingDateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          startTime,
          endTime,
          duration: formatDuration(duration),
          totalAmount,
          paymentReference,
          paymentMethod,
          status: 'PENDING',
          company: company || undefined,
          designation: designation || undefined,
          purpose,
          numberOfAttendees,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        paymentReference,
        room: {
          id: room.id,
          name: room.name,
        },
        booking: {
          date: bookingDate,
          startTime,
          endTime,
          duration,
        },
        contact: {
          name: contactName,
          email: contactEmail,
          mobile: contactMobile,
          company,
          designation,
        },
        totalAmount,
        status: 'PENDING',
      },
      message: 'Booking created successfully! Please complete payment to confirm.',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create booking',
      },
      { status: 500 }
    );
  }
}