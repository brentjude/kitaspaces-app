'use client';

import { useState } from 'react';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { MembershipPlanWithPerks } from '@/types/membership';

interface FormData {
  selectedPlanId: string;
  couponCode: string;
  discount: number;
  customDuration?: number; // ✅ Add custom duration
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
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [error, setError] = useState('');

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
      return;
    }

    if (!selectedPlanId) {
      setCouponError('Please select a plan first');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const response = await fetch('/api/public/membership-validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const selectedPlan = plans.find((p) => p.id === selectedPlanId);
        if (selectedPlan) {
          const discountAmount =
            result.data.discountType === 'PERCENTAGE'
              ? (selectedPlan.price * result.data.discountValue) / 100
              : result.data.discountValue;

          setDiscount(discountAmount);
          alert('Coupon applied successfully!');
        }
      } else {
        setCouponError(result.error || 'Invalid coupon code');
        setDiscount(0);
      }
    } catch {
      setCouponError('Failed to validate coupon');
      setDiscount(0);
    } finally {
      setIsValidatingCoupon(false);
    }
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
      couponCode,
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
                setDiscount(0);
                setCouponCode('');
                setCouponError('');
                setCustomDuration(getDefaultDuration(plan));
              }}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedPlanId === plan.id
                  ? 'border-primary bg-primary/5'
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
                    {plan.perks.map((perk) => (
                      <li
                        key={perk.id}
                        className="text-sm text-foreground/80 flex items-start gap-2"
                      >
                        <CheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          {perk.quantity} {perk.unit} - {perk.name}
                        </span>
                      </li>
                    ))}
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
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <label className="block text-sm font-medium text-foreground mb-2">
            <ClockIcon className="w-4 h-4 inline-block mr-2 text-amber-600" />
            Membership Duration
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={customDuration ?? ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setCustomDuration(value > 0 ? value : undefined);
                setError('');
              }}
              className="w-32 px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={getDefaultDuration(selectedPlan).toString()}
            />
            <span className="text-sm font-medium text-foreground">
              {getDurationUnit(selectedPlan)}
            </span>
          </div>
          <p className="text-xs text-amber-700 mt-2">
            💡 Default: {getDurationText(selectedPlan)}. You can customize the duration for this member.
          </p>
          {customDuration && selectedPlan.type === 'MONTHLY' && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Member will have access for {customDuration} {customDuration === 1 ? 'month' : 'months'} ({customDuration * 30} days)
            </p>
          )}
          {customDuration && selectedPlan.type === 'DAILY' && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Member will have access for {customDuration} {customDuration === 1 ? 'day' : 'days'}
            </p>
          )}
        </div>
      )}

      {/* Coupon Code */}
      {selectedPlanId && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-foreground mb-2">
            Have a coupon code? (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError('');
                setDiscount(0);
              }}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleValidateCoupon}
              disabled={isValidatingCoupon}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
            >
              {isValidatingCoupon ? 'Validating...' : 'Apply'}
            </button>
          </div>
          {couponError && (
            <p className="text-red-500 text-sm mt-2">{couponError}</p>
          )}
          {discount > 0 && (
            <p className="text-green-600 text-sm mt-2">
              ✓ Coupon applied! Discount: ₱{discount.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Price Summary */}
      {selectedPlan && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">Plan:</span>
              <span className="font-medium">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">Duration:</span>
              <span className="font-medium">
                {customDuration 
                  ? `${customDuration} ${getDurationUnit(selectedPlan)}`
                  : getDurationText(selectedPlan)
                }
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-primary/20 pt-2">
              <span className="text-foreground/60">Plan Price:</span>
              <span className="font-medium">
                ₱{selectedPlan.price.toFixed(2)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span className="font-medium">-₱{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-primary/20 pt-2">
              <span>Total:</span>
              <span className="text-primary">
                ₱{(selectedPlan.price - discount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors font-medium"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Next: Payment
        </button>
      </div>
    </div>
  );
}