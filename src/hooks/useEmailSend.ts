import { useState } from 'react';

export type EmailType = 
  | 'membership-pending'
  | 'membership-free'
  | 'membership-approved'
  | 'event-confirmation'
  | 'test';

interface SendEmailParams {
  type: EmailType;
  to: string;
  data: Record<string, string | number | boolean | null | undefined>;
}

interface EmailSendResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface UseEmailSendReturn {
  sendEmail: (params: SendEmailParams) => Promise<EmailSendResult>;
  isSending: boolean;
  error: string | null;
}

export function useEmailSend(): UseEmailSendReturn {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (params: SendEmailParams): Promise<EmailSendResult> => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Email send error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendEmail,
    isSending,
    error,
  };
}