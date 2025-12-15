import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { couponCode, planId, quantity } = await request.json();

    if (!couponCode || !planId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          data: {
            isValid: false,
            message: 'Missing required fields',
          },
        },
        { status: 400 }
      );
    }

    // Find coupon
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Invalid or inactive coupon code',
        },
      });
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'This coupon has expired',
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
        {
          success: false,
          data: {
            isValid: false,
            message: 'Invalid membership plan',
          },
        },
        { status: 400 }
      );
    }

    const baseAmount = plan.price * quantity;
    let finalAmount = baseAmount;
    let discountAmount = 0;

    // Calculate discount
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = baseAmount * (coupon.discountValue / 100);
      finalAmount = baseAmount - discountAmount;
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = Math.min(coupon.discountValue, baseAmount);
      finalAmount = Math.max(0, baseAmount - coupon.discountValue);
    } else if (coupon.discountType === 'FREE') {
      discountAmount = baseAmount;
      finalAmount = 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          expiresAt: coupon.expiresAt,
        },
        baseAmount,
        discountAmount,
        finalAmount,
        message: `Coupon applied! You saved ₱${discountAmount.toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      {
        success: false,
        data: {
          isValid: false,
          message: 'Failed to validate coupon',
        },
      },
      { status: 500 }
    );
  }
}