// Purpose: TypeScript types for all Prisma models
// Based on: prisma/schema.prisma

import {
  UserRole,
  MembershipStatus,
  MembershipType,
  PaymentStatus,
  PaymentMethod,
  ReferralSource,
  PerkType,
  User as PrismaUser,
  MembershipPlan as PrismaMembershipPlan,
  MembershipPlanPerk as PrismaMembershipPlanPerk,
  Membership as PrismaMembership,
  MembershipPerkUsage as PrismaMembershipPerkUsage,
  Coupon as PrismaCoupon,
  Event as PrismaEvent,
  EventFreebie as PrismaEventFreebie,
  EventRegistration as PrismaEventRegistration,
  EventPax as PrismaEventPax,
  PaxFreebie as PrismaPaxFreebie,
  DailyUseRedemption as PrismaDailyUseRedemption,
  Payment as PrismaPayment,
  Customer as PrismaCustomer,
  CustomerEventRegistration as PrismaCustomerEventRegistration,
  CustomerEventPax as PrismaCustomerEventPax,
  CustomerPaxFreebie as PrismaCustomerPaxFreebie,
  CustomerDailyUseRedemption as PrismaCustomerDailyUseRedemption,
  CustomerPayment as PrismaCustomerPayment,
  EventCategory as PrismaEventCategory,
} from "@/generated/prisma";

// ============================================
// USER TYPES
// ============================================

export type User = PrismaUser;

export type UserWithRelations = PrismaUser & {
  memberships?: Membership[];
  eventRegistrations?: EventRegistration[];
  payments?: Payment[];
  dailyUseRedemptions?: DailyUseRedemption[];
  perkUsages?: MembershipPerkUsage[];
};

export type UserCreateInput = {
  id: string;
  email: string;
  password?: string;
  name: string;
  nickname?: string;
  role?: UserRole;
  isMember?: boolean;
  company?: string;
  contactNumber?: string;
  birthdate?: Date;
  referralSource?: ReferralSource;
  agreeToNewsletter?: boolean;
};

export type UserUpdateInput = Partial<Omit<UserCreateInput, "id" | "email">>;

export type UserPublic = Omit<User, "password">;

// ============================================
// MEMBERSHIP PLAN TYPES
// ============================================

export type MembershipPlan = PrismaMembershipPlan;

export type MembershipPlanWithPerks = PrismaMembershipPlan & {
  perks: MembershipPlanPerk[];
};

export type MembershipPlanWithRelations = PrismaMembershipPlan & {
  perks?: MembershipPlanPerk[];
  memberships?: Membership[];
};

export type MembershipPlanCreateInput = {
  name: string;
  description?: string;
  type: MembershipType;
  price: number;
  durationDays: number;
  isActive?: boolean;
};

export type MembershipPlanUpdateInput = Partial<MembershipPlanCreateInput>;

// ============================================
// CUSTOMER TYPES (Walk-in/Guest customers)
// ============================================

export type Customer = PrismaCustomer;

export type CustomerWithRelations = PrismaCustomer & {
  eventRegistrations?: CustomerEventRegistration[];
  payments?: CustomerPayment[];
  dailyUseRedemptions?: CustomerDailyUseRedemption[];
};

export type CustomerCreateInput = {
  name: string;
  email?: string;
  contactNumber?: string;
  company?: string;
  userId?: string;
  notes?: string;
  referralSource?: ReferralSource;
};

export type CustomerUpdateInput = Partial<CustomerCreateInput>;

// ============================================
// CUSTOMER EVENT REGISTRATION TYPES
// ============================================

export type CustomerEventRegistration = PrismaCustomerEventRegistration;

export type CustomerEventRegistrationWithCustomer =
  PrismaCustomerEventRegistration & {
    customer: Customer;
  };

export type CustomerEventRegistrationWithEvent =
  PrismaCustomerEventRegistration & {
    event: Event;
  };

export type CustomerEventRegistrationWithRelations =
  PrismaCustomerEventRegistration & {
    customer?: Customer;
    event?: Event;
    payment?: CustomerPayment | null;
    pax?: CustomerEventPax[];
  };

