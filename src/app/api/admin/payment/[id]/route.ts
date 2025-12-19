import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus } from "@/generated/prisma";
import { MembershipPaymentApprovedEmail } from '@/app/components/email-template/MembershipPaymentApprovedEmail';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { logAdminActivity } from '@/lib/activityLogger';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      // Fetch existing payment with full relations
      const existingPayment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          membership: {
            include: {
              user: true,
              plan: {
                include: {
                  perks: true,
                },
              },
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

      const previousStatus = existingPayment.status;

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
              plan: {
                include: {
                  perks: true,
                },
              },
            },
          },
        },
      });

      // Handle membership activation and email sending
      if (
        status === "COMPLETED" &&
        previousStatus !== "COMPLETED" &&
        existingPayment.membership
      ) {
        const membership = existingPayment.membership;

        // Update membership to ACTIVE
        await prisma.membership.update({
          where: { id: membership.id },
          data: {
            status: "ACTIVE",
          },
        });

        // Update user isMember flag
        await prisma.user.update({
          where: { id: membership.userId },
          data: { isMember: true },
        });

        // 🔧 FIX: Send payment approval email with benefits
        try {
          if (membership.user && membership.plan) {
            // Transform perks into benefits format
            const benefits =
              membership.plan.perks?.map((perk) => ({
                name: perk.name,
                description: perk.description || "",
                quantity: perk.quantity,
                unit: perk.unit,
              })) || [];

            // 🔧 FIX: Await render() to get the HTML string
            const emailHtml = await render(
              MembershipPaymentApprovedEmail({
                name: membership.user.name,
                planName: membership.plan.name,
                amount: existingPayment.amount,
                paymentReference: existingPayment.paymentReference || "",
                startDate: membership.startDate.toISOString(),
                endDate: membership.endDate?.toISOString() || "",
                benefits,
              })
            );

            // 🔧 FIX: Ensure emailHtml is a string
            if (typeof emailHtml !== 'string') {
              throw new Error('Email render did not return a string');
            }

            await resend.emails.send({
              from: "KITA Spaces <noreply@notifications.kitaspaces.com>",
              to: membership.user.email,
              subject: "🎉 Your KITA Spaces Membership is Now Active!",
              html: emailHtml,
            });

            console.info(
              `✅ Payment approval email sent to ${membership.user.email}`
            );

            // Log email sent
            await logAdminActivity(
              session.user.id,
              "ADMIN_PAYMENT_VERIFIED",
              `Approved membership payment and sent confirmation email to ${membership.user.email}`,
              {
                referenceId: paymentId,
                referenceType: "PAYMENT",
                metadata: {
                  paymentId,
                  membershipId: membership.id,
                  userId: membership.userId,
                  userEmail: membership.user.email,
                  planName: membership.plan.name,
                  amount: existingPayment.amount,
                  benefitsCount: benefits.length,
                  emailSent: true,
                },
              }
            );
          }
        } catch (emailError) {
          console.error("Failed to send payment approval email:", emailError);

          // Log email failure
          await logAdminActivity(
            session.user.id,
            "ADMIN_PAYMENT_VERIFIED",
            `Approved membership payment but failed to send email to ${existingPayment.membership?.user?.email}`,
            {
              referenceId: paymentId,
              referenceType: "PAYMENT",
              metadata: {
                paymentId,
                membershipId: existingPayment.membership?.id,
                userId: existingPayment.membership?.userId,
                userEmail: existingPayment.membership?.user?.email,
                error:
                  emailError instanceof Error
                    ? emailError.message
                    : "Unknown error",
                emailSent: false,
              },
              isSuccess: false,
              errorMessage:
                emailError instanceof Error
                  ? emailError.message
                  : "Failed to send email",
            }
          );

          // Don't fail the payment update if email fails
        }
      }

      // Log payment status update for other cases
      if (status !== previousStatus) {
        const actionType =
          status === "COMPLETED"
            ? "ADMIN_PAYMENT_VERIFIED"
            : status === "FAILED"
              ? "ADMIN_PAYMENT_REJECTED"
              : status === "REFUNDED"
                ? "ADMIN_PAYMENT_REFUNDED"
                : "ADMIN_PAYMENT_VERIFIED";

        const actionDescription =
          status === "COMPLETED"
            ? existingPayment.membership
              ? `Approved membership payment for ${existingPayment.user.name}`
              : existingPayment.eventRegistration
                ? `Approved event registration payment for ${existingPayment.user.name}`
                : `Approved payment for ${existingPayment.user.name}`
            : status === "FAILED"
              ? `Rejected payment for ${existingPayment.user.name}`
              : status === "REFUNDED"
                ? `Refunded payment for ${existingPayment.user.name}`
                : `Updated payment status to ${status} for ${existingPayment.user.name}`;

        await logAdminActivity(
          session.user.id,
          actionType,
          actionDescription,
          {
            referenceId: paymentId,
            referenceType: "PAYMENT",
            metadata: {
              paymentId,
              userId: existingPayment.userId,
              userName: existingPayment.user.name,
              userEmail: existingPayment.user.email,
              amount: existingPayment.amount,
              previousStatus,
              newStatus: status,
              paymentMethod: existingPayment.paymentMethod,
              paymentReference: existingPayment.paymentReference,
              hasMembership: !!existingPayment.membership,
              hasEventRegistration: !!existingPayment.eventRegistration,
              notes: notes || null,
            },
          }
        );
      }
    } else {
      // Customer payment logic (unchanged)
      const existingPayment = await prisma.customerPayment.findUnique({
        where: { id: paymentId },
        include: {
          eventRegistration: {
            include: {
              event: true,
            },
          },
          customer: true,
        },
      });

      if (!existingPayment) {
        return NextResponse.json(
          { success: false, error: "Payment not found" },
          { status: 404 }
        );
      }

      const previousStatus = existingPayment.status;

      const updatedNotes = notes
        ? `${existingPayment.notes || ""}\n[Admin Update ${new Date().toISOString()}]: ${notes}`.trim()
        : existingPayment.notes;

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

      if (status !== previousStatus) {
        const actionType =
          status === "COMPLETED"
            ? "ADMIN_PAYMENT_VERIFIED"
            : status === "FAILED"
              ? "ADMIN_PAYMENT_REJECTED"
              : status === "REFUNDED"
                ? "ADMIN_PAYMENT_REFUNDED"
                : "ADMIN_PAYMENT_VERIFIED";

        const actionDescription =
          status === "COMPLETED"
            ? `Approved customer payment for ${existingPayment.customer.name}`
            : status === "FAILED"
              ? `Rejected customer payment for ${existingPayment.customer.name}`
              : status === "REFUNDED"
                ? `Refunded customer payment for ${existingPayment.customer.name}`
                : `Updated customer payment status to ${status} for ${existingPayment.customer.name}`;

        await logAdminActivity(
          session.user.id,
          actionType,
          actionDescription,
          {
            referenceId: paymentId,
            referenceType: "PAYMENT",
            metadata: {
              paymentId,
              customerId: existingPayment.customerId,
              customerName: existingPayment.customer.name,
              customerEmail: existingPayment.customer.email,
              amount: existingPayment.amount,
              previousStatus,
              newStatus: status,
              paymentMethod: existingPayment.paymentMethod,
              paymentReference: existingPayment.paymentReference,
              hasEventRegistration: !!existingPayment.eventRegistration,
              notes: notes || null,
            },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: `Payment status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);

    const session = await getServerSession(authOptions);
    const { id: paymentId } = await context.params;
    if (session?.user) {
      await logAdminActivity(
        session.user.id,
        "ADMIN_PAYMENT_VERIFIED",
        `Failed to update payment status (ID: ${paymentId}): ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          referenceId: paymentId,
          referenceType: "PAYMENT",
          metadata: {
            paymentId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          isSuccess: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

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

// GET and DELETE methods remain the same...
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
            plan: {
              include: {
                perks: true,
              },
            },
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
          user: true,
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

      await logAdminActivity(
        session.user.id,
        "ADMIN_PAYMENT_REJECTED",
        `Deleted payment for ${payment.user.name}`,
        {
          referenceId: paymentId,
          referenceType: "PAYMENT",
          metadata: {
            paymentId,
            userId: payment.userId,
            userName: payment.user.name,
            userEmail: payment.user.email,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            hasMembership: !!payment.membership,
            hasEventRegistration: !!payment.eventRegistration,
          },
        }
      );
    } else {
      const payment = await prisma.customerPayment.findUnique({
        where: { id: paymentId },
        include: {
          eventRegistration: true,
          customer: true,
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

      await logAdminActivity(
        session.user.id,
        "ADMIN_PAYMENT_REJECTED",
        `Deleted customer payment for ${payment.customer.name}`,
        {
          referenceId: paymentId,
          referenceType: "PAYMENT",
          metadata: {
            paymentId,
            customerId: payment.customerId,
            customerName: payment.customer.name,
            customerEmail: payment.customer.email,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            hasEventRegistration: !!payment.eventRegistration,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);

    const session = await getServerSession(authOptions);
    const { id: paymentId } = await context.params;
    if (session?.user) {
      await logAdminActivity(
        session.user.id,
        "ADMIN_PAYMENT_REJECTED",
        `Failed to delete payment (ID: ${paymentId}): ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          referenceId: paymentId,
          referenceType: "PAYMENT",
          metadata: {
            paymentId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          isSuccess: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

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