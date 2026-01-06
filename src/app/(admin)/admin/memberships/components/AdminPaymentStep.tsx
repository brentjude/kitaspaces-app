'use client';

import { useState } from 'react';
import type { MembershipPlanWithPerks } from '@/types/membership';

interface FormData {
  name: string;
  email: string;
  password: string;
  company: string;
  contactNumber: string;
  birthdate: string;
  referralSource: string;
  agreeToNewsletter: boolean;
  selectedPlanId: string;
  couponCode: string;
  discount: number;
  customDuration?: number;
  paymentNote: string;
}

interface AdminPaymentStepProps {
  formData: FormData;
  plans: MembershipPlanWithPerks[];
  onSuccess: (memberId: string) => void;
  onBack: () => void;
}

export default function AdminPaymentStep({
  formData,
  plans,
  onSuccess,
  onBack,
}: AdminPaymentStepProps) {
  const [paymentNote, setPaymentNote] = useState(formData.paymentNote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedPlan = plans.find((p) => p.id === formData.selectedPlanId);
  const totalAmount = selectedPlan ? selectedPlan.price - formData.discount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentNote.trim()) {
      setError('Payment note is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/create-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            // Member details
            name: formData.name,
            email: formData.email,
            password: formData.password,
            company: formData.company,
            contactNumber: formData.contactNumber,
            birthdate: formData.birthdate,
            referralSource: formData.referralSource,
            agreeToNewsletter: formData.agreeToNewsletter,

            // Plan selection
            planId: formData.selectedPlanId,
            couponCode: formData.couponCode,
            customDuration: formData.customDuration, // ✅ ADD THIS

            // Payment
            paymentNote: `Added by Admin: ${paymentNote.trim()}`,
        }),
    });

      const result = await response.json();

      if (result.success && result.data) {
        onSuccess(result.data.userId);
      } else {
        setError(result.error || 'Failed to create member');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Order Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-foreground/60">Member Name:</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Email:</span>
            <span className="font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Plan:</span>
            <span className="font-medium">{selectedPlan?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Plan Price:</span>
            <span className="font-medium">
              ₱{selectedPlan?.price.toFixed(2)}
            </span>
          </div>
          {formData.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span className="font-medium">
                -₱{formData.discount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t border-foreground/20 pt-3">
            <span>Total Amount:</span>
            <span className="text-primary">₱{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="font-semibold text-blue-900">
            Payment Method: Cash
          </span>
        </div>
        <p className="text-sm text-blue-700">
          This member will be marked as paid via cash payment.
        </p>
      </div>

      {/* Payment Note */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Payment Note <span className="text-red-500">*</span>
        </label>
        <textarea
          value={paymentNote}
          onChange={(e) => {
            setPaymentNote(e.target.value);
            setError('');
          }}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-red-500' : 'border-foreground/20'
          }`}
          rows={4}
          placeholder="e.g., Paid cash at office, Receipt #12345"
          required
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <p className="text-xs text-foreground/60 mt-2">
          Note will be saved as: "Added by Admin: {paymentNote || '[your note]'}"
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors font-medium disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Member...' : 'Create Member'}
        </button>
      </div>
    </form>
  );
}