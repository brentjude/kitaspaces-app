import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponCode, planId, quantity } = body;

    if (!couponCode || !planId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Invalid coupon code',
          reason: 'This coupon code does not exist',
          coupon: null,
          finalAmount: 0,
          discountAmount: 0,
        },
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Coupon is inactive',
          reason: 'This coupon has been deactivated',
          coupon: null,
          finalAmount: 0,
          discountAmount: 0,
        },
      });
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: 'Coupon has expired',
          reason: `This coupon expired on ${new Date(coupon.expiresAt).toLocaleDateString()}`,
          coupon: null,
          finalAmount: 0,
          discountAmount: 0,
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
          reason: 'This coupon has reached its maximum number of uses',
          coupon: null,
          finalAmount: 0,
          discountAmount: 0,
        },
      });
    }

    // 🆕 Check if coupon is applicable to the selected plan
    if (coupon.applicablePlansIds) {
      try {
        const applicablePlanIds = JSON.parse(coupon.applicablePlansIds) as string[];
        
        if (applicablePlanIds.length > 0 && !applicablePlanIds.includes(planId)) {
          return NextResponse.json({
            success: true,
            data: {
              isValid: false,
              message: 'Coupon not applicable to selected plan',
              reason: 'This coupon cannot be used with your selected membership plan',
              coupon: null,
              finalAmount: 0,
              discountAmount: 0,
            },
          });
        }
      } catch (error) {
        console.error('Error parsing applicablePlansIds:', error);
      }
    }

    // Get the membership plan to calculate discount
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid membership plan',
        },
        { status: 400 }
      );
    }

    // Calculate discount
    const baseAmount = plan.price * quantity;
    let discountAmount = 0;

    switch (coupon.discountType) {
      case 'PERCENTAGE':
        discountAmount = (baseAmount * coupon.discountValue) / 100;
        break;
      case 'FIXED_AMOUNT':
        discountAmount = coupon.discountValue;
        break;
      case 'FREE':
        discountAmount = baseAmount;
        break;
      default:
        discountAmount = 0;
    }

    // Ensure discount doesn't exceed base amount
    if (discountAmount > baseAmount) {
      discountAmount = baseAmount;
    }

    const finalAmount = Math.max(0, baseAmount - discountAmount);

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        message: 'Coupon is valid',
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          expiresAt: coupon.expiresAt,
          applicablePlansIds: coupon.applicablePlansIds,
        },
        finalAmount,
        discountAmount,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate coupon',
      },
      { status: 500 }
    );
  }
}