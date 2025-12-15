import { Resend } from 'resend';
import { MembershipPendingPaymentEmail } from '@/app/components/email-template/MembershipPendingPaymentEmail';
import { MembershipFreeRegistrationEmail } from '@/app/components/email-template/MembershipFreeRegistrationEmail';
import { MembershipPaymentApprovedEmail } from '@/app/components/email-template/MembershipPaymentApprovedEmail';
import { EmailTemplate } from '@/app/components/email-template/EmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'KITA Spaces <onboarding@resend.dev>',
      to: [to],
      subject,
      react,
    });

    if (error) {
      console.error('Email sending error:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Membership Pending Payment Email
export async function sendMembershipPendingEmail(data: {
  to: string;
  name: string;
  planName: string;
  amount: number;
  paymentReference: string;
  paymentMethod: string;
}) {
  return sendEmail({
    to: data.to,
    subject: '⏳ Registration Received - Payment Verification Pending',
    react: MembershipPendingPaymentEmail({
      name: data.name,
      planName: data.planName,
      amount: data.amount,
      paymentReference: data.paymentReference,
      paymentMethod: data.paymentMethod,
    }),
  });
}

// Membership Free Registration Email
export async function sendMembershipFreeEmail(data: {
  to: string;
  name: string;
  planName: string;
  couponCode: string;
  startDate: string;
  endDate: string;
}) {
  return sendEmail({
    to: data.to,
    subject: '🎉 Welcome to KITA Spaces! Your Membership is Active',
    react: MembershipFreeRegistrationEmail({
      name: data.name,
      planName: data.planName,
      couponCode: data.couponCode,
      startDate: data.startDate,
      endDate: data.endDate,
    }),
  });
}

// Membership Payment Approved Email
export async function sendMembershipApprovedEmail(data: {
  to: string;
  name: string;
  planName: string;
  amount: number;
  paymentReference: string;
  startDate: string;
  endDate: string;
}) {
  return sendEmail({
    to: data.to,
    subject: '✅ Payment Confirmed - Welcome to KITA Spaces!',
    react: MembershipPaymentApprovedEmail({
      name: data.name,
      planName: data.planName,
      amount: data.amount,
      paymentReference: data.paymentReference,
      startDate: data.startDate,
      endDate: data.endDate,
    }),
  });
}

// Test Email
export async function sendTestEmail(data: {
  to: string;
  firstName: string;
}) {
  return sendEmail({
    to: data.to,
    subject: 'Hello from KITA Spaces',
    react: EmailTemplate({ firstName: data.firstName }),
  });
}

// Event Confirmation Email (placeholder for future use)
export async function sendEventConfirmationEmail(data: {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  ticketCount: number;
  totalAmount: number;
  paymentReference: string;
}) {
  // TODO: Create EventConfirmationEmail template
  return sendEmail({
    to: data.to,
    subject: `✅ Event Registration Confirmed - ${data.eventTitle}`,
    react: EmailTemplate({ firstName: data.name }), // Temporary, replace with proper template
  });
}