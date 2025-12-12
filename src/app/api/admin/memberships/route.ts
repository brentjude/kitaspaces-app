import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MembershipType } from '@/generated/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const plans = await prisma.membershipPlan.findMany({
      include: {
        perks: true,
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      type,
      price,
      durationDays,
      isActive,
      perks,
    } = body;

    // Validate required fields
    if (!name || !type || price === undefined || !durationDays) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['MONTHLY', 'DAILY'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid membership type' },
        { status: 400 }
      );
    }

    // Create plan with perks
    const plan = await prisma.membershipPlan.create({
      data: {
        name,
        description: description || null,
        type: type as MembershipType,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        isActive: isActive !== false,
        perks: {
          create: (perks || []).map((perk: {
            perkType: string;
            name: string;
            description?: string;
            quantity: number;
            unit: string;
            maxPerDay?: number;
            maxPerWeek?: number;
            daysOfWeek?: number[];
            isRecurring: boolean;
            validFrom?: string;
            validUntil?: string;
          }) => ({
            perkType: perk.perkType,
            name: perk.name,
            description: perk.description || null,
            quantity: parseFloat(String(perk.quantity)),
            unit: perk.unit,
            maxPerDay: perk.maxPerDay ? parseFloat(String(perk.maxPerDay)) : null,
            maxPerWeek: perk.maxPerWeek ? parseFloat(String(perk.maxPerWeek)) : null,
            daysOfWeek: perk.daysOfWeek ? JSON.stringify(perk.daysOfWeek) : null,
            isRecurring: perk.isRecurring !== false,
            validFrom: perk.validFrom || null,
            validUntil: perk.validUntil || null,
          })),
        },
      },
      include: {
        perks: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: plan,
      message: 'Membership plan created successfully',
    });
  } catch (error) {
    console.error('Error creating membership plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create membership plan' },
      { status: 500 }
    );
  }
}