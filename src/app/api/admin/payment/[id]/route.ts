import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus } from "@/generated/prisma";
import { sendMembershipRegistrationEmail } from '@/lib/email';

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

    const { id: paymentId } = await context.params;
    const body = await request.json();
    const { status, type, notes } = body as {
      status: PaymentStatus;
      type?: "user" | "customer";
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
        { success: false, error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Auto-detect type if not provided
    let paymentType = type;
    if (!paymentType) {
      const userPayment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
      const customerPayment = await prisma.customerPayment.findUnique({
        where: { id: paymentId },
      });

      if (userPayment) {
        paymentType = "user";
      } else if (customerPayment) {
        paymentType = "customer";
      } else {
        return NextResponse.json(
          { success: false, error: "Payment not found" },
          { status: 404 }
        );
      }
    }

    // Update payment based on type
    let updatedPayment;

    if (paymentType === "user") {
      // Fetch existing payment
      const existingPayment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          membership: {
            include: {
              user: true,
              plan: true,
            },
          },
          eventRegistration: true,
          user: true,
        },
      });

      if (!existingPayment) {
        return NextResponse.json(
          { success: false, error: "Payment not found" },
          { status: 404 }
        );
      }

      // Prepare notes update
      const updatedNotes = notes
        ? `${existingPayment.notes || ""}\n[Admin Update ${new Date().toISOString()}]: ${notes}`.trim()
        : existingPayment.notes;

      // Update user payment
      updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          paidAt: status === "COMPLETED" ? new Date() : existingPayment.paidAt,
          notes: updatedNotes,
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
            include: {
              user: true,
              plan: true,
            },
          },
        },
      });

      // Update related membership status and send email
      if (status === "COMPLETED" && existingPayment.membership) {
        // Update membership to ACTIVE
        await prisma.membership.update({
          where: { id: existingPayment.membership.id },
          data: { 
            status: "ACTIVE",
          },
        });

        // Update user isMember flag
        await prisma.user.update({
          where: { id: existingPayment.membership.userId },
          data: { isMember: true },
        });

        // Send payment approval email
        try {
          if (existingPayment.membership.user && existingPayment.membership.plan) {
            await sendMembershipRegistrationEmail({
              to: existingPayment.membership.user.email,
              name: existingPayment.membership.user.name,
              planName: existingPayment.membership.plan.name,
              amount: existingPayment.amount,
              paymentReference: existingPayment.paymentReference || '',
              paymentMethod: existingPayment.paymentMethod,
              status: 'ACTIVE',
              startDate: existingPayment.membership.startDate.toISOString(),
              endDate: existingPayment.membership.endDate?.toISOString() || '',
            });
            console.log(`✅ Payment approval email sent to ${existingPayment.membership.user.email}`);
          }
        } catch (emailError) {
          console.error('Failed to send payment approval email:', emailError);
          // Don't fail the payment update if email fails
        }
      }

      // Note: EventRegistration doesn't have a status field, so we skip updating it
    } else {
      // Fetch existing customer payment
      const existingPayment = await prisma.customerPayment.findUnique({
        where: { id: paymentId },
        include: {
          eventRegistration: true,
        },
      });

      if (!existingPayment) {
        return NextResponse.json(
          { success: false, error: "Payment not found" },
          { status: 404 }
        );
      }

      // Prepare notes update
      const updatedNotes = notes
        ? `${existingPayment.notes || ""}\n[Admin Update ${new Date().toISOString()}]: ${notes}`.trim()
        : existingPayment.notes;

      // Update customer payment
      updatedPayment = await prisma.customerPayment.update({
        where: { id: paymentId },
        data: {
          status,
          paidAt: status === "COMPLETED" ? new Date() : existingPayment.paidAt,
          notes: updatedNotes,
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

      // Note: CustomerEventRegistration doesn't have a status field, so we skip updating it
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
        success: false,
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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: paymentId } = await context.params;

    // Try to find in user payments first
    const payment = await prisma.payment.findUnique({
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
          include: {
            plan: true,
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

    return NextResponse.json(
      { success: false, error: "Payment not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      {
        success: false,
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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: paymentId } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "user" | "customer" | null;

    if (!type || (type !== "user" && type !== "customer")) {
      return NextResponse.json(
        { success: false, error: "Payment type is required" },
        { status: 400 }
      );
    }

    if (type === "user") {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          eventRegistration: true,
          membership: true,
        },
      });

      if (!payment) {
        return NextResponse.json(
          { success: false, error: "Payment not found" },
          { status: 404 }
        );
      }

      if (
        payment.status === "COMPLETED" &&
        (payment.eventRegistration || payment.membership)
      ) {
        return NextResponse.json(
          {
            success: false,
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
      const payment = await prisma.customerPayment.findUnique({
        where: { id: paymentId },
        include: {
          eventRegistration: true,
        },
      });

      if (!payment) {
        return NextResponse.json(
          { success: false, error: "Payment not found" },
          { status: 404 }
        );
      }

      if (payment.status === "COMPLETED" && payment.eventRegistration) {
        return NextResponse.json(
          {
            success: false,
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
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete payment",
      },
      { status: 500 }
    );
  }
}