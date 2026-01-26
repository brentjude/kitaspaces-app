import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const room = await prisma.meetingRoom.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        capacity: true,
        hourlyRate: true,
        coverPhotoUrl: true,
        amenities: true,
        status: true,
        floor: true,
        roomNumber: true,
        startTime: true,
        endTime: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: "Meeting room not found",
        },
        { status: 404 }
      );
    }

    // Parse amenities from JSON string
    let amenitiesArray: string[] = [];
    if (room.amenities) {
      try {
        amenitiesArray = JSON.parse(room.amenities);
      } catch (error) {
        console.error("Error parsing amenities:", error);
      }
    }

    const transformedRoom = {
      ...room,
      amenities: amenitiesArray,
    };

    return NextResponse.json({
      success: true,
      data: transformedRoom,
    });
  } catch (error) {
    console.error("Error fetching meeting room:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch meeting room",
      },
      { status: 500 }
    );
  }
}