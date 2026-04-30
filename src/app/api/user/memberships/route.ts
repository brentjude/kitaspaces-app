import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, MembershipType } from "@/generated/prisma";
import { generatePaymentReference } from "@/lib/paymentReference";
import { logUserActivity } from "@/lib/activityLogger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { planId, paymentMethod, referenceNumber, proofImageUrl, notes } =
      body;

    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Plan and payment method are required" },
        { status: 400 },
      );
    }

    // Fetch the plan
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Membership plan not found or inactive" },
        { status: 404 },
      );
    }

    // Check there is no already-pending membership for this user
    const existingPending = await prisma.membership.findFirst({
      where: { userId, status: "PENDING" },
      include: { payment: true },
    });

    if (existingPending) {
      // If the associated payment has FAILED, allow retry by cancelling the old record
      if (existingPending.payment?.status === "FAILED") {
        await prisma.membership.update({
          where: { id: existingPending.id },
          data: { status: "INACTIVE" },
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error:
              "You already have a pending membership renewal awaiting approval",
          },
          { status: 400 },
        );
      }
    }

    const paymentReference = await generatePaymentReference("membership");

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const result = await prisma.$transaction(async (tx) => {
      // Create payment record (PENDING until admin approves)
      const payment = await tx.payment.create({
        data: {
          userId,
          amount: plan.price,
          paymentMethod: paymentMethod as PaymentMethod,
          status: "PENDING",
          referenceNumber: referenceNumber || null,
          proofImageUrl: proofImageUrl || null,
          paymentReference,
          notes: notes || null,
        },
      });

      // Create membership record (PENDING until admin approves)
      const membership = await tx.membership.create({
        data: {
          userId,
          planId: plan.id,
          type: plan.type as MembershipType,
          status: "PENDING",
          startDate,
          endDate,
          paymentId: payment.id,
        },
        include: {
          plan: true,
        },
      });

      return { membership, payment };
    });

    // Log membership renewal submission
    await logUserActivity(
      userId,
      "MEMBERSHIP_RENEWAL",
      `Submitted membership renewal for plan: ${plan.name}`,
      {
        referenceId: result.membership.id,
        referenceType: "MEMBERSHIP",
        metadata: {
          membershipId: result.membership.id,
          planId: plan.id,
          planName: plan.name,
          planType: plan.type,
          amount: plan.price,
          durationDays: plan.durationDays,
          paymentReference,
        },
        request,
      },
    );

    // Log payment initiated
    await logUserActivity(
      userId,
      "PAYMENT_INITIATED",
      `Initiated payment of ₱${plan.price} for membership renewal (${plan.name})`,
      {
        referenceId: result.payment.id,
        referenceType: "PAYMENT",
        metadata: {
          paymentId: result.payment.id,
          membershipId: result.membership.id,
          amount: plan.price,
          paymentMethod,
          paymentReference,
          referenceNumber: referenceNumber || null,
          hasProofOfPayment: !!proofImageUrl,
        },
        request,
      },
    );

    return NextResponse.json({
      success: true,
      data: {
        membershipId: result.membership.id,
        paymentReference,
        status: "PENDING",
        message: "Membership renewal submitted. Awaiting admin approval.",
      },
    });
  } catch (error) {
    console.error("Error submitting membership renewal:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit membership renewal",
      },
      { status: 500 },
    );
  }
}