export type CustomerEventRegistrationCreateInput = {
  customerId: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  numberOfPax?: number;
  paymentId?: string;
};

export type CustomerEventRegistrationUpdateInput = Partial<
  Omit<CustomerEventRegistrationCreateInput, "customerId" | "eventId">
>;

// ============================================
// CUSTOMER EVENT PAX TYPES
// ============================================

export type CustomerEventPax = PrismaCustomerEventPax;

export type CustomerEventPaxWithRegistration = PrismaCustomerEventPax & {
  registration: CustomerEventRegistration;
};

export type CustomerEventPaxWithRelations = PrismaCustomerEventPax & {
  registration?: CustomerEventRegistration;
  freebies?: CustomerPaxFreebie[];
};

export type CustomerEventPaxCreateInput = {
  registrationId: string;
  name: string;
  email?: string;
  phone?: string;
};

export type CustomerEventPaxUpdateInput = Partial<
  Omit<CustomerEventPaxCreateInput, "registrationId">
>;

// ============================================
// CUSTOMER PAX FREEBIE TYPES
// ============================================

export type CustomerPaxFreebie = PrismaCustomerPaxFreebie;

export type CustomerPaxFreebieWithRelations = PrismaCustomerPaxFreebie & {
  pax?: CustomerEventPax;
  freebie?: EventFreebie;
};

export type CustomerPaxFreebieCreateInput = {
  paxId: string;
  freebieId: string;
  quantity?: number;
};

export type CustomerPaxFreebieUpdateInput = Partial<
  Omit<CustomerPaxFreebieCreateInput, "paxId" | "freebieId">
>;

// ============================================
// CUSTOMER DAILY USE REDEMPTION TYPES
// ============================================

export type CustomerDailyUseRedemption = PrismaCustomerDailyUseRedemption;

export type CustomerDailyUseRedemptionWithCustomer =
  PrismaCustomerDailyUseRedemption & {
    customer: Customer;
  };

export type CustomerDailyUseRedemptionCreateInput = {
  customerId: string;
  eventId: string;
  notes?: string;
};

export type CustomerDailyUseRedemptionUpdateInput = Partial<
  Omit<CustomerDailyUseRedemptionCreateInput, "customerId" | "eventId">
>;

// ============================================
// CUSTOMER PAYMENT TYPES
// ============================================

export type CustomerPayment = PrismaCustomerPayment;

export type CustomerPaymentWithCustomer = PrismaCustomerPayment & {
  customer: Customer;
};

export type CustomerPaymentWithRelations = PrismaCustomerPayment & {
  customer?: Customer;
  eventRegistration?: CustomerEventRegistration | null;
};

export type CustomerPaymentCreateInput = {
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status?: PaymentStatus;
  paymentReference?: string; // Internal reference (ev_kita2025_001)
  referenceNumber?: string; // User's reference number
  proofImageUrl?: string;
  notes?: string;
  paidAt?: Date;
};

export type CustomerPaymentUpdateInput = Partial<
  Omit<CustomerPaymentCreateInput, "customerId">
>;

// ============================================
// MEMBERSHIP PLAN PERK TYPES
// ============================================

export type MembershipPlanPerk = PrismaMembershipPlanPerk & {
  daysOfWeek?: string | null;
  isRecurring?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
};

export type MembershipPlanPerkWithPlan = PrismaMembershipPlanPerk & {
  plan: MembershipPlan;
};

export type MembershipPlanPerkCreateInput = {
  planId: string;
  perkType: PerkType;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  maxPerDay?: number;
  maxPerWeek?: number;
  daysOfWeek?: string; // JSON string: '["MONDAY","WEDNESDAY"]'
  isRecurring?: boolean;
  validFrom?: string; // "09:00"
  validUntil?: string; // "17:00"
};

export type MembershipPlanPerkUpdateInput = Partial<
  Omit<MembershipPlanPerkCreateInput, "planId">
>;

// ============================================
// MEMBERSHIP TYPES
// ============================================

export type Membership = PrismaMembership;

export type MembershipWithUser = PrismaMembership & {
  user: User;
};

