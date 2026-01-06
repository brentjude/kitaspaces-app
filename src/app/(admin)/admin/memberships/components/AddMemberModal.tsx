'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AdminMemberDetailsStep from './AdminMemberDetailsStep';
import AdminPlanSelectionStep from './AdminPlanSelectionStep';
import AdminPaymentStep from './AdminPaymentStep';
import AdminConfirmationSuccess from './AdminConfirmationSuccess';
import type { MembershipPlanWithPerks } from '@/types/membership';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plans: MembershipPlanWithPerks[];
}

type Step = 'details' | 'plan' | 'payment' | 'success';

interface FormData {
  // Member details
  name: string;
  email: string;
  password: string;
  company: string;
  contactNumber: string;
  birthdate: string;
  referralSource: string;
  agreeToNewsletter: boolean;

  // Plan selection
  selectedPlanId: string;
  couponCode: string;
  discount: number;
  customDuration?: number; // ✅ ADD THIS

  // Payment
  paymentNote: string;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
  plans,
}: AddMemberModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('details');
 const [formData, setFormData] = useState<FormData>({
  name: '',
  email: '',
  password: '',
  company: '',
  contactNumber: '',
  birthdate: '',
  referralSource: '',
  agreeToNewsletter: false,
  selectedPlanId: '',
  couponCode: '',
  discount: 0,
  customDuration: undefined, // ✅ ADD THIS
  paymentNote: '',
});

  const [memberId, setMemberId] = useState<string>('');

  if (!isOpen) return null;

 const handleClose = () => {
  setCurrentStep('details');
  setFormData({
    name: '',
    email: '',
    password: '',
    company: '',
    contactNumber: '',
    birthdate: '',
    referralSource: '',
    agreeToNewsletter: false,
    selectedPlanId: '',
    couponCode: '',
    discount: 0,
    customDuration: undefined, // ✅ ADD THIS
    paymentNote: '',
  });
  setMemberId('');
  onClose();
};

  const handleSuccess = (newMemberId: string) => {
    setMemberId(newMemberId);
    setCurrentStep('success');
  };

  const handleFinish = () => {
    handleClose();
    onSuccess();
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'details':
        return 'Member Details';
      case 'plan':
        return 'Select Plan';
      case 'payment':
        return 'Payment Information';
      case 'success':
        return 'Success!';
      default:
        return 'Add Member';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4 shrink-0">
          <h2 className="text-xl font-bold text-foreground">{getStepTitle()}</h2>
          <button
            onClick={handleClose}
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'details' && (
            <AdminMemberDetailsStep
              formData={formData}
              onNext={(data) => {
                updateFormData(data);
                setCurrentStep('plan');
              }}
            />
          )}

          {currentStep === 'plan' && (
            <AdminPlanSelectionStep
              formData={formData}
              plans={plans}
              onNext={(data) => {
                updateFormData(data);
                setCurrentStep('payment');
              }}
              onBack={() => setCurrentStep('details')}
            />
          )}

          {currentStep === 'payment' && (
            <AdminPaymentStep
              formData={formData}
              plans={plans}
              onSuccess={handleSuccess}
              onBack={() => setCurrentStep('plan')}
            />
          )}

          {currentStep === 'success' && (
            <AdminConfirmationSuccess
              memberId={memberId}
              memberName={formData.name}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
}