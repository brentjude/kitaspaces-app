import { useEmailSend } from './useEmailSend';

interface MembershipEmailData {
  to: string;
  name: string;
  planName: string;
  amount: number;
  paymentReference: string;
  paymentMethod: string;
  startDate?: string;
  endDate?: string;
  couponCode?: string;
}

export function useMembershipEmails() {
  const { sendEmail, isSending, error } = useEmailSend();

  const sendPendingPaymentEmail = async (data: MembershipEmailData) => {
    return sendEmail({
      type: 'membership-pending',
      to: data.to,
      data: {
        name: data.name,
        planName: data.planName,
        amount: data.amount,
        paymentReference: data.paymentReference,
        paymentMethod: data.paymentMethod,
      },
    });
  };

  const sendFreeRegistrationEmail = async (
    data: Omit<MembershipEmailData, 'amount' | 'paymentMethod'> & {
      couponCode: string;
      startDate: string;
      endDate: string;
    }
  ) => {
    return sendEmail({
      type: 'membership-free',
      to: data.to,
      data: {
        name: data.name,
        planName: data.planName,
        couponCode: data.couponCode,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  };

  const sendPaymentApprovedEmail = async (
    data: Omit<MembershipEmailData, 'paymentMethod'> & {
      startDate: string;
      endDate: string;
    }
  ) => {
    return sendEmail({
      type: 'membership-approved',
      to: data.to,
      data: {
        name: data.name,
        planName: data.planName,
        amount: data.amount,
        paymentReference: data.paymentReference,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  };

  return {
    sendPendingPaymentEmail,
    sendFreeRegistrationEmail,
    sendPaymentApprovedEmail,
    isSending,
    error,
  };
}