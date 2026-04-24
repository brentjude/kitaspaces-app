'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import ProofOfPaymentUpload from '@/app/components/ProofOfPaymentUpload';

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  type: 'MONTHLY' | 'DAILY';
  price: number;
  durationDays: number;
  perks: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }>;
}

interface PaymentSettings {
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  qrCodeUrl: string | null;
  qrCodeNumber: string | null;
}

interface RenewMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethodOption = 'GCASH' | 'BANK_TRANSFER' | 'CASH';

export default function RenewMembershipModal({
  isOpen,
  onClose,
  onSuccess,
}: RenewMembershipModalProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>('GCASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoadingPlans(true);
    try {
      const [plansRes, settingsRes] = await Promise.all([
        fetch('/api/public/membership-plans'),
        fetch('/api/public/payment-settings'),
      ]);

      const plansData = await plansRes.json();
      if (plansData.success) {
        setPlans(plansData.data);
        if (plansData.data.length > 0) {
          setSelectedPlanId(plansData.data[0].id);
        }
      }

      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.data) {
        setPaymentSettings(settingsData.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedPlanId('');
    setPaymentMethod('GCASH');
    setReferenceNumber('');
    setProofImageUrl('');
    setNotes('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedPlanId) {
      setError('Please select a membership plan.');
      return;
    }

    if (paymentMethod !== 'CASH' && !referenceNumber.trim()) {
      setError('Please provide a payment reference number.');
      return;
    }

    if ((paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && !proofImageUrl) {
      setError('Please upload proof of payment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          paymentMethod,
          referenceNumber: referenceNumber.trim() || null,
          proofImageUrl: proofImageUrl || null,
          notes: notes.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit renewal');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit renewal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Renew Membership</h2>
              <p className="text-sm text-gray-500">Select a plan and submit your payment</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {isLoadingPlans ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Plan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedPlanId === plan.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{plan.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{plan.durationDays} days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₱{plan.price.toFixed(2)}</p>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                          {plan.type}
                        </span>
                      </div>
                    </div>
                    {plan.perks.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {plan.perks.slice(0, 2).map((perk) => (
                          <li key={perk.id} className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="text-primary">•</span>
                            {perk.quantity > 0 ? `${perk.name} (${perk.quantity} ${perk.unit})` : perk.name}
                          </li>
                        ))}
                        {plan.perks.length > 2 && (
                          <li className="text-xs text-gray-400">+{plan.perks.length - 2} more</li>
                        )}
                      </ul>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            {selectedPlan && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">Order Summary</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{selectedPlan.name}</span>
                  <span className="font-bold text-gray-900">₱{selectedPlan.price.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="flex gap-3">
                {(['GCASH', 'BANK_TRANSFER', 'CASH'] as PaymentMethodOption[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      paymentMethod === method
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {method === 'GCASH' ? 'GCash' : method === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash'}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Info (GCash / Bank) */}
            {paymentSettings && paymentMethod === 'GCASH' && (paymentSettings.qrCodeUrl || paymentSettings.qrCodeNumber) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-800">GCash Payment Details</p>
                </div>
                {paymentSettings.qrCodeNumber && (
                  <p className="text-sm text-blue-700">
                    Number: <span className="font-bold">{paymentSettings.qrCodeNumber}</span>
                  </p>
                )}
                {paymentSettings.qrCodeUrl && (
                  <div className="relative w-80 h-80">
                    <Image
                      src={paymentSettings.qrCodeUrl}
                      alt="GCash QR Code"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {paymentSettings && paymentMethod === 'BANK_TRANSFER' && paymentSettings.bankName && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-800">Bank Transfer Details</p>
                </div>
                <p className="text-sm text-blue-700">Bank: <span className="font-bold">{paymentSettings.bankName}</span></p>
                {paymentSettings.accountNumber && (
                  <p className="text-sm text-blue-700">Account No: <span className="font-bold">{paymentSettings.accountNumber}</span></p>
                )}
                {paymentSettings.accountName && (
                  <p className="text-sm text-blue-700">Account Name: <span className="font-bold">{paymentSettings.accountName}</span></p>
                )}
              </div>
            )}

            {/* Reference Number */}
            {paymentMethod !== 'CASH' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Reference Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter your transaction reference number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}

            {/* Proof of Payment */}
            <ProofOfPaymentUpload
              value={proofImageUrl}
              onChange={setProofImageUrl}
              label={paymentMethod === 'CASH' ? 'Proof of Payment (Optional)' : 'Proof of Payment *'}
              helpText="Upload a screenshot or photo of your payment confirmation"
            />

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes for the admin..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedPlanId}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Renewal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
