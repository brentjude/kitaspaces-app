import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany({
      where: {
        isActive: true,
      },
      include: {
        perks: {
          select: {
            id: true,
            perkType: true,
            name: true,
            description: true,
            quantity: true,
            unit: true,
            maxPerDay: true,
          },
        },
      },
      orderBy: [
        { type: 'asc' },
        { price: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch membership plans' },
      { status: 500 }
    );
  }
}