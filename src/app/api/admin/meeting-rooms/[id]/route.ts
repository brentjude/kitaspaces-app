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

    const room = await prisma.meetingRoom.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        coverPhotoUrl: body.coverPhotoUrl,
        hourlyRate: body.hourlyRate,
        capacity: body.capacity,
        startTime: body.startTime,
        endTime: body.endTime,
        amenities: body.amenities,
        status: body.status,
        isActive: body.isActive,
        floor: body.floor,
        roomNumber: body.roomNumber,
        notes: body.notes,
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
      include: {
        userBookings: { where: { status: 'CONFIRMED' } },
        customerBookings: { where: { status: 'CONFIRMED' } },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Meeting room not found' },
        { status: 404 }
      );
    }

    // Check for active bookings
    const hasActiveBookings = 
      room.userBookings.length > 0 || 
      room.customerBookings.length > 0;

    if (hasActiveBookings) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete room with confirmed bookings. Please cancel all bookings first.' 
        },
        { status: 400 }
      );
    }

    await prisma.meetingRoom.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Meeting room deleted successfully',
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