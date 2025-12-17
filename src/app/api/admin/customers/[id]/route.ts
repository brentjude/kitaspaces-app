import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerDetailInfo } from "@/types/customer-detail";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Try to find as User first
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        eventRegistrations: {
          select: { id: true },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (user) {
      const totalSpent = user.payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0);

      const activeMembership = user.memberships[0];

      const customerInfo: CustomerDetailInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        company: user.company,
        isRegistered: true,
        isMember: user.isMember,
        role: user.role,
        referralSource: user.referralSource,
        joinedDate: user.createdAt,
        membershipType: activeMembership?.plan?.name || null,
        membershipStatus: activeMembership?.status || null,
        membershipEndDate: activeMembership?.endDate || null,
        stats: {
          totalEvents: user.eventRegistrations.length,
          totalPayments: user.payments.length,
          totalSpent,
          lastActivity: user.activityLogs[0]?.createdAt || null,
        },
      };

      return NextResponse.json({ success: true, data: customerInfo });
    }

    // Try to find as Customer
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        eventRegistrations: {
          select: { id: true },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (customer) {
      const totalSpent = customer.payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0);

      const customerInfo: CustomerDetailInfo = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        contactNumber: customer.contactNumber,
        company: customer.company,
        isRegistered: false,
        isMember: false,
        role: "guest",
        referralSource: customer.referralSource,
        joinedDate: customer.createdAt,
        membershipType: null,
        membershipStatus: null,
        membershipEndDate: null,
        stats: {
          totalEvents: customer.eventRegistrations.length,
          totalPayments: customer.payments.length,
          totalSpent,
          lastActivity: customer.activityLogs[0]?.createdAt || null,
        },
      };

      return NextResponse.json({ success: true, data: customerInfo });
    }

    return NextResponse.json(
      { success: false, error: "Customer not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Failed to fetch customer details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
