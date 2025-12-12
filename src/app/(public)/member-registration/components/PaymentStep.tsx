'use client';

import { useState } from 'react';
import {
  MembershipPlanPublic,
  PaymentSettingsPublic,
  CouponValidationResponse,
} from '@/types/membership-registration';
import { PaymentMethod } from '@/generated/prisma';
import {
  ArrowLeftIcon,
  TicketIcon,
  QrCodeIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface PaymentStepProps {
  selectedPlan: MembershipPlanPublic;
  quantity: number;
  baseAmount: number;
  totalAmount: number;
  discountAmount: number;
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => Promise<void>;
  onRemoveCoupon: () => void;
  appliedCoupon: CouponValidationResponse['coupon'] | null;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  referenceNumber: string;
  onReferenceNumberChange: (value: string) => void;
  proofImageUrl: string;
  onProofImageUrlChange: (url: string) => void;
  paymentSettings: PaymentSettingsPublic;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isCouponLoading: boolean;
}

export default function PaymentStep({
  selectedPlan,
  quantity,
  baseAmount,
  totalAmount,
  discountAmount,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  paymentMethod,
  onPaymentMethodChange,
  referenceNumber,
  onReferenceNumberChange,
  proofImageUrl,
  onProofImageUrlChange,
  paymentSettings,
  onBack,
  onSubmit,
  isSubmitting,
  isCouponLoading,
}: PaymentStepProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/public/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();

      // Use secure_url from the response
      if (data.success && data.data?.secure_url) {
        onProofImageUrlChange(data.data.secure_url);
      } else {
        throw new Error('Invalid response from upload endpoint');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (totalAmount > 0 && !referenceNumber) {
      alert('Please enter a payment reference number');
      return;
    }

    if (totalAmount > 0 && !proofImageUrl && paymentMethod !== 'CASH') {
      alert('Please upload payment proof');
      return;
    }

    await onSubmit();
  };

  const renderPaymentMethodDetails = () => {
    switch (paymentMethod) {
      case 'GCASH':
        return (
          <div className="mt-4 bg-white border border-foreground/20 rounded-xl p-6">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-foreground mb-2">
                Scan QR Code with GCash App
              </p>
              <div className="inline-block p-4 bg-gray-50 rounded-lg border border-foreground/10">
                {paymentSettings.qrCodeUrl ? (
                  <div className="relative w-48 h-48">
                    <Image
                      src={paymentSettings.qrCodeUrl}
                      alt="GCash QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                    <QrCodeIcon className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
              {paymentSettings.qrCodeNumber && (
                <p className="text-sm text-foreground/60 mt-2">
                  Or send to:{' '}
                  <span className="font-mono font-semibold">
                    {paymentSettings.qrCodeNumber}
                  </span>
                </p>
              )}
            </div>
          </div>
        );

      case 'BANK_TRANSFER':
        return (
          <div className="mt-4 bg-white border border-foreground/20 rounded-xl p-6">
            <p className="text-sm font-semibold text-foreground mb-3">
              Bank Transfer Details
            </p>
            <div className="bg-foreground/5 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-xs text-foreground/60">Bank Name</p>
                <p className="font-semibold text-foreground">
                  {paymentSettings.bankName || 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/60">Account Number</p>
                <p className="font-mono text-lg font-semibold text-foreground tracking-wider">
                  {paymentSettings.accountNumber || 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground/60">Account Name</p>
                <p className="font-semibold text-foreground">
                  {paymentSettings.accountName || 'Not available'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'CASH':
        return (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-3">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-foreground mb-2">Pay at Counter</h4>
            <p className="text-sm text-foreground/60">
              Please proceed to our counter to complete your payment. Show your
              registration confirmation.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Payment</h2>
      <p className="text-foreground/60 mb-8">
        Complete your membership registration
      </p>

      {/* Order Summary */}
      <div className="bg-foreground/5 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-foreground/60">
              {selectedPlan.name} × {quantity}
            </span>
            <span className="font-semibold text-foreground">
              ₱{baseAmount.toFixed(2)}
            </span>
          </div>

          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between items-center text-sm text-green-600">
              <span className="flex items-center">
                <TicketIcon className="w-4 h-4 mr-1" />
                Coupon: {appliedCoupon.code}
              </span>
              <span className="font-semibold">
                -₱{discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-foreground/20 flex justify-between items-center">
            <span className="font-bold text-foreground text-lg">Total</span>
            <span className="font-bold text-primary text-2xl">
              ₱{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Coupon Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Have a coupon code?
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <TicketIcon className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Enter coupon code"
              className="w-full pl-10 pr-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase"
              value={couponCode}
              onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
              disabled={!!appliedCoupon || isCouponLoading}
            />
          </div>
          {appliedCoupon ? (
            <button
              onClick={onRemoveCoupon}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onApplyCoupon}
              disabled={!couponCode || isCouponLoading}
              className="px-6 py-2 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCouponLoading ? 'Checking...' : 'Apply'}
            </button>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      {totalAmount > 0 && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onPaymentMethodChange('GCASH')}
                disabled={isUploading}
                className={`p-4 rounded-lg border-2 text-sm flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentMethod === 'GCASH'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-foreground/10 text-foreground/60 hover:border-foreground/20'
                }`}
              >
                <QrCodeIcon className="w-6 h-6" />
                <span className="font-medium">GCash</span>
              </button>

              <button
                onClick={() => onPaymentMethodChange('BANK_TRANSFER')}
                disabled={isUploading}
                className={`p-4 rounded-lg border-2 text-sm flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-foreground/10 text-foreground/60 hover:border-foreground/20'
                }`}
              >
                <BuildingLibraryIcon className="w-6 h-6" />
                <span className="font-medium">Bank</span>
              </button>

              <button
                onClick={() => onPaymentMethodChange('CREDIT_CARD')}
                disabled={isUploading}
                className={`p-4 rounded-lg border-2 text-sm flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-foreground/10 text-foreground/60 hover:border-foreground/20'
                }`}
              >
                <CreditCardIcon className="w-6 h-6" />
                <span className="font-medium">Card</span>
              </button>

              <button
                onClick={() => onPaymentMethodChange('CASH')}
                disabled={isUploading}
                className={`p-4 rounded-lg border-2 text-sm flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentMethod === 'CASH'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-foreground/10 text-foreground/60 hover:border-foreground/20'
                }`}
              >
                <BanknotesIcon className="w-6 h-6" />
                <span className="font-medium">Cash</span>
              </button>
            </div>

            {renderPaymentMethodDetails()}
          </div>

          {/* Payment Reference */}
          {paymentMethod !== 'CASH' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Reference Number{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your transaction reference number"
                  className="w-full px-4 py-2.5 border border-foreground/20 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-foreground/5 disabled:cursor-not-allowed"
                  value={referenceNumber}
                  onChange={(e) => onReferenceNumberChange(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              {/* Payment Proof Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload Payment Proof{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isUploading
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-foreground/20 hover:border-foreground/30'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center py-8">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-medium text-primary mb-1">
                        Uploading your payment proof...
                      </p>
                      <p className="text-xs text-foreground/60">
                        Please wait, this may take a few moments
                      </p>
                    </div>
                  ) : proofImageUrl ? (
                    <div className="relative">
                      <div className="relative w-full h-64 mb-3">
                        <Image
                          src={proofImageUrl}
                          alt="Payment Proof"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="inline-flex items-center text-sm text-green-600 font-medium">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Image uploaded successfully
                        </span>
                        <button
                          onClick={() => onProofImageUrlChange('')}
                          className="text-sm text-red-500 hover:text-red-600 font-medium"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center">
                        <ArrowUpTrayIcon className="w-12 h-12 text-foreground/40 mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          Click to upload payment proof
                        </p>
                        <p className="text-xs text-foreground/60">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {totalAmount === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-foreground mb-1">
            Free Membership!
          </p>
          <p className="text-sm text-foreground/60">
            Your coupon covers the full amount. Click submit to complete your
            registration.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={isSubmitting || isUploading}
          className="px-6 py-3 text-foreground font-medium hover:bg-foreground/5 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Uploading...
            </>
          ) : totalAmount === 0 ? (
            'Complete Registration'
          ) : (
            `Pay ₱${totalAmount.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
}