export type MembershipWithPlan = PrismaMembership & {
  plan: MembershipPlan | null;
};

export type MembershipWithRelations = PrismaMembership & {
  user?: User;
  plan?: MembershipPlan | null;
  payment?: Payment | null;
  coupon?: Coupon | null;
  perkUsages?: MembershipPerkUsage[];
};

export type MembershipCreateInput = {
  userId: string;
  planId?: string;
  type?: MembershipType;
  status?: MembershipStatus;
  startDate: Date;
  endDate?: Date;
  billingAddress?: string;
  paymentId?: string;
  couponId?: string;
};

export type MembershipUpdateInput = Partial<
  Omit<MembershipCreateInput, "userId">
>;

// ============================================
// MEMBERSHIP PERK USAGE TYPES
// ============================================

export type MembershipPerkUsage = PrismaMembershipPerkUsage;

export type MembershipPerkUsageWithRelations = PrismaMembershipPerkUsage & {
  membership?: Membership;
  user?: User;
};

export type MembershipPerkUsageCreateInput = {
  membershipId: string;
  userId: string;
  perkType: PerkType;
  perkName: string;
  quantityUsed: number;
  unit: string;
  notes?: string;
  referenceId?: string;
  referenceType?: string;
};

export type MembershipPerkUsageUpdateInput = Partial<
  Omit<MembershipPerkUsageCreateInput, "membershipId" | "userId">
>;

// Helper type for perk balance tracking
export type PerkBalance = {
  perkType: PerkType;
  perkName: string;
  totalQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  unit: string;
  maxPerDay?: number;
  maxPerWeek?: number;
};

// ============================================
// COUPON TYPES
// ============================================

export type Coupon = PrismaCoupon;

export type CouponWithMemberships = PrismaCoupon & {
  memberships: Membership[];
};

export type CouponCreateInput = {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  discountValue: number;
  maxUses?: number;
  isActive?: boolean;
  expiresAt?: Date;
};

export type CouponUpdateInput = Partial<Omit<CouponCreateInput, "code">>;

export type CouponValidation = {
  isValid: boolean;
  message?: string;
  discount?: number;
  finalAmount?: number;
};

// ============================================
// EVENT REGISTRATION TYPES
// ============================================

export type EventRegistration = PrismaEventRegistration;

export type EventRegistrationWithUser = PrismaEventRegistration & {
  user: User;
};

export type EventRegistrationWithEvent = PrismaEventRegistration & {
  event: Event;
};

export type EventRegistrationWithRelations = PrismaEventRegistration & {
  user?: User;
  event?: Event;
  payment?: Payment | null;
  pax?: EventPax[];
};

export type EventRegistrationCreateInput = {
  userId: string;
  eventId: string;
  attendeeName?: string;
  attendeeEmail?: string;
  numberOfPax?: number;
  paymentId?: string;
};

export type EventRegistrationUpdateInput = Partial<
  Omit<EventRegistrationCreateInput, "userId" | "eventId">
>;

// ============================================
// EVENT PAX TYPES
// ============================================

export type EventPax = PrismaEventPax;

export type EventPaxWithRegistration = PrismaEventPax & {
  registration: EventRegistration;
};

export type EventPaxWithRelations = PrismaEventPax & {
  registration?: EventRegistration;
  freebies?: PaxFreebie[];
};

export type EventPaxCreateInput = {
  registrationId: string;
  name: string;
  email?: string;
};

export type EventPaxUpdateInput = Partial<
  Omit<EventPaxCreateInput, "registrationId">
>;

// ============================================
// PAX FREEBIE TYPES
// ============================================

export type PaxFreebie = PrismaPaxFreebie;

export type PaxFreebieWithRelations = PrismaPaxFreebie & {
  pax?: EventPax;
  freebie?: EventFreebie;
};

export type PaxFreebieCreateInput = {
  paxId: string;
  freebieId: string;
  quantity?: number;
};

export type PaxFreebieUpdateInput = Partial<
  Omit<PaxFreebieCreateInput, "paxId" | "freebieId">
>;

// ============================================
// DAILY USE REDEMPTION TYPES
// ============================================

