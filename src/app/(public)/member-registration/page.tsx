'use client';

import { useState, useEffect } from 'react';
import {
  MembershipPlanPublic,
  PaymentSettingsPublic,
  MembershipRegistrationFormData,
  RegistrationStep,
  CouponValidationResponse,
  MembershipRegistrationConfirmation,
} from '@/types/membership-registration';
import PlanSelectionStep from './components/PlanSelectionStep';
import MemberDetailsStep from './components/MemberDetailsStep';
import PaymentStep from './components/PaymentStep';
import ConfirmationSuccess from './components/ConfirmationSuccess';

export default function MemberRegistrationPage() {
  const [step, setStep] = useState<RegistrationStep>('plan');
  const [plans, setPlans] = useState<MembershipPlanPublic[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<MembershipRegistrationConfirmation | null>(null);

  const [formData, setFormData] = useState<MembershipRegistrationFormData>({
    name: '',
    email: '',
    contactNumber: '',
    agreeToTerms: false,
    agreeToHouseRules: false,
    agreeToNewsletter: false,
    planId: '',
    quantity: 1,
    paymentMethod: 'GCASH',
  });

  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse['coupon'] | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [baseAmount, setBaseAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Fetch plans and payment settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, settingsRes] = await Promise.all([
          fetch('/api/public/membership-plans'),
          fetch('/api/public/payment-settings'),
        ]);

        const plansData = await plansRes.json();
        const settingsData = await settingsRes.json();

        if (plansData.success) {
          setPlans(plansData.data);
        }

        if (settingsData.success) {
          setPaymentSettings(settingsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load registration data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate amounts when plan or quantity changes
  useEffect(() => {
    if (formData.planId) {
      const selectedPlan = plans.find((p) => p.id === formData.planId);
      if (selectedPlan) {
        const base = selectedPlan.price * formData.quantity;
        setBaseAmount(base);
        
        if (!appliedCoupon) {
          setTotalAmount(base);
          setDiscountAmount(0);
        }
      }
    }
  }, [formData.planId, formData.quantity, plans, appliedCoupon]);

  const handleFieldChange = (
    field: keyof MembershipRegistrationFormData,
    value: string | boolean | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectPlan = (planId: string) => {
    setFormData((prev) => ({ ...prev, planId }));
  };

  const handleQuantityIncrement = () => {
    setFormData((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
  };

  const handleQuantityDecrement = () => {
    if (formData.quantity > 1) {
      setFormData((prev) => ({ ...prev, quantity: prev.quantity - 1 }));
    }
  };

  const handleApplyCoupon = async () => {
  if (!couponCode) return;

  setIsCouponLoading(true);

  try {
    const response = await fetch('/api/public/membership-validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        couponCode,
        planId: formData.planId,
        quantity: formData.quantity,
      }),
    });

    const data = await response.json();

      if (data.success && data.data.isValid) {
        // Check expiration on client side as well
        const coupon = data.data.coupon;
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          alert('This coupon has expired');
          return;
        }

        setAppliedCoupon(data.data.coupon);
        setTotalAmount(data.data.finalAmount);
        setDiscountAmount(data.data.discountAmount);
        alert(data.data.message);
      } else {
        alert(data.data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      alert('Failed to validate coupon. Please try again.');
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setTotalAmount(baseAmount);
    setDiscountAmount(0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/public/membership-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          couponCode: appliedCoupon ? couponCode : undefined,
          birthdate: formData.birthdate?.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      setConfirmation(data.data);
      setStep('confirmation');
    } catch (error) {
      console.error('Registration error:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to complete registration. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-foreground/60">Loading registration form...</p>
        </div>
      </div>
    );
  }

  const selectedPlan = plans.find((p) => p.id === formData.planId);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Join KITA Spaces
          </h1>
          <p className="text-lg text-foreground/60">
            Become a member and unlock exclusive benefits
          </p>
        </div>

        {/* Progress Steps */}
        {step !== 'confirmation' && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {['plan', 'details', 'payment'].map((s, index) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step === s
                        ? 'bg-primary text-white'
                        : ['plan', 'details', 'payment'].indexOf(step) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-foreground/10 text-foreground/40'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-16 h-1 ${
                        ['plan', 'details', 'payment'].indexOf(step) > index
                          ? 'bg-green-500'
                          : 'bg-foreground/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-20 mt-2">
              <span className="text-xs text-foreground/60 font-medium">Plan</span>
              <span className="text-xs text-foreground/60 font-medium">Details</span>
              <span className="text-xs text-foreground/60 font-medium">Payment</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {step === 'plan' && (
            <PlanSelectionStep
              plans={plans}
              selectedPlanId={formData.planId}
              onSelectPlan={handleSelectPlan}
              quantity={formData.quantity}
              onIncrement={handleQuantityIncrement}
              onDecrement={handleQuantityDecrement}
              onNext={() => setStep('details')}
            />
          )}

          {step === 'details' && (
            <MemberDetailsStep
              formData={formData}
              onChange={handleFieldChange}
              onBack={() => setStep('plan')}
              onNext={() => setStep('payment')}
            />
          )}

          {step === 'payment' && selectedPlan && paymentSettings && (
            <PaymentStep
              selectedPlan={selectedPlan}
              quantity={formData.quantity}
              baseAmount={baseAmount}
              totalAmount={totalAmount}
              discountAmount={discountAmount}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              appliedCoupon={appliedCoupon}
              paymentMethod={formData.paymentMethod}
              onPaymentMethodChange={(method) =>
                handleFieldChange('paymentMethod', method)
              }
              referenceNumber={formData.referenceNumber || ''}
              onReferenceNumberChange={(value) =>
                handleFieldChange('referenceNumber', value)
              }
              proofImageUrl={formData.proofImageUrl || ''}
              onProofImageUrlChange={(url) =>
                handleFieldChange('proofImageUrl', url)
              }
              paymentSettings={paymentSettings}
              onBack={() => setStep('details')}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isCouponLoading={isCouponLoading}
            />
          )}

          {step === 'confirmation' && confirmation && (
            <ConfirmationSuccess confirmation={confirmation} />
          )}
        </div>
      </div>
    </div>
  );
}