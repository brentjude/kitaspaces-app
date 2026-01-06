import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/activityLogger';
import { sendEmail } from '@/lib/email-service';
import MeetingRoomBookingEmail from '@/app/components/email-template/MeetingRoomBookingEmail';

async function generatePaymentReference(prefix: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const latestPayment = await prisma.payment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}_${currentYear}`,
      },
    },
    orderBy: {
      paymentReference: 'desc',
    },
  });

  let nextNumber = 1;
  if (latestPayment?.paymentReference) {
    const parts = latestPayment.paymentReference.split('_');
    const lastNumber = parseInt(parts[parts.length - 1]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}_${currentYear}_${nextNumber.toString().padStart(3, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
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
      paymentMethod = 'CASH',
      notes,
    } = body;

    // Validate required fields
    if (!roomId || !bookingDate || !startTime || !endTime || !contactName || !contactMobile) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify room exists
    const room = await prisma.meetingRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Meeting room not found' },
        { status: 404 }
      );
    }

    // Check for existing bookings on the same date and time
    const existingBooking = await prisma.meetingRoomBooking.findFirst({
      where: {
        roomId,
        bookingDate: new Date(bookingDate),
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Generate payment reference
    const paymentReference = await generatePaymentReference('mrb_kita');

    // Create booking in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record as PENDING (not paid)
      const payment = await tx.payment.create({
        data: {
          userId: session.user.id!,
          amount: totalAmount,
          paymentMethod,
          status: 'PENDING',
          paymentReference,
          notes: notes ? `Admin booking: ${notes}` : `Admin booking for ${contactName}`,
        },
      });

      // Create meeting room booking as PENDING (not confirmed)
      const booking = await tx.meetingRoomBooking.create({
        data: {
          userId: session.user.id!,
          roomId,
          bookingDate: new Date(bookingDate),
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
          status: 'PENDING',
          totalAmount,
          paymentId: payment.id,
          notes: notes || null,
        },
        include: {
          room: true,
          payment: true,
        },
      });

      return { booking, payment };
    });

    // Send confirmation email ONLY if email is provided
    if (contactEmail && contactEmail.trim()) {
      try {
        const formatDuration = (hours: number): string => {
          if (hours === 1) return '1 hour';
          if (hours % 1 === 0) return `${hours} hours`;
          return `${Math.floor(hours)} hour${Math.floor(hours) > 1 ? 's' : ''} 30 mins`;
        };

        await sendEmail({
          to: contactEmail,
          subject: `Meeting Room Booking Confirmation - ${room.name}`,
          react: MeetingRoomBookingEmail({
            customerName: contactName,
            roomName: room.name,
            bookingDate: new Date(bookingDate).toLocaleDateString('en-US', {
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
            purpose: purpose || 'MEETING',
            numberOfAttendees,
          }),
        });

        console.info(`✅ Confirmation email sent to ${contactEmail}`);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the whole operation if email fails
      }
    } else {
      console.info('ℹ️ No email provided, skipping confirmation email');
    }

    // Log admin activity
    await logAdminActivity(
      session.user.id!,
      'ADMIN_BOOKING_CREATED',
      `Created meeting room booking for ${contactName} - ${room.name} on ${new Date(bookingDate).toLocaleDateString()}`,
      {
        referenceId: result.booking.id,
        referenceType: 'MEETING_ROOM_BOOKING',
        metadata: {
          roomId,
          roomName: room.name,
          bookingDate,
          startTime,
          endTime,
          contactName,
          contactEmail: contactEmail || 'Not provided',
          totalAmount,
          paymentReference,
          status: 'PENDING',
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        bookingId: result.booking.id,
        paymentReference,
        booking: result.booking,
        emailSent: !!(contactEmail && contactEmail.trim()),
      },
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Error creating admin booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create booking',
      },
      { status: 500 }
    );
  }
}