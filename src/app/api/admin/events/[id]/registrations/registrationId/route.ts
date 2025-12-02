import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/events/[id]/registrations/[registrationId]
 * Update registration payment status
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { registrationId } = params;
    const body = await request.json();
    const { paymentStatus } = body;

    if (!['COMPLETED', 'PENDING', 'FREE'].includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // Get registration
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        payment: true,
        event: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Handle payment status update
    if (paymentStatus === 'FREE') {
      // Delete existing payment if any
      if (registration.payment) {
        await prisma.payment.delete({
          where: { id: registration.payment.id },
        });
      }
    } else {
      // Create or update payment
      if (registration.payment) {
        await prisma.payment.update({
          where: { id: registration.payment.id },
          data: {
            status: paymentStatus,
            paidAt: paymentStatus === 'COMPLETED' ? new Date() : null,
          },
        });
      } else {
        await prisma.payment.create({
          data: {
            userId: registration.userId,
            amount: registration.event.price,
            paymentMethod: 'OTHER',
            status: paymentStatus,
            paidAt: paymentStatus === 'COMPLETED' ? new Date() : null,
            eventRegistration: {
              connect: { id: registrationId },
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update payment status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]/registrations/[registrationId]
 * Remove a registrant from an event
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { registrationId } = params;

    // Delete related records first
    await prisma.paxFreebie.deleteMany({
      where: {
        pax: {
          registrationId,
        },
      },
    });

    await prisma.eventPax.deleteMany({
      where: { registrationId },
    });

    // Delete registration (payment will be deleted via cascade)
    await prisma.eventRegistration.delete({
      where: { id: registrationId },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete registration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}