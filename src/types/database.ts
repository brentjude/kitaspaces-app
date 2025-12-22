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

//// ============================================
// EVENT TYPES
// ============================================

export type Event = PrismaEvent & {
  // 🆕 NEW: Add discount and customer freebies fields
  memberDiscount?: number | null;
  memberDiscountType?: "FIXED" | "PERCENTAGE" | null;
  memberDiscountedPrice?: number | null;
  hasCustomerFreebies?: boolean;
};

export type EventWithCategory = PrismaEvent & {
  category?: EventCategory | null;
  memberDiscount?: number | null;
  memberDiscountType?: "FIXED" | "PERCENTAGE" | null;
  memberDiscountedPrice?: number | null;
  hasCustomerFreebies?: boolean;
};

export type EventWithFreebies = PrismaEvent & {
  freebies: EventFreebie[];
  memberDiscount?: number | null;
  memberDiscountType?: "FIXED" | "PERCENTAGE" | null;
  memberDiscountedPrice?: number | null;
  hasCustomerFreebies?: boolean;
};

export type EventWithRegistrations = PrismaEvent & {
  registrations: EventRegistration[];
  memberDiscount?: number | null;
  memberDiscountType?: "FIXED" | "PERCENTAGE" | null;
  memberDiscountedPrice?: number | null;
  hasCustomerFreebies?: boolean;
};

export type EventWithRelations = PrismaEvent & {
  category?: EventCategory | null;
  registrations?: EventRegistration[];
  customerRegistrations?: CustomerEventRegistration[];
  freebies?: EventFreebie[];
  memberDiscount?: number | null;
  memberDiscountType?: "FIXED" | "PERCENTAGE" | null;
  memberDiscountedPrice?: number | null;
  hasCustomerFreebies?: boolean;
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
  categoryId?: string;
  isRedemptionEvent?: boolean;
  redemptionLimit?: number;
  maxAttendees?: number;
  imageUrl?: string;
  // 🆕 NEW: Add discount and customer freebies fields
  memberDiscount?: number;
  memberDiscountType?: "FIXED" | "PERCENTAGE";
  memberDiscountedPrice?: number;
  hasCustomerFreebies?: boolean;
};

export type EventUpdateInput = Partial<EventCreateInput>;

// Update EventFilters to include category
export type EventFilters = {
  isFree?: boolean;
  isMemberOnly?: boolean;
  isRedemptionEvent?: boolean;
  categoryId?: string;
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

// ============================================
// MEETING ROOM TYPES
// ============================================

import {
  MeetingRoomStatus,
  BookingStatus,
  MeetingRoom as PrismaMeetingRoom,
  MeetingRoomBooking as PrismaMeetingRoomBooking,
  CustomerMeetingRoomBooking as PrismaCustomerMeetingRoomBooking,
} from "@/generated/prisma";

export { MeetingRoomStatus, BookingStatus };

export type MeetingRoom = PrismaMeetingRoom;

export type MeetingRoomWithBookings = PrismaMeetingRoom & {
  userBookings: MeetingRoomBooking[];
  customerBookings: CustomerMeetingRoomBooking[];
};

export type MeetingRoomCreateInput = {
  name: string;
  description?: string;
  coverPhotoUrl?: string;
  hourlyRate: number;
  capacity: number;
  startTime?: string; // "09:00"
  endTime?: string; // "18:00"
  amenities?: string; // JSON string: '["Projector","Whiteboard"]'
  status?: MeetingRoomStatus;
  isActive?: boolean;
  floor?: string;
  roomNumber?: string;
  notes?: string;
};

export type MeetingRoomUpdateInput = Partial<MeetingRoomCreateInput>;

// Parsed amenities helper type
export type MeetingRoomAmenity = string;
export type MeetingRoomWithParsedAmenities = Omit<MeetingRoom, "amenities"> & {
  amenities: MeetingRoomAmenity[];
};

// ============================================
// MEETING ROOM BOOKING TYPES (User)
// ============================================

export type MeetingRoomBooking = PrismaMeetingRoomBooking;

export type MeetingRoomBookingWithUser = PrismaMeetingRoomBooking & {
  user: User;
};

export type MeetingRoomBookingWithRoom = PrismaMeetingRoomBooking & {
  room: MeetingRoom;
};

export type MeetingRoomBookingWithRelations = PrismaMeetingRoomBooking & {
  user?: User;
  room?: MeetingRoom;
  payment?: Payment | null;
  perkUsage?: MembershipPerkUsage | null;
};

export type MeetingRoomBookingCreateInput = {
  userId: string;
  roomId: string;
  bookingDate: Date;
  startTime: string; // "09:00" or "09:30"
  endTime: string; // "12:00" or "12:30"
  duration: number; // Hours (e.g., 1, 1.5, 2, 2.5)
  company?: string;
  contactName: string;
  designation?: string;
  contactEmail?: string;
  contactMobile?: string;
  numberOfAttendees?: number;
  purpose: string; // "MEETING", "TRAINING", "INTERVIEW", "WORKSHOP", "OTHER"
  status?: BookingStatus;
  totalAmount: number;
  paymentId?: string;
  isUsingMembershipPerk?: boolean;
  membershipPerkUsageId?: string;
  notes?: string;
};

export type MeetingRoomBookingUpdateInput = Partial<
  Omit<MeetingRoomBookingCreateInput, "userId" | "roomId">
>;

// ============================================
// CUSTOMER MEETING ROOM BOOKING TYPES
// ============================================

export type CustomerMeetingRoomBooking = PrismaCustomerMeetingRoomBooking;

export type CustomerMeetingRoomBookingWithCustomer =
  PrismaCustomerMeetingRoomBooking & {
    customer: Customer;
  };

export type CustomerMeetingRoomBookingWithRoom =
  PrismaCustomerMeetingRoomBooking & {
    room: MeetingRoom;
  };

export type CustomerMeetingRoomBookingWithRelations =
  PrismaCustomerMeetingRoomBooking & {
    customer?: Customer;
    room?: MeetingRoom;
    payment?: CustomerPayment | null;
  };

export type CustomerMeetingRoomBookingCreateInput = {
  customerId: string;
  roomId: string;
  bookingDate: Date;
  startTime: string; // "09:00" or "09:30"
  endTime: string; // "12:00" or "12:30"
  duration: number; // Hours (e.g., 1, 1.5, 2, 2.5)
  company?: string;
  contactPerson: string;
  contactName: string; // Same as contactPerson
  designation?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactMobile?: string;
  numberOfAttendees?: number;
  purpose: string; // "MEETING", "TRAINING", "INTERVIEW", "WORKSHOP", "OTHER"
  status?: BookingStatus;
  totalAmount: number;
  paymentId?: string;
  notes?: string;
};

export type CustomerMeetingRoomBookingUpdateInput = Partial<
  Omit<CustomerMeetingRoomBookingCreateInput, "customerId" | "roomId">
>;

// ============================================
// MEETING ROOM FILTERS & QUERIES
// ============================================

export type MeetingRoomFilters = {
  status?: MeetingRoomStatus;
  isActive?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  search?: string; // Search by name
};

export type MeetingRoomBookingFilters = {
  userId?: string;
  roomId?: string;
  status?: BookingStatus;
  dateFrom?: Date;
  dateTo?: Date;
  isUsingMembershipPerk?: boolean;
};

export type CustomerMeetingRoomBookingFilters = {
  customerId?: string;
  roomId?: string;
  status?: BookingStatus;
  dateFrom?: Date;
  dateTo?: Date;
};

export type CalendarFilters = {
  showFreeOnly?: boolean;
  showMemberOnly?: boolean;
  showRedemptionOnly?: boolean;
  showEventsOnly?: boolean;
  showBookingsOnly?: boolean;
  categoryId?: string;
};

export type CalendarViewMode = "month" | "week" | "day";

export type CalendarItem = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "event" | "booking";
  location?: string;
  colorClass: string;
  categoryName?: string;
  categoryColor?: string;
  registrationCount?: number;
  maxAttendees?: number | null;
  
  // ✅ Booking-specific fields
  roomName?: string;
  userName?: string;
  status?: string;
  duration?: number; // ✅ Add this
  
  // ✅ NEW: Additional booking fields for detail modal
  room?: {
    id: string;
    name: string;
    capacity: number;
    hourlyRate: number;
    floor?: string | null;
    roomNumber?: string | null;
    amenities?: string | null;
  };
  contactName?: string;
  contactEmail?: string | null;
  contactMobile?: string | null;
  company?: string | null;
  designation?: string | null;
  numberOfAttendees?: number;
  purpose?: string | null;
  totalAmount?: number;
  bookingType?: 'user' | 'customer';
  paymentReference?: string | null;
  paymentMethod?: string | null;
};

