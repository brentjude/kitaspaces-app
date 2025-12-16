import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';
import { generateUniqueReference } from '@/lib/paymentReference';
import MeetingRoomBookingEmail from '@/app/components/email-template/MeetingRoomBookingEmail';

// POST /api/public/meeting-rooms/book - Create booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      roomId,
      bookingDate,
      startTime,
      endTime,
      duration,
      numberOfAttendees,
      purpose,
      contactPerson,
      contactEmail,
      contactPhone,
      company,
      totalAmount,
      paymentMethod,
    } = body;

    // Validate required fields
    if (
      !roomId ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !contactPerson ||
      !contactEmail ||
      !contactPhone
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // Check for conflicting bookings
    const bookingDateObj = new Date(bookingDate);
    
    const conflictingUserBooking = await prisma.meetingRoomBooking.findFirst({
      where: {
        roomId,
        bookingDate: bookingDateObj,
        status: {
          in: ['CONFIRMED', 'PENDING'],
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

    const conflictingCustomerBooking = await prisma.customerMeetingRoomBooking.findFirst({
      where: {
        roomId,
        bookingDate: bookingDateObj,
        status: {
          in: ['CONFIRMED', 'PENDING'],
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

    if (conflictingUserBooking || conflictingCustomerBooking) {
      return NextResponse.json(
        { success: false, error: 'Time slot is already booked' },
        { status: 400 }
      );
    }

    // Generate payment reference: mrb_kita2025_001
    const paymentReference = await generateUniqueReference('meeting-room');

    // Payment notes with booked room info
    const paymentNotes = `Booked Room: ${room.name} | Date: ${bookingDateObj.toLocaleDateString()} | Time: ${startTime} - ${endTime}`;

    let booking;
    let payment;

    if (session?.user?.id) {
      // ============================================
      // REGISTERED USER BOOKING
      // ============================================
      
      // Create payment record first
      payment = await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: totalAmount,
          paymentMethod: paymentMethod || 'CASH',
          status: 'PENDING',
          paymentReference,
          notes: paymentNotes,
        },
      });

      // Create user booking with payment reference
      booking = await prisma.meetingRoomBooking.create({
        data: {
          roomId,
          userId: session.user.id,
          bookingDate: bookingDateObj,
          startTime,
          endTime,
          duration,
          numberOfAttendees: numberOfAttendees || 1,
          purpose,
          status: 'PENDING',
          totalAmount,
          paymentId: payment.id, // Link to payment
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
      // ============================================
      // GUEST CUSTOMER BOOKING
      // ============================================
      
      // First, create or find customer
      let customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { email: contactEmail },
            { contactNumber: contactPhone },
          ],
        },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: contactPerson,
            email: contactEmail,
            contactNumber: contactPhone,
            company,
          },
        });
      }

      // Create customer payment record first
      payment = await prisma.customerPayment.create({
        data: {
          customerId: customer.id,
          amount: totalAmount,
          paymentMethod: paymentMethod || 'CASH',
          status: 'PENDING',
          paymentReference,
          notes: paymentNotes,
        },
      });

      // Create customer booking with payment reference
      booking = await prisma.customerMeetingRoomBooking.create({
        data: {
          roomId,
          customerId: customer.id,
          bookingDate: bookingDateObj,
          startTime,
          endTime,
          duration,
          numberOfAttendees: numberOfAttendees || 1,
          purpose,
          contactPerson,
          contactEmail,
          contactPhone,
          status: 'PENDING',
          totalAmount,
          paymentId: payment.id, // Link to payment
        },
        include: {
          room: true,
          customer: true,
        },
      });
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: contactEmail,
        subject: `Meeting Room Booking Confirmation - ${room.name}`,
        react: MeetingRoomBookingEmail({
          customerName: contactPerson,
          roomName: room.name,
          bookingDate: bookingDateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          startTime,
          endTime,
          totalAmount,
          paymentReference,
          paymentMethod: paymentMethod || 'CASH',
          status: 'PENDING',
          company,
          purpose,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        paymentReference,
      },
      message: 'Booking created successfully. Payment will be collected on arrival.',
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