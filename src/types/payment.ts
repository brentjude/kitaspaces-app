import { PaymentMethod, PaymentStatus } from '@/generated/prisma';

export interface PaymentRecord {
  id: string;
  type: 'USER' | 'CUSTOMER';
  recordType: 'EVENT' | 'MEMBERSHIP' | 'ROOM_BOOKING';
  date: Date;
  userName: string;
  userEmail: string | null;
  userPhone: string | null;
  description: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber: string | null;
  paymentReference: string | null;
  proofImageUrl: string | null;
  notes: string | null;
  paidAt: Date | null;
  createdAt: Date;
  eventTitle?: string;
  membershipPlan?: string;
  roomName?: string;
  numberOfPax?: number;
}

export interface PaymentStats {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalRefunded: number;
  eventRevenue: number;
  membershipRevenue: number;
  roomBookingRevenue: number;
}

export interface PaymentFilters {
  search: string;
  typeFilter: 'all' | 'event' | 'membership' | 'room';
  statusFilter: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  page: number;
  limit: number;
}