import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentMethod, MembershipType } from '@/generated/prisma';
import { generatePaymentReference } from '@/lib/paymentReference';
import { logAdminActivity } from '@/lib/activityLogger';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await context.params;
    const body = await request.json();
    const {
      planId,
      paymentMethod,
      referenceNumber,
      proofImageUrl,
      notes,
    } = body;

    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Plan ID and payment method are required' },
        { status: 400 }
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch the plan
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Membership plan not found' },
        { status: 404 }
      );
    }

    // Validate reference number for non-cash methods
    if (
      (paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') &&
      !referenceNumber?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: 'Reference number is required for GCash and Bank Transfer payments' },
        { status: 400 }
      );
    }

    const paymentReference = await generatePaymentReference('membership');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const result = await prisma.$transaction(async (tx) => {
      // Create payment (COMPLETED immediately — admin-confirmed)
      const payment = await tx.payment.create({
        data: {
          userId,
          amount: plan.price,
          paymentMethod: paymentMethod as PaymentMethod,
          status: 'COMPLETED',
          referenceNumber: referenceNumber?.trim() || null,
          proofImageUrl: proofImageUrl || null,
          paymentReference,
          notes: notes?.trim() ? `Admin renewal: ${notes.trim()}` : 'Admin-initiated membership renewal',
          paidAt: new Date(),
        },
      });

      // Create new ACTIVE membership
      const membership = await tx.membership.create({
        data: {
          userId,
          planId: plan.id,
          type: plan.type as MembershipType,
          status: 'ACTIVE',
          startDate,
          endDate,
          paymentId: payment.id,
        },
      });

      // Ensure user isMember flag is true
      await tx.user.update({
        where: { id: userId },
        data: { isMember: true },
      });

      return { membership, payment };
    });

    await logAdminActivity(
      session.user.id,
      'ADMIN_MEMBERSHIP_UPDATED',
      `Renewed membership for ${user.name} (${user.email}) — Plan: ${plan.name}`,
      {
        referenceId: result.membership.id,
        referenceType: 'MEMBERSHIP',
        metadata: {
          userId,
          userName: user.name,
          userEmail: user.email,
          planId: plan.id,
          planName: plan.name,
          planPrice: plan.price,
          paymentMethod,
          paymentReference,
          endDate: endDate.toISOString(),
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        membershipId: result.membership.id,
        paymentReference,
        endDate,
        message: `Membership renewed successfully until ${endDate.toLocaleDateString()}.`,
      },
    });
  } catch (error) {
    console.error('Error renewing membership:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to renew membership',
      },
      { status: 500 }
    );
  }
}
