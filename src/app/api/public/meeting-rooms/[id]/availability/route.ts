import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/public/meeting-rooms/[id]/availability - Check room availability
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Fetch all confirmed bookings for this room on the given date
    const bookings = await prisma.meetingRoomBooking.findMany({
      where: {
        roomId: id,
        bookingDate: new Date(date),
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const bookedSlots = bookings.map((booking) => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
    }));

    return NextResponse.json({
      success: true,
      data: {
        date,
        bookedSlots,
      },
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check availability',
      },
      { status: 500 }
    );
  }
}