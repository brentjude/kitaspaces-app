import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { logAdminActivity } from "@/lib/activityLogger";
import { sendAdminAddedMemberWelcomeEmail, convertPerksToEmailBenefits } from "@/lib/email-service";
import { Session } from "next-auth";

async function generateUserId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = currentYear.toString();

  const latestUser = await prisma.user.findFirst({
    where: {
      id: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  let nextNumber = 1;

  if (latestUser) {
    const lastNumber = parseInt(latestUser.id.slice(-3));
    nextNumber = lastNumber + 1;
  }

  return `${yearPrefix}${nextNumber.toString().padStart(3, "0")}`;
}

async function generatePaymentReference(prefix: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const latestPayment = await prisma.payment.findFirst({
    where: {
      paymentReference: {
        startsWith: `${prefix}_${currentYear}`,
      },
    },
    orderBy: {
      paymentReference: "desc",
    },
  });

  let nextNumber = 1;
  if (latestPayment && latestPayment.paymentReference) {
    const parts = latestPayment.paymentReference.split("_");
    const lastNumber = parseInt(parts[parts.length - 1]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}_${currentYear}_${nextNumber.toString().padStart(3, "0")}`;
}

export async function POST(request: NextRequest) {
  let session: Session | null = null;
  let userId: string | null = null;

  try {
    session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      company,
      contactNumber,
      birthdate,
      referralSource,
      agreeToNewsletter,
      planId,
      couponCode,
      customDuration,
      paymentNote,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !planId || !paymentNote) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Get membership plan with perks
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      include: {
        perks: true,
      },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid or inactive membership plan" },
        { status: 400 }
      );
    }

    let discount = 0;
    let coupon = null;

    // Validate coupon if provided
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json(
          { success: false, error: "Invalid or inactive coupon" },
          { status: 400 }
        );
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json(
          { success: false, error: "Coupon has expired" },
          { status: 400 }
        );
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json(
          { success: false, error: "Coupon has reached maximum uses" },
          { status: 400 }
        );
      }

      // Calculate discount
      if (coupon.discountType === "PERCENTAGE") {
        discount = (plan.price * coupon.discountValue) / 100;
      } else if (coupon.discountType === "FIXED_AMOUNT") {
        discount = coupon.discountValue;
      } else if (coupon.discountType === "FREE") {
        discount = plan.price;
      }

      // Ensure discount doesn't exceed plan price
      discount = Math.min(discount, plan.price);
    }

    const totalAmount = plan.price - discount;

    // Generate IDs
    userId = await generateUserId();
    const hashedPassword = await hash(password, 10);
    const paymentReference = await generatePaymentReference("mem_kita");

    // Calculate membership dates
    const startDate = new Date();
    const endDate = new Date(startDate);

    let durationDays = plan.durationDays;
    if (customDuration !== undefined && customDuration > 0) {
      if (plan.type === 'MONTHLY') {
        durationDays = customDuration * 30;
      } else {
        durationDays = customDuration;
      }
    }

    endDate.setDate(endDate.getDate() + durationDays);

    // Create user, payment, and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          id: userId!,
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          company: company || null,
          contactNumber: contactNumber || null,
          birthdate: birthdate ? new Date(birthdate) : null,
          referralSource: referralSource || null,
          agreeToNewsletter,
          isMember: true,
          role: "USER",
        },
      });

      // Create payment
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          amount: totalAmount,
          paymentMethod: "CASH",
          status: "COMPLETED",
          paymentReference,
          notes: paymentNote,
          paidAt: new Date(),
        },
      });

      // Create membership
      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          planId: plan.id,
          type: plan.type,
          status: "ACTIVE",
          startDate,
          endDate,
          paymentId: payment.id,
          couponId: coupon?.id || null,
        },
      });

      // Update coupon usage count if used
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return { user, payment, membership };
    });

    // ✅ Send welcome email
    try {
      const benefits = convertPerksToEmailBenefits(plan.perks);
      
      await sendAdminAddedMemberWelcomeEmail({
        to: result.user.email,
        name: result.user.name,
        email: result.user.email,
        planName: plan.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        adminNote: paymentNote,
        benefits,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the whole operation if email fails
    }

    // Log activity
    await logAdminActivity(
      session.user.id,
      "ADMIN_USER_CREATED",
      `Created new member: ${result.user.name} (${result.user.email}) with ${plan.name} plan`,
      {
        userId: result.user.id,
        referenceId: result.user.id,
        referenceType: "USER",
        metadata: {
          userId: result.user.id,
          userName: result.user.name,
          userEmail: result.user.email,
          planId: plan.id,
          planName: plan.name,
          planPrice: plan.price,
          discount,
          totalAmount,
          paymentReference,
          couponCode: coupon?.code,
          customDuration,
          durationDays,
          createdBy: session.user.name,
          createdByEmail: session.user.email,
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        membershipId: result.membership.id,
        paymentReference,
      },
    });
  } catch (error) {
    console.error("Error creating member:", error);

    // Log failed attempt
    if (session?.user?.id && userId) {
      await logAdminActivity(
        session.user.id,
        "ADMIN_USER_CREATED",
        `Failed to create member`,
        {
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          request,
          isSuccess: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create member",
      },
      { status: 500 }
    );
  }
}