import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/payments/[id]
 * Update payment status
 */
export async function PATCH(
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

    const params = await context.params;
    const paymentId = params.id;
    const body = await request.json();
    const { status, type, notes } = body;

    if (
      !status ||
      !["PENDING", "COMPLETED", "FAILED", "REFUNDED"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Update the appropriate payment table based on type
    let updatedPayment;

    if (type === "customer") {
      updatedPayment = await prisma.customerPayment.update({
        where: { id: paymentId },
        data: {
          status,
          notes: notes || undefined,
          paidAt: status === "COMPLETED" ? new Date() : undefined,
        },
        include: {
          customer: true,
          eventRegistration: {
            include: {
              event: true,
            },
          },
        },
      });
    } else {
      updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          notes: notes || undefined,
          paidAt: status === "COMPLETED" ? new Date() : undefined,
        },
        include: {
          user: true,
          eventRegistration: {
            include: {
              event: true,
            },
          },
          membership: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: `Payment status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/payments/[id]
 * Get payment details
 */
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

    const params = await context.params;
    const paymentId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "user";

    let payment;

    if (type === "customer") {
      payment = await prisma.customerPayment.findUnique({
        where: { id: paymentId },
        include: {
          customer: true,
          eventRegistration: {
            include: {
              event: true,
              pax: {
                include: {
                  freebies: {
                    include: {
                      freebie: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } else {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: true,
          eventRegistration: {
            include: {
              event: true,
              pax: {
                include: {
                  freebies: {
                    include: {
                      freebie: true,
                    },
                  },
                },
              },
            },
          },
          membership: {
            include: {
              plan: true,
            },
          },
        },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
