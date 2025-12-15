'use client';

import { useState } from 'react';
import { useEmailSend } from '@/hooks/useEmailSend';

export default function TestEmailPage() {
  const { sendEmail, isSending, error } = useEmailSend();
  const [result, setResult] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'test' | 'membership-pending' | 'membership-free'>('test');

  const handleSendTestEmail = async () => {
    const emailData: Record<string, any> = {};

    if (selectedType === 'test') {
      emailData.firstName = 'John';
    } else if (selectedType === 'membership-pending') {
      emailData.name = 'John Doe';
      emailData.planName = 'Monthly Plan';
      emailData.amount = 4500;
      emailData.paymentReference = 'mb_kita2025_001';
      emailData.paymentMethod = 'GCASH';
    } else if (selectedType === 'membership-free') {
      emailData.name = 'Jane Smith';
      emailData.planName = 'Monthly Plan';
      emailData.couponCode = 'FREE2025';
      emailData.startDate = new Date().toISOString();
      emailData.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const response = await sendEmail({
      type: selectedType,
      to: 'delivered@resend.dev',
      data: emailData,
    });

    setResult(response);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Test Email Sending
        </h1>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Type:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="w-full px-3 py-2 border border-foreground/20 rounded-lg"
          >
            <option value="test">Test Email</option>
            <option value="membership-pending">Membership Pending</option>
            <option value="membership-free">Membership Free</option>
          </select>
        </div>
        
        <button
          onClick={handleSendTestEmail}
          disabled={isSending}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSending ? 'Sending...' : 'Send Test Email'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && result.success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            <p className="font-semibold">Success!</p>
            <p className="text-sm">Email sent to delivered@resend.dev</p>
          </div>
        )}
      </div>
    </div>
  );
}