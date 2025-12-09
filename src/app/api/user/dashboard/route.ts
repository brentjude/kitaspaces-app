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

    // Fetch user with active membership
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: {
            status: 'ACTIVE',
            endDate: {
              gte: new Date(),
            },
          },
          include: {
            plan: true,
            payment: true,
          },
          orderBy: {
            endDate: 'desc',
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
          status: activeMembership.status,
          startDate: activeMembership.startDate,
          endDate: activeMembership.endDate,
          planName: activeMembership.plan?.name || null,
        } : null,
        recentPayment: recentPayment && !activeMembership ? {
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