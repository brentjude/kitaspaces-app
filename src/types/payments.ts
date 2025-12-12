import { PaymentStatus, PaymentMethod } from '@/generated/prisma';

export interface PaymentRecord {
  id: string;
  type: 'USER' | 'CUSTOMER';
  recordType: 'EVENT' | 'MEMBERSHIP';
  date: Date;
  userName: string;
  userEmail: string | null;
  userPhone?: string | null;
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
  numberOfPax?: number;
}

export interface PaymentFilters {
  search: string;
  typeFilter: 'all' | 'event' | 'membership';
  statusFilter: 'all' | 'paid' | 'pending' | 'failed' | 'refunded';
  page: number;
  limit: number;
}

export interface PaymentStats {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalRefunded: number;
  eventRevenue: number;
  membershipRevenue: number;
}

export interface PaginatedPayments {
  payments: PaymentRecord[];
  stats: PaymentStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}