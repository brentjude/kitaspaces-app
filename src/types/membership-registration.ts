import { MembershipType, PaymentMethod, ReferralSource } from '@/generated/prisma';

export interface MembershipRegistrationFormData {
  // Personal Information
  name: string;
  nickname?: string;
  email: string;
  contactNumber: string;
  birthdate?: Date;
  password?: string;
  
  // Additional Information (optional)
  company?: string;
  referralSource?: ReferralSource;
  
  // Billing
  billingAddress?: string;
  
  // Agreements
  agreeToTerms: boolean;
  agreeToHouseRules: boolean;
  agreeToNewsletter: boolean;
  
  // Plan Selection
  planId: string;
  quantity: number;
  
  // Payment
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  proofImageUrl?: string;
  couponCode?: string;
}

export interface MembershipPlanPublic {
  id: string;
  name: string;
  description: string | null;
  type: MembershipType;
  price: number;
  durationDays: number;
  isActive: boolean;
  perks: {
    id: string;
    perkType: string;
    name: string;
    description: string | null;
    quantity: number;
    unit: string;
    maxPerDay: number | null;
  }[];
}

export interface PaymentSettingsPublic {
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  qrCodeUrl: string | null;
  qrCodeNumber: string | null;
}

export interface CouponValidationResponse {
  isValid: boolean;
  message?: string;
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    expiresAt: Date | null;
    applicablePlansIds: string[] | null;
  };
  baseAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
}

export interface CouponNotification {
  type: 'success' | 'error' | 'info';
  message: string;
  details?: string;
}

export interface MembershipRegistrationConfirmation {
  membershipId: string;
  userId: string;
  plan: {
    name: string;
    type: MembershipType;
    durationDays: number;
  };
  startDate: Date;
  endDate: Date | null;
  totalAmount: number;
  paymentReference: string | null;
  status: string;
  user: {
    name: string;
    email: string;
  };
}

export type RegistrationStep = 'plan' | 'details' | 'payment' | 'confirmation';