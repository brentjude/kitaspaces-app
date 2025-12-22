import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MeetingRoomCreateInput } from '@/types/database';

// GET /api/admin/meeting-rooms - List all meeting rooms
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rooms = await prisma.meetingRoom.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error('Error fetching meeting rooms:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meeting rooms',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/meeting-rooms - Create new meeting room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: MeetingRoomCreateInput = await request.json();

    // ✅ Validate required fields
    if (!body.name || !body.capacity) {
      return NextResponse.json(
        { success: false, error: 'Name and capacity are required' },
        { status: 400 }
      );
    }

    // ✅ Validate and convert hourly rate
    const hourlyRate = body.hourlyRate !== undefined ? Number(body.hourlyRate) : 0;
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      return NextResponse.json(
        { success: false, error: 'Hourly rate must be a number greater than 0' },
        { status: 400 }
      );
    }

    // Check if room name already exists
    const existingRoom = await prisma.meetingRoom.findUnique({
      where: { name: body.name },
    });

    if (existingRoom) {
      return NextResponse.json(
        { success: false, error: 'A room with this name already exists' },
        { status: 400 }
      );
    }

    // ✅ Create room with validated hourly rate
    const room = await prisma.meetingRoom.create({
      data: {
        name: body.name,
        description: body.description || null,
        coverPhotoUrl: body.coverPhotoUrl || null,
        hourlyRate: hourlyRate, // ✅ Use validated number
        capacity: Number(body.capacity),
        startTime: body.startTime || '09:00',
        endTime: body.endTime || '18:00',
        amenities: body.amenities || null,
        status: 'AVAILABLE',
        isActive: body.isActive ?? true,
        floor: body.floor || null,
        roomNumber: body.roomNumber || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: room,
      message: 'Meeting room created successfully',
    });
  } catch (error) {
    console.error('Error creating meeting room:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create meeting room',
      },
      { status: 500 }
    );
  }
}