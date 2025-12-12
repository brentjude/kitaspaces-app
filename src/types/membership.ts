import { MembershipType, PerkType } from '@/generated/prisma';

export interface MembershipPlanPerk {
  id?: string;
  perkType: PerkType;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  maxPerDay?: number;
  maxPerWeek?: number;
  daysOfWeek?: number[];
  isRecurring: boolean;
  validFrom?: string;
  validUntil?: string;
}

export interface MembershipPlanFormData {
  id?: string;
  name: string;
  description: string;
  type: MembershipType;
  price: number;
  durationDays: number;
  isActive: boolean;
  perks: MembershipPlanPerk[];
}

export interface MembershipPlanWithPerks {
  id: string;
  name: string;
  description: string | null;
  type: MembershipType;
  price: number;
  durationDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  perks: {
    id: string;
    perkType: PerkType;
    name: string;
    description: string | null;
    quantity: number;
    unit: string;
    maxPerDay: number | null;
    maxPerWeek: number | null;
    daysOfWeek: string | null;
    isRecurring: boolean;
    validFrom: string | null;
    validUntil: string | null;
  }[];
}