import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponCode, planId, quantity } = body;

    if (!couponCode || !planId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find coupon
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
    });

    if (!coupon) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Invalid or expired coupon code',
        },
      });
    }

    // Check usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Coupon usage limit reached',
        },
      });
    }

    // Get plan price
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const baseAmount = plan.price * quantity;
    let discountAmount = 0;
    let finalAmount = baseAmount;

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = baseAmount * (coupon.discountValue / 100);
      finalAmount = baseAmount - discountAmount;
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = Math.min(coupon.discountValue, baseAmount);
      finalAmount = Math.max(0, baseAmount - discountAmount);
    } else if (coupon.discountType === 'FREE') {
      discountAmount = baseAmount;
      finalAmount = 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        message: `Coupon applied successfully! You saved ₱${discountAmount.toFixed(2)}`,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}