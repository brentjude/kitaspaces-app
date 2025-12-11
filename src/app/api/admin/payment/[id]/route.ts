import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus } from "@/generated/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paymentId } = await context.params;
    const body = await request.json();
    const { status, type, notes } = body as {
      status: PaymentStatus;
      type: "user" | "customer";
      notes?: string;
    };

    // Validate status
    const validStatuses: PaymentStatus[] = [
      "PENDING",
      "COMPLETED",
      "FAILED",
      "REFUNDED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Validate type
    if (!type || (type !== "user" && type !== "customer")) {
      return NextResponse.json(
        { error: "Invalid payment type" },
        { status: 400 }
      );
    }

    // Update payment based on type
    let updatedPayment;

    if (type === "user") {
      // Update user payment
      const existingPayment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!existingPayment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          paidAt: status === "COMPLETED" ? new Date() : existingPayment.paidAt,
          notes: notes
            ? `${
                existingPayment.notes || ""
              }\n[Admin Update ${new Date().toISOString()}]: ${notes}`.trim()
            : existingPayment.notes,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          eventRegistration: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          membership: {
            select: {
              id: true,
              type: true,
            },
          },
        },
      });
    } else {
      // Update customer payment
      const existingPayment = await prisma.customerPayment.findUnique({
        where: { id: paymentId },
      });

      if (!existingPayment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      updatedPayment = await prisma.customerPayment.update({
        where: { id: paymentId },
        data: {
          status,
          paidAt: status === "COMPLETED" ? new Date() : existingPayment.paidAt,
          notes: notes
            ? `${
                existingPayment.notes || ""
              }\n[Admin Update ${new Date().toISOString()}]: ${notes}`.trim()
            : existingPayment.notes,
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          eventRegistration: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: `Payment status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update payment status",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paymentId } = await context.params;

    // Try to find in user payments first
    await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isMember: true,
          },
        },
        eventRegistration: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                date: true,
                price: true,
              },
            },
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
          select: {
            id: true,
            type: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (payment) {
      return NextResponse.json({
        success: true,
        data: { ...payment, type: "user" },
      });
    }

    // If not found, try customer payments
    const customerPayment = await prisma.customerPayment.findUnique({
      where: { id: paymentId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNumber: true,
          },
        },
        eventRegistration: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                date: true,
                price: true,
              },
            },
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

    if (customerPayment) {
      return NextResponse.json({
        success: true,
        data: { ...customerPayment, type: "customer" },
      });
    }

    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch payment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paymentId } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "user" | "customer" | null;

    if (!type || (type !== "user" && type !== "customer")) {
      return NextResponse.json(
        { error: "Payment type is required" },
        { status: 400 }
      );
    }

    if (type === "user") {
      // Check if payment exists and is not linked to critical data
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          eventRegistration: true,
          membership: true,
        },
      });

      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      // Don't allow deletion if payment is completed and linked to active resources
      if (
        payment.status === "COMPLETED" &&
        (payment.eventRegistration || payment.membership)
      ) {
        return NextResponse.json(
          {
            error:
              "Cannot delete completed payment linked to active registration or membership",
          },
          { status: 400 }
        );
      }

      await prisma.payment.delete({
        where: { id: paymentId },
      });
    } else {
      // Customer payment deletion
      const payment = await prisma.customerPayment.findUnique({
        where: { id: paymentId },
        include: {
          eventRegistration: true,
        },
      });

      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      if (payment.status === "COMPLETED" && payment.eventRegistration) {
        return NextResponse.json(
          {
            error:
              "Cannot delete completed payment linked to active registration",
          },
          { status: 400 }
        );
      }

      await prisma.customerPayment.delete({
        where: { id: paymentId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete payment",
      },
      { status: 500 }
    );
  }
}
