import { ActivityAction } from "@/generated/prisma";

export interface CustomerDetailInfo {
  id: string;
  type?: 'user' | 'customer';
  name: string;
  email: string | null; // ✅ Allow null
  contactNumber: string | null;
  company: string | null;
  isRegistered: boolean;
  isMember: boolean;
  role: string;
  userId?: string | null;
  avatar?: string | null;
  referralSource: string | null;
  joinedDate: Date;
  membershipType: string | null;
  membershipStatus: string | null;
  membershipEndDate: Date | null;
  stats: {
    totalEvents: number;
    totalPayments: number;
    totalSpent: number;
    lastActivity: Date | null;
  };
}

export interface CustomerActivity {
  id: string;
  action: ActivityAction;
  actionLabel: string;
  description: string;
  date: Date;
  status: "completed" | "pending" | "failed";
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, unknown> | null;
}

export interface CustomerActivityResponse {
  activities: CustomerActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerDetailResponse {
  success: boolean;
  data?: CustomerDetailInfo;
  error?: string;
}
