import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user's event registrations
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId,
      },
      include: {
        event: {
          include: {
            category: true,
          },
        },
        payment: true,
      },
      orderBy: {
        event: {
          date: 'asc',
        },
      },
    });

    const now = new Date();
    const upcomingEvents = registrations.filter(
      (reg) => new Date(reg.event.date) >= now
    );
    const pastEvents = registrations.filter(
      (reg) => new Date(reg.event.date) < now
    );

    return NextResponse.json({
      success: true,
      data: {
        upcoming: upcomingEvents.map((reg) => ({
          registrationId: reg.id,
          event: {
            id: reg.event.id,
            title: reg.event.title,
            slug: reg.event.slug,
            description: reg.event.description,
            date: reg.event.date,
            startTime: reg.event.startTime,
            endTime: reg.event.endTime,
            location: reg.event.location,
            price: reg.event.price,
            imageUrl: reg.event.imageUrl,
            category: reg.event.category,
          },
          numberOfPax: reg.numberOfPax,
          paymentStatus: reg.payment ? reg.payment.status : (reg.event.isFree ? 'FREE' : 'PENDING'),
          createdAt: reg.createdAt,
        })),
        past: pastEvents.map((reg) => ({
          registrationId: reg.id,
          event: {
            id: reg.event.id,
            title: reg.event.title,
            slug: reg.event.slug,
            date: reg.event.date,
            location: reg.event.location,
          },
          createdAt: reg.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('User events error:', error);
    return NextResponse.json(
      { error: 'Failed to load events' },
      { status: 500 }
    );
  }
}