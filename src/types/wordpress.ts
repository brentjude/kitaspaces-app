export interface WordPressEventResponse {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  price: number;
  isFree: boolean;
  imageUrl: string | null;
  maxAttendees: number | null;
  isFeatured: boolean;
  memberDiscount: number | null;
  memberDiscountType: string | null;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  freebies: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  registrationCount: number;
  availableSlots: number | null;
  registrationUrl: string;
}

export interface WordPressMeetingRoomResponse {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  hourlyRate: number;
  imageUrl: string | null;
  amenities: string[] | null;
  status: string;
  location: string | null;
  floorLevel: string | null;
  bookingUrl: string;
}

export interface WordPressMembershipPlanResponse {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  pricePerDay: number;
  perks: Array<{
    id: string;
    name: string;
    description: string | null;
    type: string;
    value: number | null;
  }>;
  membershipUrl: string;
}

export interface WordPressApiResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    count: number;
    generatedAt: string;
  };
}