import { sendMembershipRegistrationEmail } from '@/lib/email';
import { prisma } from "@/lib/prisma";

export async function sendPaymentApprovalEmail(
  membershipId: string,
) {
  try {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        user: true,
        plan: true,
        payment: true,
      },
    });

    if (!membership || !membership.user || !membership.plan || !membership.payment) {
      throw new Error('Membership data incomplete');
    }

    await sendMembershipRegistrationEmail({
      to: membership.user.email,
      name: membership.user.name,
      planName: membership.plan.name,
      amount: membership.payment.amount,
      paymentReference: membership.payment.paymentReference || '',
      paymentMethod: membership.payment.paymentMethod,
      status: 'ACTIVE',
      startDate: membership.startDate.toISOString(),
      endDate: membership.endDate?.toISOString() || '',
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send payment approval email:', error);
    throw error;
  }
}