import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { PaymentMethod, ReferralSource, MembershipType } from '@/generated/prisma';
import { sendMembershipRegistrationEmail } from '@/lib/email';

function generateUserId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${year}${randomNum}`;
}

function generatePaymentReference(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `mb_kita${year}_${randomNum}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      nickname,
      email,
      contactNumber,
      birthdate,
      password,
      company,
      referralSource,
      billingAddress,
      agreeToTerms,
      agreeToHouseRules,
      agreeToNewsletter,
      planId,
      quantity,
      paymentMethod,
      referenceNumber,
      proofImageUrl,
      couponCode,
    } = body;

    // Validate required fields
    if (!name || !email || !contactNumber || !planId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!agreeToTerms || !agreeToHouseRules) {
      return NextResponse.json(
        { success: false, error: 'You must agree to terms and house rules' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Validate plan
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive membership plan' },
        { status: 400 }
      );
    }

    // Calculate amount
    let totalAmount = plan.price * quantity;
    let couponId: string | undefined;
    let appliedCoupon: any = null;

    // Apply coupon if provided
    if (couponCode) {
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

      if (coupon && coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json(
          { success: false, error: 'Coupon usage limit reached' },
          { status: 400 }
        );
      }

      if (coupon) {
        couponId = coupon.id;
        appliedCoupon = coupon;
        
        if (coupon.discountType === 'PERCENTAGE') {
          totalAmount = totalAmount * (1 - coupon.discountValue / 100);
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
          totalAmount = Math.max(0, totalAmount - coupon.discountValue);
        } else if (coupon.discountType === 'FREE') {
          totalAmount = 0;
        }
      }
    }

    // Generate unique user ID
    let userId = generateUserId();
    let userExists = await prisma.user.findUnique({ where: { id: userId } });
    
    while (userExists) {
      userId = generateUserId();
      userExists = await prisma.user.findUnique({ where: { id: userId } });
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (plan.durationDays * quantity));

    // Create user, membership, and payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          id: userId,
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          nickname: nickname || undefined,
          contactNumber,
          birthdate: birthdate ? new Date(birthdate) : undefined,
          company: company || undefined,
          referralSource: referralSource as ReferralSource | undefined,
          agreeToNewsletter: agreeToNewsletter || false,
          isMember: totalAmount === 0 ? true : false, // Set to true only if free
        },
      });

      // Generate payment reference
      const paymentReference = generatePaymentReference();

      // Create payment
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          amount: totalAmount,
          paymentMethod: paymentMethod as PaymentMethod,
          status: totalAmount === 0 ? 'COMPLETED' : 'PENDING',
          paymentReference,
          referenceNumber: referenceNumber || undefined,
          proofImageUrl: proofImageUrl || undefined,
          paidAt: totalAmount === 0 ? new Date() : undefined,
        },
      });

      // Create membership
      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          planId,
          type: plan.type as MembershipType,
          status: totalAmount === 0 ? 'ACTIVE' : 'PENDING',
          startDate,
          endDate,
          billingAddress: billingAddress || undefined,
          paymentId: payment.id,
          couponId: couponId || undefined,
        },
      });

      // Update coupon usage if applied
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return { user, payment, membership };
    });

    // Determine email status and send appropriate email
    let emailStatus: 'PENDING' | 'FREE' | 'ACTIVE' = 'PENDING';
    
    if (totalAmount === 0 && couponCode) {
      emailStatus = 'FREE';
    } else if (totalAmount > 0) {
      emailStatus = 'PENDING';
    }

    // Send confirmation email
    try {
      await sendMembershipRegistrationEmail({
        to: email.toLowerCase(),
        name,
        planName: plan.name,
        amount: totalAmount,
        paymentReference: result.payment.paymentReference || '',
        paymentMethod: paymentMethod || 'GCASH',
        status: emailStatus,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        couponCode: couponCode?.toUpperCase(),
      });
      console.log(`✅ Registration email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Don't fail the registration if email fails
      // Just log the error for monitoring
    }

    return NextResponse.json({
      success: true,
      data: {
        membershipId: result.membership.id,
        userId: result.user.id,
        plan: {
          name: plan.name,
          type: plan.type,
          durationDays: plan.durationDays * quantity,
        },
        startDate: result.membership.startDate,
        endDate: result.membership.endDate,
        totalAmount,
        paymentReference: result.payment.paymentReference,
        status: result.membership.status,
        user: {
          name: result.user.name,
          email: result.user.email,
        },
      },
    });
  } catch (error) {
    console.error('Error creating membership registration:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create membership registration',
      },
      { status: 500 }
    );
  }
}