export type DailyUseRedemption = PrismaDailyUseRedemption;

export type DailyUseRedemptionWithUser = PrismaDailyUseRedemption & {
  user: User;
};

export type DailyUseRedemptionCreateInput = {
  userId: string;
  eventId: string;
  notes?: string;
};

export type DailyUseRedemptionUpdateInput = Partial<
  Omit<DailyUseRedemptionCreateInput, "userId" | "eventId">
>;

// ============================================
// PAYMENT TYPES
// ============================================

export type Payment = PrismaPayment;

export type PaymentWithUser = PrismaPayment & {
  user: User;
};

export type PaymentWithRelations = PrismaPayment & {
  user?: User;
  eventRegistration?: EventRegistration | null;
  membership?: Membership | null;
};

export type PaymentCreateInput = {
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status?: PaymentStatus;
  paymentReference?: string; // Internal reference (ev_kita2025_001)
  referenceNumber?: string; // User's reference number
  proofImageUrl?: string;
  notes?: string;
  paidAt?: Date;
};

export type PaymentUpdateInput = Partial<Omit<PaymentCreateInput, "userId">>;

// ============================================
// FORM INPUT TYPES
// ============================================

export type SignUpFormData = {
  name: string;
  email: string;
  password: string;
};

export type SignInFormData = {
  email: string;
  password: string;
};

export type MembershipApplicationFormData = {
  userId: string;
  planId: string;
  billingAddress: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  proofImageUrl?: string;
  couponCode?: string;
};

export type EventRegistrationFormData = {
  userId: string;
  eventId: string;
  numberOfPax: number;
  attendeeName?: string;
  attendeeEmail?: string;
  paxDetails?: Array<{
    name: string;
    email?: string;
  }>;
  freebieSelections?: Record<string, number>; // freebieId -> quantity
};

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserResponse = ApiResponse<UserPublic>;
export type UsersResponse = ApiResponse<PaginatedResponse<UserPublic>>;

export type MembershipResponse = ApiResponse<MembershipWithRelations>;
export type MembershipsResponse = ApiResponse<
  PaginatedResponse<MembershipWithRelations>
>;

export type EventResponse = ApiResponse<EventWithRelations>;
export type EventsResponse = ApiResponse<PaginatedResponse<EventWithRelations>>;

export type PaymentResponse = ApiResponse<PaymentWithRelations>;
export type PaymentsResponse = ApiResponse<
  PaginatedResponse<PaymentWithRelations>
>;

// ============================================
// FILTER & QUERY TYPES
// ============================================

export type UserFilters = {
  role?: UserRole;
  isMember?: boolean;
  referralSource?: ReferralSource;
  search?: string; // Search by name or email
};

export type MembershipFilters = {
  status?: MembershipStatus;
  type?: MembershipType;
  planId?: string;
  userId?: string;
};

export type PaymentFilters = {
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// ============================================
// DASHBOARD STATISTICS TYPES
// ============================================

export type DashboardStats = {
  totalUsers: number;
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  upcomingEvents: number;
  pendingPayments: number;
};

export type MembershipStats = {
  totalActive: number;
  totalExpired: number;
  totalPending: number;
  byType: {
    monthly: number;
    daily: number;
  };
  byPlan: Record<string, number>;
};

export type EventStats = {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalAttendees: number;
  popularEvents: Array<{
    eventId: string;
    title: string;
    registrations: number;
  }>;
};

export type RevenueStats = {
  total: number;
  byMonth: Array<{
    month: string;
    amount: number;
  }>;
  byPaymentMethod: Record<PaymentMethod, number>;
};

// ============================================
// UTILITY TYPES
// ============================================

export type DateRange = {
  from: Date;
  to: Date;
};

export type SortOrder = "asc" | "desc";

export type SelectOption<T = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: T) => React.ReactNode;
};

// ============================================
// EXPORT ALL ENUMS
// ============================================

export {
  UserRole,
  MembershipStatus,
  MembershipType,
  PaymentStatus,
  PaymentMethod,
  ReferralSource,
  PerkType,
};

// ============================================
// EVENT CATEGORY TYPES
// ============================================

