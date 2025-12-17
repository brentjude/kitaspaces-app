import { prisma } from "@/lib/prisma";
import { ActivityAction } from "@/generated/prisma";
import { NextRequest } from "next/server";

// Define a proper type for metadata instead of Record<string, any>
type MetadataValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | MetadataValue[]
  | { [key: string]: MetadataValue };
type Metadata = Record<string, MetadataValue>;

interface LogActivityParams {
  userId?: string;
  adminId?: string;
  customerId?: string;
  action: ActivityAction;
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Metadata;
  ipAddress?: string;
  userAgent?: string;
  isSuccess?: boolean;
  errorMessage?: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        adminId: params.adminId,
        customerId: params.customerId,
        action: params.action,
        description: params.description,
        referenceId: params.referenceId,
        referenceType: params.referenceType,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        isSuccess: params.isSuccess ?? true,
        errorMessage: params.errorMessage,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error - logging should not break the main flow
  }
}

export function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}

interface LogActivityOptions {
  referenceId?: string;
  referenceType?: string;
  metadata?: Metadata;
  request?: NextRequest;
  isSuccess?: boolean;
  errorMessage?: string;
}

interface AdminLogActivityOptions extends LogActivityOptions {
  userId?: string;
}

// Helper for user actions - UPDATED with proper types
export async function logUserActivity(
  userId: string,
  action: ActivityAction,
  description: string,
  options?: LogActivityOptions
) {
  const clientInfo = options?.request
    ? getClientInfo(options.request)
    : { ipAddress: undefined, userAgent: undefined };

  await logActivity({
    userId,
    action,
    description,
    referenceId: options?.referenceId,
    referenceType: options?.referenceType,
    metadata: options?.metadata,
    isSuccess: options?.isSuccess,
    errorMessage: options?.errorMessage,
    ...clientInfo,
  });
}

// Helper for admin actions - UPDATED with proper types
export async function logAdminActivity(
  adminId: string,
  action: ActivityAction,
  description: string,
  options?: AdminLogActivityOptions
) {
  const clientInfo = options?.request
    ? getClientInfo(options.request)
    : { ipAddress: undefined, userAgent: undefined };

  await logActivity({
    adminId,
    userId: options?.userId,
    action,
    description,
    referenceId: options?.referenceId,
    referenceType: options?.referenceType,
    metadata: options?.metadata,
    isSuccess: options?.isSuccess,
    errorMessage: options?.errorMessage,
    ...clientInfo,
  });
}

// Helper for customer actions - UPDATED with proper types
export async function logCustomerActivity(
  customerId: string,
  action: ActivityAction,
  description: string,
  options?: LogActivityOptions
) {
  const clientInfo = options?.request
    ? getClientInfo(options.request)
    : { ipAddress: undefined, userAgent: undefined };

  await logActivity({
    customerId,
    action,
    description,
    referenceId: options?.referenceId,
    referenceType: options?.referenceType,
    metadata: options?.metadata,
    isSuccess: options?.isSuccess,
    errorMessage: options?.errorMessage,
    ...clientInfo,
  });
}
