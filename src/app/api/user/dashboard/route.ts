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

    // Fetch user with most recent membership (any status)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            plan: true,
            payment: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        payments: {
          where: {
            status: 'COMPLETED',
          },
          orderBy: {
            paidAt: 'desc',
          },
          take: 1, // Get most recent payment for daily pass
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const activeMembership = user.memberships[0] || null;
    const recentPayment = user.payments[0] || null;

    // Determine if membership is effectively active (ACTIVE status and not expired)
    const isEffectivelyActive =
      activeMembership?.status === 'ACTIVE' &&
      activeMembership.endDate !== null &&
      new Date(activeMembership.endDate) >= new Date();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isMember: user.isMember,
        },
        membership: activeMembership ? {
          type: activeMembership.type,
          status: isEffectivelyActive ? 'ACTIVE' : activeMembership.status,
          startDate: activeMembership.startDate,
          endDate: activeMembership.endDate,
          planName: activeMembership.plan?.name || null,
          paymentStatus: activeMembership.payment?.status ?? null,
        } : null,
        recentPayment: recentPayment && !isEffectivelyActive ? {
          amount: recentPayment.amount,
          paidAt: recentPayment.paidAt,
          paymentMethod: recentPayment.paymentMethod,
        } : null,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}