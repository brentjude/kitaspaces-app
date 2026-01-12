import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
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
    const body = await request.json();
    const { code, discountType, discountValue, maxUses, expiresAt, applicablePlansIds } = body;

    // Validate input
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if coupon code is already used by another coupon
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        id: { not: id },
      },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    // Convert applicablePlansIds array to JSON string for storage
    const plansIdsJson = applicablePlansIds && applicablePlansIds.length > 0
      ? JSON.stringify(applicablePlansIds)
      : null;

    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue.toString()),
        maxUses: maxUses ? parseInt(maxUses.toString()) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        applicablePlansIds: plansIdsJson,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCoupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update coupon',
      },
      { status: 500 }
    );
  }
}

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
    const { isActive } = await request.json();

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      data: updatedCoupon,
    });
  } catch (error) {
    console.error('Error toggling coupon:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle coupon',
      },
      { status: 500 }
    );
  }
}

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

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete coupon',
      },
      { status: 500 }
    );
  }
}