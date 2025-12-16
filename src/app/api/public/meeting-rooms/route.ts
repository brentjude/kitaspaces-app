import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/public/meeting-rooms - List all active meeting rooms
export async function GET() {
  try {
    const rooms = await prisma.meetingRoom.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
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
        error: 'Failed to fetch meeting rooms',
      },
      { status: 500 }
    );
  }
}