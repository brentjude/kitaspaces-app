'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  CheckCircleIcon,
  QrCodeIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

interface RenewMembershipModalProps {
  isOpen: boolean;
  userId: string;
  planId: string;
  planName: string;
  planPrice: number;
  planDurationDays: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentSettings {
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  qrCodeUrl: string | null;
  qrCodeNumber: string | null;
}

type PaymentMethodOption = 'GCASH' | 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD';

const PAYMENT_METHODS: { value: PaymentMethodOption; label: string; icon: React.ReactNode }[] = [
  { value: 'GCASH', label: 'GCash / QR', icon: <QrCodeIcon className="w-5 h-5" /> },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: <BuildingLibraryIcon className="w-5 h-5" /> },
  { value: 'CASH', label: 'Cash', icon: <BanknotesIcon className="w-5 h-5" /> },
  { value: 'CREDIT_CARD', label: 'Card', icon: <CreditCardIcon className="w-5 h-5" /> },
];

export default function RenewMembershipModal({
  isOpen,
  userId,
  planId,
  planName,
  planPrice,
  planDurationDays,
  onClose,
  onSuccess,
}: RenewMembershipModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPaymentSettings();
    }
  }, [isOpen]);

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch('/api/public/payment-settings');
      const data = await res.json();
      if (data.success && data.data) {
        setPaymentSettings(data.data);
      }
    } catch (err) {
      console.error('Failed to load payment settings:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/public/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      if (data.success && data.data?.secure_url) {
        setProofImageUrl(data.data.secure_url);
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isUploading) return;
    setPaymentMethod('CASH');
    setReferenceNumber('');
    setProofImageUrl('');
    setNotes('');
    setError('');
    setIsSuccess(false);
    setSuccessMessage('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if ((paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && !referenceNumber.trim()) {
      setError('Reference number is required for GCash and Bank Transfer payments.');
      return;
    }

    if ((paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && !proofImageUrl) {
      setError('Please upload proof of payment for GCash and Bank Transfer.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/members/${userId}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          paymentMethod,
          referenceNumber: referenceNumber.trim() || null,
          proofImageUrl: proofImageUrl || null,
          notes: notes.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to renew membership');
      }

      setSuccessMessage(result.data.message);
      setIsSuccess(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to renew membership');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaymentDetails = () => {
    if (paymentMethod === 'GCASH' && paymentSettings) {
      return (
        <div className="mt-3 bg-white border border-foreground/20 rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-3">GCash / QR Payment Details</p>
          <div className="flex flex-col items-center gap-3">
            {paymentSettings.qrCodeNumber && (
              <p className="text-sm text-foreground/70">
                Number: <span className="font-bold text-foreground">{paymentSettings.qrCodeNumber}</span>
              </p>
            )}
            {paymentSettings.qrCodeUrl ? (
              <div className="relative w-40 h-40 border border-foreground/10 rounded-lg overflow-hidden">
                <Image
                  src={paymentSettings.qrCodeUrl}
                  alt="GCash QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCodeIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (paymentMethod === 'BANK_TRANSFER' && paymentSettings) {
      return (
        <div className="mt-3 bg-white border border-foreground/20 rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Bank Transfer Details</p>
          <div className="bg-foreground/5 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-xs text-foreground/60">Bank Name</p>
              <p className="font-semibold text-foreground">{paymentSettings.bankName || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-xs text-foreground/60">Account Number</p>
              <p className="font-mono text-lg font-semibold text-foreground tracking-wider">
                {paymentSettings.accountNumber || 'Not configured'}
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground/60">Account Name</p>
              <p className="font-semibold text-foreground">{paymentSettings.accountName || 'Not configured'}</p>
            </div>
          </div>
        </div>
      );
    }

    if (paymentMethod === 'CASH' || paymentMethod === 'CREDIT_CARD') {
      return (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full text-blue-600 mb-2">
            {paymentMethod === 'CASH' ? (
              <BanknotesIcon className="w-6 h-6" />
            ) : (
              <CreditCardIcon className="w-6 h-6" />
            )}
          </div>
          <p className="text-sm font-semibold text-foreground">
            {paymentMethod === 'CASH' ? 'Cash Payment' : 'Card Payment'}
          </p>
          <p className="text-xs text-foreground/60 mt-1">
            Confirm that payment has been received before submitting.
          </p>
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-foreground/10">
          <h2 className="text-lg font-bold text-foreground">Renew Membership</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
            className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Membership Renewed!</h3>
            <p className="text-foreground/60 max-w-xs mx-auto">{successMessage}</p>
            <button
              onClick={handleClose}
              className="mt-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Plan Summary */}
            <div className="bg-foreground/5 rounded-xl p-4">
              <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Renewing Plan</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">{planName}</p>
                  <p className="text-xs text-foreground/60 mt-0.5">{planDurationDays} days</p>
                </div>
                <p className="text-xl font-bold text-primary">₱{planPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.value);
                      setReferenceNumber('');
                      setProofImageUrl('');
                      setError('');
                    }}
                    disabled={isUploading}
                    className={`p-3 rounded-lg border-2 text-xs flex flex-col items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${
                      paymentMethod === method.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-foreground/10 text-foreground/60 hover:border-foreground/20'
                    }`}
                  >
                    {method.icon}
                    <span className="font-medium">{method.label}</span>
                  </button>
                ))}
              </div>

              {renderPaymentDetails()}
            </div>

            {/* Reference Number — GCash / Bank Transfer */}
            {(paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Payment Reference Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter transaction reference number"
                  disabled={isUploading}
                  className="w-full px-4 py-2.5 border border-foreground/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-foreground/5 disabled:cursor-not-allowed"
                />
              </div>
            )}

            {/* Proof of Payment — GCash / Bank Transfer */}
            {(paymentMethod === 'GCASH' || paymentMethod === 'BANK_TRANSFER') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Proof of Payment <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
                  isUploading ? 'border-primary/50 bg-primary/5' : 'border-foreground/20 hover:border-foreground/30'
                }`}>
                  {isUploading ? (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm text-foreground/60">Uploading...</p>
                    </div>
                  ) : proofImageUrl ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-40 rounded-lg overflow-hidden">
                        <Image src={proofImageUrl} alt="Proof of payment" fill className="object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setProofImageUrl('')}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove and re-upload
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-1 py-4">
                        <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center mb-1">
                          <CreditCardIcon className="w-5 h-5 text-foreground/40" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Click to upload payment proof</p>
                        <p className="text-xs text-foreground/50">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this renewal..."
                rows={2}
                className="w-full px-4 py-2.5 border border-foreground/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isUploading}
                className="flex-1 py-2.5 border border-foreground/20 text-foreground/70 font-medium rounded-lg text-sm hover:bg-foreground/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : `Renew — ₱${planPrice.toFixed(2)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
