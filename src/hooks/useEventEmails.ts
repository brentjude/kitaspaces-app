import { useEmailSend } from './useEmailSend';

interface EventEmailData {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  ticketCount: number;
  totalAmount: number;
  paymentReference: string;
}

export function useEventEmails() {
  const { sendEmail, isSending, error } = useEmailSend();

  const sendEventConfirmationEmail = async (data: EventEmailData) => {
    return sendEmail({
      type: 'event-confirmation',
      to: data.to,
      data: {
        name: data.name,
        eventTitle: data.eventTitle,
        eventDate: data.eventDate,
        ticketCount: data.ticketCount,
        totalAmount: data.totalAmount,
        paymentReference: data.paymentReference,
      },
    });
  };

  return {
    sendEventConfirmationEmail,
    isSending,
    error,
  };
}