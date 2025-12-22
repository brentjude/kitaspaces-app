import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MeetingRoomUpdateInput } from '@/types/database';

// GET /api/admin/meeting-rooms/[id] - Get single meeting room
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const room = await prisma.meetingRoom.findUnique({
      where: { id },
      include: {
        userBookings: {
          take: 10,
          orderBy: { bookingDate: 'desc' },
        },
        customerBookings: {
          take: 10,
          orderBy: { bookingDate: 'desc' },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Meeting room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error fetching meeting room:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meeting room',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/meeting-rooms/[id] - Update meeting room
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body: MeetingRoomUpdateInput = await request.json();

    // ✅ Validate hourly rate if provided
    if (body.hourlyRate !== undefined) {
      const rate = Number(body.hourlyRate);
      if (isNaN(rate) || rate <= 0) {
        return NextResponse.json(
          { success: false, error: 'Hourly rate must be a number greater than 0' },
          { status: 400 }
        );
      }
      body.hourlyRate = rate;
    }

    // Check if room exists
    const existingRoom = await prisma.meetingRoom.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Meeting room not found' },
        { status: 404 }
      );
    }

    // If name is being changed, check for duplicates
    if (body.name && body.name !== existingRoom.name) {
      const duplicateRoom = await prisma.meetingRoom.findUnique({
        where: { name: body.name },
      });

      if (duplicateRoom) {
        return NextResponse.json(
          { success: false, error: 'A room with this name already exists' },
          { status: 400 }
        );
      }
    }

    // ✅ Update with validated data
    const room = await prisma.meetingRoom.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        coverPhotoUrl: body.coverPhotoUrl,
        hourlyRate: body.hourlyRate, // ✅ Already validated above
        capacity: body.capacity ? Number(body.capacity) : undefined,
        startTime: body.startTime,
        endTime: body.endTime,
        amenities: body.amenities,
        status: body.status,
        isActive: body.isActive,
        floor: body.floor,
        roomNumber: body.roomNumber,
        notes: body.notes,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: room,
      message: 'Meeting room updated successfully',
    });
  } catch (error) {
    console.error('Error updating meeting room:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update meeting room',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/meeting-rooms/[id] - Delete meeting room
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Check if room exists
    const room = await prisma.meetingRoom.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Meeting room not found' },
        { status: 404 }
      );
    }

    // ✅ Check for upcoming user bookings (not just confirmed, but also pending)
    const upcomingUserBookings = await prisma.meetingRoomBooking.count({
      where: {
        roomId: id,
        bookingDate: {
          gte: new Date(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    // ✅ Check for upcoming customer bookings
    const upcomingCustomerBookings = await prisma.customerMeetingRoomBooking.count({
      where: {
        roomId: id,
        bookingDate: {
          gte: new Date(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    const totalUpcomingBookings = upcomingUserBookings + upcomingCustomerBookings;

    if (totalUpcomingBookings > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete room with ${totalUpcomingBookings} upcoming booking${totalUpcomingBookings === 1 ? '' : 's'}. Please cancel or complete all upcoming bookings first.`,
        },
        { status: 400 }
      );
    }

    // ✅ Delete the room (cascade will handle past bookings)
    await prisma.meetingRoom.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Meeting room "${room.name}" deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting meeting room:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete meeting room',
      },
      { status: 500 }
    );
  }
}