export type BookingDetails = {
  id: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  numberOfAttendees: number;
  purpose: string | null;
  status: BookingStatus;
  room: {
    name: string;
    capacity: number;
    location: string | null;
    amenities: string[];
  };
  user?: {
    name: string;
    email: string;
    contactNumber: string | null;
    isMember: boolean;
  };
  customer?: {
    name: string;
    email: string;
    contactNumber: string | null;
  };
  createdAt: Date;
  bookingType: "user" | "customer";
};

// ============================================
// MEETING ROOM AVAILABILITY TYPES
// ============================================

export type TimeSlot = {
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  isAvailable: boolean;
  bookingId?: string;
  bookedBy?: string;
};

export type MeetingRoomAvailability = {
  roomId: string;
  roomName: string;
  date: Date;
  timeSlots: TimeSlot[];
};

export type BookingTimeRange = {
  startTime: string;
  endTime: string;
  duration: number; // in hours
  totalAmount: number;
};

// ============================================
// MEETING ROOM STATISTICS
// ============================================

export type MeetingRoomStats = {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalBookingsToday: number;
  totalBookingsThisWeek: number;
  totalBookingsThisMonth: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  popularRooms: Array<{
    roomId: string;
    roomName: string;
    bookingCount: number;
    revenue: number;
  }>;
};

export type BookingStats = {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  noShowBookings: number;
  averageBookingDuration: number;
  averageBookingAmount: number;
  peakBookingHours: Array<{
    hour: string;
    count: number;
  }>;
};

// ============================================
// API RESPONSE TYPES
// ============================================

export type MeetingRoomResponse = ApiResponse<MeetingRoom>;
export type MeetingRoomsResponse = ApiResponse<PaginatedResponse<MeetingRoom>>;

export type MeetingRoomBookingResponse =
  ApiResponse<MeetingRoomBookingWithRelations>;
export type MeetingRoomBookingsResponse = ApiResponse<
  PaginatedResponse<MeetingRoomBookingWithRelations>
>;

export type CustomerMeetingRoomBookingResponse =
  ApiResponse<CustomerMeetingRoomBookingWithRelations>;
export type CustomerMeetingRoomBookingsResponse = ApiResponse<
  PaginatedResponse<CustomerMeetingRoomBookingWithRelations>
>;

export type MeetingRoomAvailabilityResponse =
  ApiResponse<MeetingRoomAvailability>;
export type MeetingRoomStatsResponse = ApiResponse<MeetingRoomStats>;
