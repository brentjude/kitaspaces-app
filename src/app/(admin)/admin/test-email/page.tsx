'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEmailSend, EmailType } from '@/hooks/useEmailSend';

interface EmailResult {
  success: boolean;
  error?: string;
  message?: string;
}

export default function TestEmailPage() {
  const { data: session, status } = useSession();
  const { sendEmail, isSending, error } = useEmailSend();
  const [result, setResult] = useState<EmailResult | null>(null);
  const [selectedType, setSelectedType] = useState<EmailType>('test');
  const [recipientEmail, setRecipientEmail] = useState('delivered@resend.dev');

  // Protect route - only admins can access
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const handleSendTestEmail = async () => {
    setResult(null);

    const emailData: Record<string, string | number> = {};

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
    } else if (selectedType === 'membership-approved') {
      emailData.name = 'John Doe';
      emailData.planName = 'Monthly Plan';
      emailData.amount = 4500;
      emailData.paymentReference = 'mb_kita2025_001';
      emailData.startDate = new Date().toISOString();
      emailData.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    const response = await sendEmail({
      type: selectedType,
      to: recipientEmail,
      data: emailData,
    });

    setResult(response);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Email Testing
          </h1>
          <p className="text-foreground/60">
            Test email templates and delivery (Admin Only)
          </p>
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Template Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as EmailType)}
              className="w-full px-4 py-2.5 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="test">Test Email (Generic Welcome)</option>
              <option value="membership-pending">Membership - Payment Pending</option>
              <option value="membership-free">Membership - Free Registration</option>
              <option value="membership-approved">Membership - Payment Approved</option>
              <option value="event-confirmation">Event Registration Confirmation</option>
            </select>
            <p className="mt-2 text-sm text-foreground/60">
              Select the email template you want to test
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-2.5 border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <p className="mt-2 text-sm text-foreground/60">
              Use <span className="font-mono font-medium">delivered@resend.dev</span> for Resend test inbox
            </p>
          </div>

          {/* Template Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Template Preview</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {selectedType === 'test' && (
                <>
                  <p>• Generic welcome email with sample data</p>
                  <p>• Recipient: John</p>
                </>
              )}
              {selectedType === 'membership-pending' && (
                <>
                  <p>• Membership registration with pending payment</p>
                  <p>• Name: John Doe</p>
                  <p>• Plan: Monthly Plan (₱4,500)</p>
                  <p>• Payment: GCASH</p>
                </>
              )}
              {selectedType === 'membership-free' && (
                <>
                  <p>• Free membership with coupon code</p>
                  <p>• Name: Jane Smith</p>
                  <p>• Plan: Monthly Plan</p>
                  <p>• Coupon: FREE2025</p>
                  <p>• Duration: 30 days</p>
                </>
              )}
              {selectedType === 'membership-approved' && (
                <>
                  <p>• Membership payment confirmed</p>
                  <p>• Name: John Doe</p>
                  <p>• Plan: Monthly Plan (₱4,500)</p>
                  <p>• Duration: 30 days</p>
                </>
              )}
              {selectedType === 'event-confirmation' && (
                <p className="text-yellow-700">⚠️ Template placeholder - not yet implemented</p>
              )}
            </div>
          </div>

          <button
            onClick={handleSendTestEmail}
            disabled={isSending || !recipientEmail}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Test Email'
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {result && result.success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-green-900">Success!</p>
                  <p className="text-sm text-green-800 mt-1">
                    Email sent successfully to <span className="font-medium">{recipientEmail}</span>
                  </p>
                  {result.message && (
                    <p className="text-sm text-green-700 mt-2">{result.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📧 Email Testing Notes</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>All templates use KITA Spaces branding (#FF8E49)</li>
            <li>Logo: community.kitaspaces.com/logo/kita-primary-logo.png</li>
            <li>Use Resend test email: delivered@resend.dev</li>
            <li>Check Resend dashboard for delivery status</li>
            <li>Test data is hardcoded for preview purposes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}