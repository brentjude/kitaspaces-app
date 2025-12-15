// This file is kept for backward compatibility
// All new email sending should use the email-service.ts instead
import {
  sendMembershipPendingEmail,
  sendMembershipFreeEmail,
  sendMembershipApprovedEmail,
} from './email-service';

export async function sendMembershipRegistrationEmail(data: {
  to: string;
  name: string;
  planName: string;
  amount: number;
  paymentReference: string;
  paymentMethod: string;
  status: 'PENDING' | 'FREE' | 'ACTIVE';
  startDate?: string;
  endDate?: string;
  couponCode?: string;
}) {
  const { to, status, ...emailData } = data;

  if (status === 'FREE') {
    return sendMembershipFreeEmail({
      to,
      name: emailData.name,
      planName: emailData.planName,
      couponCode: emailData.couponCode || '',
      startDate: emailData.startDate || '',
      endDate: emailData.endDate || '',
    });
  } else if (status === 'PENDING') {
    return sendMembershipPendingEmail({
      to,
      name: emailData.name,
      planName: emailData.planName,
      amount: emailData.amount,
      paymentReference: emailData.paymentReference,
      paymentMethod: emailData.paymentMethod,
    });
  } else if (status === 'ACTIVE') {
    return sendMembershipApprovedEmail({
      to,
      name: emailData.name,
      planName: emailData.planName,
      amount: emailData.amount,
      paymentReference: emailData.paymentReference,
      startDate: emailData.startDate || '',
      endDate: emailData.endDate || '',
    });
  }
}