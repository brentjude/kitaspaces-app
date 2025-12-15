import { NextRequest, NextResponse } from 'next/server';
import {
  sendMembershipPendingEmail,
  sendMembershipFreeEmail,
  sendMembershipApprovedEmail,
  sendTestEmail,
  sendEventConfirmationEmail,
} from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json();

    if (!type || !to) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, to' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'membership-pending':
        result = await sendMembershipPendingEmail({
          to,
          name: data.name,
          planName: data.planName,
          amount: data.amount,
          paymentReference: data.paymentReference,
          paymentMethod: data.paymentMethod,
        });
        break;

      case 'membership-free':
        result = await sendMembershipFreeEmail({
          to,
          name: data.name,
          planName: data.planName,
          couponCode: data.couponCode,
          startDate: data.startDate,
          endDate: data.endDate,
        });
        break;

      case 'membership-approved':
        result = await sendMembershipApprovedEmail({
          to,
          name: data.name,
          planName: data.planName,
          amount: data.amount,
          paymentReference: data.paymentReference,
          startDate: data.startDate,
          endDate: data.endDate,
        });
        break;

      case 'event-confirmation':
        result = await sendEventConfirmationEmail({
          to,
          name: data.name,
          eventTitle: data.eventTitle,
          eventDate: data.eventDate,
          ticketCount: data.ticketCount,
          totalAmount: data.totalAmount,
          paymentReference: data.paymentReference,
        });
        break;

      case 'test':
        result = await sendTestEmail({
          to,
          firstName: data.firstName || 'User',
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    );
  }
}