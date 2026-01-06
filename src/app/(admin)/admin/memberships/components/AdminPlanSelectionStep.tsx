'use client';

import { useState } from 'react';
import { CheckIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import type { MembershipPlanWithPerks } from '@/types/membership';

interface FormData {
  selectedPlanId: string;
  couponCode: string;
  discount: number;
  customDuration?: number;
}

interface AdminPlanSelectionStepProps {
  formData: FormData;
  plans: MembershipPlanWithPerks[];
  onNext: (data: FormData) => void;
  onBack: () => void;
}

export default function AdminPlanSelectionStep({
  formData,
  plans,
  onNext,
  onBack,
}: AdminPlanSelectionStepProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(formData.selectedPlanId);
  const [couponCode, setCouponCode] = useState(formData.couponCode);
  const [discount, setDiscount] = useState(formData.discount);
  const [customDuration, setCustomDuration] = useState<number | undefined>(
    formData.customDuration
  );
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
  } | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const getDurationText = (plan: MembershipPlanWithPerks): string => {
    if (plan.type === 'MONTHLY') {
      const months = plan.durationDays / 30;
      return `${months} ${months === 1 ? 'Month' : 'Months'}`;
    } else if (plan.type === 'DAILY') {
      return `${plan.durationDays} ${plan.durationDays === 1 ? 'Day' : 'Days'}`;
    }
    return `${plan.durationDays} Days`;
  };

  const getDurationUnit = (plan: MembershipPlanWithPerks): string => {
    return plan.type === 'MONTHLY' ? 'month(s)' : 'day(s)';
  };

  const getDefaultDuration = (plan: MembershipPlanWithPerks): number => {
    if (plan.type === 'MONTHLY') {
      return plan.durationDays / 30;
    }
    return plan.durationDays;
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      setCouponSuccess('');
      return;
    }

    if (!selectedPlanId) {
      setCouponError('Please select a plan first');
      setCouponSuccess('');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      // ✅ Use admin-specific route
      const response = await fetch('/api/admin/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const selectedPlan = plans.find((p) => p.id === selectedPlanId);
        if (selectedPlan) {
          let discountAmount = 0;
          
          if (result.data.discountType === 'PERCENTAGE') {
            discountAmount = (selectedPlan.price * result.data.discountValue) / 100;
          } else if (result.data.discountType === 'FIXED_AMOUNT') {
            discountAmount = result.data.discountValue;
          } else if (result.data.discountType === 'FREE') {
            discountAmount = selectedPlan.price;
          }

          // Ensure discount doesn't exceed plan price
          discountAmount = Math.min(discountAmount, selectedPlan.price);

          setDiscount(discountAmount);
          setAppliedCoupon({
            code: result.data.code,
            discountType: result.data.discountType,
            discountValue: result.data.discountValue,
          });
          
          const discountText = 
            result.data.discountType === 'PERCENTAGE'
              ? `${result.data.discountValue}% discount`
              : result.data.discountType === 'FIXED_AMOUNT'
              ? `₱${result.data.discountValue} discount`
              : '100% (Free)';
          
          setCouponSuccess(`✓ Coupon applied! ${discountText}`);
        }
      } else {
        setCouponError(result.error || 'Invalid coupon code');
        setDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      setCouponError('Failed to validate coupon. Please try again.');
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
  };

  const handleNext = () => {
    if (!selectedPlanId) {
      setError('Please select a membership plan');
      return;
    }

    if (customDuration !== undefined && customDuration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }

    onNext({
      selectedPlanId,
      couponCode: appliedCoupon?.code || '',
      discount,
      customDuration,
    });
  };

  return (
    <div className="space-y-6">
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans
          .filter((plan) => plan.isActive)
          .map((plan) => (
            <div
              key={plan.id}
              onClick={() => {
                setSelectedPlanId(plan.id);
                setError('');
                // Reset coupon when changing plans
                if (appliedCoupon) {
                  handleRemoveCoupon();
                }
                setCustomDuration(getDefaultDuration(plan));
              }}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlanId === plan.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-foreground/10 hover:border-primary/50'
              }`}
            >
              {selectedPlanId === plan.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold text-primary mb-4">
                ₱{plan.price.toLocaleString()}
                <span className="text-sm text-foreground/60 font-normal">
                  /{plan.type === 'MONTHLY' ? 'month' : 'day'}
                </span>
              </p>

              {/* Duration Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-4">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Default: {getDurationText(plan)}
                </span>
              </div>

              {plan.description && (
                <p className="text-sm text-foreground/60 mb-4">
                  {plan.description}
                </p>
              )}

              {/* Perks */}
              {plan.perks && plan.perks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Included Perks:
                  </p>
                  <ul className="space-y-1">
                    {plan.perks.slice(0, 4).map((perk) => (
                      <li
                        key={perk.id}
                        className="text-sm text-foreground/80 flex items-start gap-2"
                      >
                        <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {perk.quantity === 0 ? (
                          <span>{perk.name}</span>
                        ) : (
                          <span>
                            {perk.quantity} {perk.unit} - {perk.name}
                          </span>
                        )}
                      </li>
                    ))}
                    {plan.perks.length > 4 && (
                      <li className="text-xs text-foreground/40 pl-6">
                        + {plan.perks.length - 4} more perks
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Custom Duration Input */}
      {selectedPlanId && selectedPlan && (
        <div className="p-6 bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-amber-600" />
            <label className="text-base font-bold text-foreground">
              Membership Duration
            </label>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              value={customDuration ?? ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setCustomDuration(value > 0 ? value : undefined);
                setError('');
              }}
              className="w-32 px-4 py-2.5 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold text-lg"
              placeholder={getDefaultDuration(selectedPlan).toString()}
            />
            <span className="text-base font-semibold text-foreground">
              {getDurationUnit(selectedPlan)}
            </span>
          </div>
          
          <div className="mt-3 space-y-1">
            <p className="text-sm text-amber-700">
              💡 Default: {getDurationText(selectedPlan)}. Customize for this member.
            </p>
            {customDuration && (
              <p className="text-sm text-green-700 font-medium">
                ✓ Member will have access for{' '}
                {selectedPlan.type === 'MONTHLY'
                  ? `${customDuration} ${customDuration === 1 ? 'month' : 'months'} (${customDuration * 30} days)`
                  : `${customDuration} ${customDuration === 1 ? 'day' : 'days'}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Coupon Code Section */}
      {selectedPlanId && (
        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-5 h-5 text-primary" />
            <label className="text-base font-bold text-foreground">
              Have a Coupon Code? (Optional)
            </label>
          </div>

          {appliedCoupon ? (
            // Show applied coupon
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-green-900 text-lg">
                      {appliedCoupon.code}
                    </span>
                    <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs font-semibold rounded">
                      Applied
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    {appliedCoupon.discountType === 'PERCENTAGE'
                      ? `${appliedCoupon.discountValue}% discount`
                      : appliedCoupon.discountType === 'FIXED_AMOUNT'
                      ? `₱${appliedCoupon.discountValue} discount`
                      : 'Free membership (100% off)'}
                  </p>
                  <p className="text-sm font-semibold text-green-900 mt-1">
                    You save: ₱{discount.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            // Show coupon input
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError('');
                    setCouponSuccess('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleValidateCoupon();
                    }
                  }}
                  placeholder="Enter coupon code (e.g., SUMMER2025)"
                  className={`flex-1 px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 font-mono uppercase ${
                    couponError
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : couponSuccess
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                >
                  {isValidatingCoupon ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Checking...
                    </div>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>

              {couponError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{couponError}</p>
                </div>
              )}

              {couponSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-green-700 font-medium">{couponSuccess}</p>
                </div>
              )}

              <p className="text-xs text-foreground/60">
                💡 Tip: Coupon codes are case-insensitive and will be automatically converted to uppercase
              </p>
            </div>
          )}
        </div>
      )}

      {/* Price Summary */}
      {selectedPlan && (
        <div className="p-6 bg-linear-to-br from-primary/5 to-orange-50 rounded-xl border-2 border-primary/20 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">Plan:</span>
              <span className="font-semibold text-foreground">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">Duration:</span>
              <span className="font-semibold text-foreground">
                {customDuration 
                  ? `${customDuration} ${getDurationUnit(selectedPlan)}`
                  : getDurationText(selectedPlan)
                }
                {customDuration && selectedPlan.type === 'MONTHLY' && (
                  <span className="text-foreground/60 ml-1">
                    ({customDuration * 30} days)
                  </span>
                )}
              </span>
            </div>
            <div className="border-t-2 border-primary/20 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Plan Price:</span>
                <span className="font-semibold text-foreground">
                  ₱{selectedPlan.price.toFixed(2)}
                </span>
              </div>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <TagIcon className="w-4 h-4" />
                  Discount:
                </span>
                <span className="font-semibold text-green-600">
                  -₱{discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t-2 border-primary/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">Total Amount:</span>
                <span className="text-2xl font-extrabold text-primary">
                  ₱{(selectedPlan.price - discount).toFixed(2)}
                </span>
              </div>
            </div>
            {discount > 0 && (
              <div className="pt-2 border-t border-primary/10">
                <p className="text-xs text-green-700 font-medium text-center">
                  🎉 You're saving ₱{discount.toFixed(2)} with this coupon!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-foreground/10">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 border-2 border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors font-semibold"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedPlanId}
          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Payment →
        </button>
      </div>
    </div>
  );
}