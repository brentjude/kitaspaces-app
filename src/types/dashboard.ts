export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    isMember: boolean;
  };
  membership: {
    type: "MONTHLY" | "DAILY";
    status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "PENDING";
    startDate: Date;
    endDate: Date | null;
    planName: string | null;
  } | null;
  recentPayment: {
    amount: number;
    paidAt: Date | null;
    paymentMethod: string;
  } | null;
  isMember: boolean;
}

export interface UserEventRegistration {
  registrationId: string;
  event: {
    id: string;
    title: string;
    slug: string;
    description: string;
    date: Date;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    price: number;
    imageUrl: string | null;
    category: {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
    } | null;
  };
  numberOfPax: number;
  paymentStatus: "PENDING" | "COMPLETED" | "FREE";
  createdAt: Date;
}

export interface PastEventRegistration {
  registrationId: string;
  event: {
    id: string;
    title: string;
    slug: string;
    date: Date;
    location: string | null;
  };
  createdAt: Date;
}

export interface RedemptionEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: Date;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  redemptionLimit: number | null;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  isRedeemed: boolean;
  redeemedAt: Date | null;
  canRedeem: boolean;
}

export interface MembershipPerk {
  id: string;
  name: string;
  description: string | null;
  type: string;
  quantity: number;
  unit: string;
  maxPerDay: number | null;
  maxPerWeek: number | null;
  daysOfWeek: string | null;
  isRecurring: boolean;
  validFrom: string | null;
  validUntil: string | null;
  isAvailable: boolean;
  unavailableReason: string;
  nextAvailableDate: Date | null;
  usedToday: number;
  lastUsedAt: Date | null;
}

export interface UserPerksData {
  membership: {
    id: string;
    planName: string;
    status: string;
    endDate: Date | null;
  } | null;
  perks: MembershipPerk[];
}
