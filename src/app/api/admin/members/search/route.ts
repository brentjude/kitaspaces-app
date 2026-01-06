import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const members = await prisma.user.findMany({
      where: {
        isMember: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNumber: true,
        company: true,
        memberships: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
            plan: {
              select: {
                name: true,
                perks: {
                  where: {
                    perkType: 'MEETING_ROOM_HOURS',
                  },
                  select: {
                    perkType: true,
                    name: true,
                    quantity: true,
                    unit: true,
                  },
                },
              },
            },
            perkUsages: {
              where: {
                perkType: 'MEETING_ROOM_HOURS',
              },
              select: {
                quantityUsed: true,
              },
            },
          },
          take: 1,
          orderBy: {
            endDate: 'desc',
          },
        },
      },
      take: 10,
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate available meeting room hours
    const membersWithHours = members.map((member) => {
      const membership = member.memberships[0];
      const meetingRoomPerk = membership?.plan?.perks?.find(
        (p) => p.perkType === 'MEETING_ROOM_HOURS'
      );

      let availableMeetingRoomHours = 0;
      if (meetingRoomPerk) {
        const totalHours = meetingRoomPerk.quantity;
        const usedHours = membership.perkUsages?.reduce(
          (sum, usage) => sum + usage.quantityUsed,
          0
        ) || 0;
        availableMeetingRoomHours = totalHours - usedHours;
      }

      return {
        ...member,
        membership: membership || undefined,
        availableMeetingRoomHours,
      };
    });

    return NextResponse.json({
      success: true,
      data: membersWithHours,
    });
  } catch (error) {
    console.error('Error searching members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search members' },
      { status: 500 }
    );
  }
}