export type EventCategory = PrismaEventCategory;

export type EventCategoryWithEvents = PrismaEventCategory & {
  events: Event[];
};

export type EventCategoryCreateInput = {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
};

export type EventCategoryUpdateInput = Partial<EventCategoryCreateInput>;

// ============================================
// EVENT FREEBIE TYPES
// ============================================

export type EventFreebie = PrismaEventFreebie;

export type EventFreebieWithEvent = PrismaEventFreebie & {
  event: Event;
};

export type EventFreebieWithRelations = PrismaEventFreebie & {
  event?: Event;
  paxFreebies?: PaxFreebie[];
};

export type EventFreebieCreateInput = {
  eventId: string;
  name: string;
  description?: string;
  quantity: number;
  imageUrl?: string;
};

export type EventFreebieUpdateInput = Partial<
  Omit<EventFreebieCreateInput, "eventId">
>;

// ============================================
// EVENT TYPES
// ============================================

export type Event = PrismaEvent;

export type EventWithCategory = PrismaEvent & {
  category?: EventCategory | null;
};

export type EventWithFreebies = PrismaEvent & {
  freebies: EventFreebie[];
};

export type EventWithRegistrations = PrismaEvent & {
  registrations: EventRegistration[];
};

export type EventWithRelations = PrismaEvent & {
  category?: EventCategory | null;
  registrations?: EventRegistration[];
  customerRegistrations?: CustomerEventRegistration[];
  freebies?: EventFreebie[];
};

export type EventCreateInput = {
  title: string;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  price?: number;
  isFree?: boolean;
  isMemberOnly?: boolean;
  isFreeForMembers?: boolean;
  categoryId?: string; // Added
  isRedemptionEvent?: boolean;
  redemptionLimit?: number;
  maxAttendees?: number;
  imageUrl?: string;
};

export type EventUpdateInput = Partial<EventCreateInput>;

// Update EventFilters to include category
export type EventFilters = {
  isFree?: boolean;
  isMemberOnly?: boolean;
  isRedemptionEvent?: boolean;
  categoryId?: string; // Added
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // Search by title
};

// ============================================
// CALENDAR TYPES (update existing section)
// ============================================

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  isFree: boolean;
  isMemberOnly: boolean;
  isRedemptionEvent: boolean;
  categoryId?: string | null; // Added
  categoryName?: string | null; // Added
  categoryColor?: string | null; // Added
  registrationCount: number;
  maxAttendees?: number | null;
};

export type CalendarFilters = {
  showFreeOnly?: boolean;
  showMemberOnly?: boolean;
  showRedemptionOnly?: boolean;
  categoryId?: string; // Added
};

// Add API response types for categories
export type EventCategoryResponse = ApiResponse<EventCategory>;
export type EventCategoriesResponse = ApiResponse<EventCategory[]>;

// ============================================
// CUSTOMER API TYPES (add to CUSTOMER TYPES section)
// ============================================

export type TransformedUser = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  contactNumber: string | null;
  isRegistered: true;
  isMember: boolean;
  referralSource: string | null;
  joinedDate: Date;
  eventRegistrations: number;
  totalPayments: number;
  type: "user";
};

export type TransformedCustomer = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  contactNumber: string | null;
  isRegistered: false;
  isMember: false;
  referralSource: string | null;
  joinedDate: Date;
  eventRegistrations: number;
  totalPayments: number;
  type: "customer";
  linkedUserId: string | null;
};

export type CombinedCustomerData = TransformedUser | TransformedCustomer;

export type CustomerListApiResponse = ApiResponse<{
  customers: CombinedCustomerData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalUsers: number;
    totalCustomers: number;
    totalCombined: number;
  };
}>;

export type CustomerQueryParams = {
  search?: string;
  filter?: "all" | "registered" | "guest";
  page?: number;
  limit?: number;
};

export type AdminSettings = {
  id: string;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  qrCodeUrl: string | null;
  qrCodeNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminSettingsUpdateInput = {
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  qrCodeUrl?: string | null;
  qrCodeNumber?: string | null;
};

export type AdminSettingsResponse = ApiResponse<AdminSettings>;
