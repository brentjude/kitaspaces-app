import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  PaymentMethod,
  ReferralSource,
  MembershipType,
} from "@/generated/prisma";
import { sendMembershipRegistrationEmail } from "@/lib/email";
import { logUserActivity, getClientInfo } from "@/lib/activityLogger";

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
  const clientInfo = getClientInfo(request);

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
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!agreeToTerms || !agreeToHouseRules) {
      return NextResponse.json(
        { success: false, error: "You must agree to terms and house rules" },
        { status: 400 }
      );
    }

    // Check if email already exists as user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if email exists as guest/customer
    const existingCustomer = await prisma.customer.findFirst({
      where: { email: email.toLowerCase() },
    });

    // Validate plan
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid or inactive membership plan" },
        { status: 400 }
      );
    }

    // Calculate amount
    let totalAmount = plan.price * quantity;
    let couponId: string | undefined;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
      });

      // Validate coupon exists
      if (!coupon) {
        return NextResponse.json(
          { success: false, error: "Invalid coupon code" },
          { status: 400 }
        );
      }

      // Check if coupon usage limit reached
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json(
          { success: false, error: "Coupon usage limit reached" },
          { status: 400 }
        );
      }

      // Check if coupon is expired
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json(
          { success: false, error: "Coupon has expired" },
          { status: 400 }
        );
      }

      // Apply coupon discount
      couponId = coupon.id;
      appliedCoupon = coupon;

      if (coupon.discountType === "PERCENTAGE") {
        totalAmount = totalAmount * (1 - coupon.discountValue / 100);
      } else if (coupon.discountType === "FIXED_AMOUNT") {
        totalAmount = Math.max(0, totalAmount - coupon.discountValue);
      } else if (coupon.discountType === "FREE") {
        totalAmount = 0;
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
    endDate.setDate(endDate.getDate() + plan.durationDays * quantity);

    // Determine if upgrading from guest to member
    const isUpgradingFromGuest = !!existingCustomer;

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

      // Link customer to user if upgrading
      if (existingCustomer) {
        await tx.customer.update({
          where: { id: existingCustomer.id },
          data: { userId: user.id },
        });
      }

      // Generate payment reference
      const paymentReference = generatePaymentReference();

      // Create payment
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          amount: totalAmount,
          paymentMethod: paymentMethod as PaymentMethod,
          status: totalAmount === 0 ? "COMPLETED" : "PENDING",
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
          status: totalAmount === 0 ? "ACTIVE" : "PENDING",
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

    // ===== ACTIVITY LOGGING =====

    // 1. Log user registration
    await logUserActivity(
      result.user.id,
      isUpgradingFromGuest ? "USER_REGISTER" : "USER_REGISTER",
      isUpgradingFromGuest
        ? `Guest upgraded to member: ${result.user.name} (${result.user.email})`
        : `New user registered: ${result.user.name} (${result.user.email})`,
      {
        metadata: {
          email: result.user.email,
          referralSource: result.user.referralSource,
          wasGuest: isUpgradingFromGuest,
          guestId: existingCustomer?.id,
        },
        ...clientInfo,
      }
    );

    // 2. Log membership purchase
    await logUserActivity(
      result.user.id,
      "MEMBERSHIP_PURCHASE",
      `Purchased ${plan.name} membership (${quantity} ${
        quantity > 1 ? "months" : "month"
      })`,
      {
        referenceId: result.membership.id,
        referenceType: "MEMBERSHIP",
        metadata: {
          planId: plan.id,
          planName: plan.name,
          planType: plan.type,
          quantity,
          originalPrice: plan.price * quantity,
          finalAmount: totalAmount,
          duration: plan.durationDays * quantity,
          startDate: result.membership.startDate.toISOString(),
          endDate: result.membership.endDate?.toISOString(),
          membershipStatus: result.membership.status,
          wasGuest: isUpgradingFromGuest,
        },
        ...clientInfo,
      }
    );

    // 3. Log payment activity based on status
    if (totalAmount === 0) {
      // Free membership (with coupon)
      await logUserActivity(
        result.user.id,
        "PAYMENT_COMPLETED",
        `Free membership activated using coupon: ${couponCode}`,
        {
          referenceId: result.payment.id,
          referenceType: "PAYMENT",
          metadata: {
            paymentReference: result.payment.paymentReference,
            amount: 0,
            originalAmount: plan.price * quantity,
            paymentMethod: "FREE_MEMBERSHIP",
            couponCode: couponCode?.toUpperCase(),
            couponType: appliedCoupon?.discountType,
            status: "COMPLETED",
          },
          ...clientInfo,
        }
      );
    } else {
      // Paid membership
      await logUserActivity(
        result.user.id,
        "PAYMENT_INITIATED",
        `Payment initiated for ${plan.name} membership - ₱${totalAmount.toFixed(
          2
        )}`,
        {
          referenceId: result.payment.id,
          referenceType: "PAYMENT",
          metadata: {
            paymentReference: result.payment.paymentReference,
            amount: totalAmount,
            originalAmount: plan.price * quantity,
            paymentMethod: result.payment.paymentMethod,
            referenceNumber: referenceNumber,
            hasProof: !!proofImageUrl,
            couponCode: couponCode?.toUpperCase(),
            couponDiscount: appliedCoupon
              ? plan.price * quantity - totalAmount
              : 0,
            status: "PENDING",
          },
          ...clientInfo,
        }
      );
    }

    // 4. Log coupon usage if applied
    if (appliedCoupon) {
      await logUserActivity(
        result.user.id,
        "MEMBERSHIP_PURCHASE",
        `Coupon applied: ${appliedCoupon.code} - ${
          appliedCoupon.discountType === "PERCENTAGE"
            ? `${appliedCoupon.discountValue}%`
            : appliedCoupon.discountType === "FIXED_AMOUNT"
              ? `₱${appliedCoupon.discountValue}`
              : "FREE"
        } discount`,
        {
          referenceId: appliedCoupon.id,
          referenceType: "COUPON",
          metadata: {
            couponCode: appliedCoupon.code,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue,
            originalAmount: plan.price * quantity,
            discountAmount: plan.price * quantity - totalAmount,
            finalAmount: totalAmount,
          },
          ...clientInfo,
        }
      );
    }

    // ===== END ACTIVITY LOGGING =====

    // Determine email status and send appropriate email
    let emailStatus: "PENDING" | "FREE" | "ACTIVE" = "PENDING";

    if (totalAmount === 0 && couponCode) {
      emailStatus = "FREE";
    } else if (totalAmount > 0) {
      emailStatus = "PENDING";
    }

    // Send confirmation email
    try {
      await sendMembershipRegistrationEmail({
        to: email.toLowerCase(),
        name,
        planName: plan.name,
        amount: totalAmount,
        paymentReference: result.payment.paymentReference || "",
        paymentMethod: paymentMethod || "GCASH",
        status: emailStatus,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        couponCode: couponCode?.toUpperCase(),
      });
      console.info(`✅ Registration email sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
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
        originalAmount: plan.price * quantity,
        discount: couponCode ? plan.price * quantity - totalAmount : 0,
        paymentReference: result.payment.paymentReference,
        status: result.membership.status,
        user: {
          name: result.user.name,
          email: result.user.email,
          wasGuest: isUpgradingFromGuest,
        },
      },
    });
  } catch (error) {
    console.error("Error creating membership registration:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create membership registration",
      },
      { status: 500 }
    );
  }
}
