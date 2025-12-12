import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentRecord, PaymentStats } from '@/types/payment';
import { PaymentStatus, Prisma } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const typeFilter = searchParams.get('typeFilter') || 'all';
    const statusFilter = searchParams.get('statusFilter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for user payments
    const userPaymentWhereConditions: Prisma.PaymentWhereInput[] = [];

    // Add search conditions
    if (search) {
      userPaymentWhereConditions.push({
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { paymentReference: { contains: search, mode: 'insensitive' } },
          { referenceNumber: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Add status filter
    if (statusFilter !== 'all') {
      const mappedStatus = statusFilter.toUpperCase() as PaymentStatus;
      userPaymentWhereConditions.push({ status: mappedStatus });
    }

    // Add type filter
    if (typeFilter === 'event') {
      userPaymentWhereConditions.push({ eventRegistration: { isNot: null } });
    } else if (typeFilter === 'membership') {
      userPaymentWhereConditions.push({ membership: { isNot: null } });
    }

    const userPaymentWhere: Prisma.PaymentWhereInput =
      userPaymentWhereConditions.length > 0
        ? { AND: userPaymentWhereConditions }
        : {};

    // Build where clause for customer payments
    const customerPaymentWhereConditions: Prisma.CustomerPaymentWhereInput[] = [];

    // Add search conditions
    if (search) {
      customerPaymentWhereConditions.push({
        OR: [
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
          { paymentReference: { contains: search, mode: 'insensitive' } },
          { referenceNumber: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Add status filter
    if (statusFilter !== 'all') {
      const mappedStatus = statusFilter.toUpperCase() as PaymentStatus;
      customerPaymentWhereConditions.push({ status: mappedStatus });
    }

    const customerPaymentWhere: Prisma.CustomerPaymentWhereInput =
      customerPaymentWhereConditions.length > 0
        ? { AND: customerPaymentWhereConditions }
        : {};

    // Fetch user payments (skip if filtering for membership only since customers don't have memberships)
    const [userPayments, customerPayments] = await Promise.all([
      typeFilter !== 'membership'
        ? prisma.payment.findMany({
            where: userPaymentWhere,
            include: {
              user: {
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
                    },
                  },
                },
              },
              membership: {
                include: {
                  plan: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        : Promise.resolve([]),
      typeFilter !== 'membership'
        ? prisma.customerPayment.findMany({
            where: customerPaymentWhere,
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
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        : Promise.resolve([]),
    ]);

    // Transform user payments
    const transformedUserPayments: PaymentRecord[] = userPayments.map((payment) => ({
      id: payment.id,
      type: 'USER' as const,
      recordType: payment.eventRegistration ? ('EVENT' as const) : ('MEMBERSHIP' as const),
      date: payment.createdAt,
      userName: payment.user.name,
      userEmail: payment.user.email,
      userPhone: payment.user.contactNumber,
      description: payment.eventRegistration
        ? `Event: ${payment.eventRegistration.event.title}`
        : payment.membership
        ? `Membership: ${payment.membership.plan?.name || 'N/A'}`
        : 'Payment',
      amount: payment.amount,
      method: payment.paymentMethod,
      status: payment.status,
      referenceNumber: payment.referenceNumber,
      paymentReference: payment.paymentReference,
      proofImageUrl: payment.proofImageUrl,
      notes: payment.notes,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      eventTitle: payment.eventRegistration?.event.title,
      membershipPlan: payment.membership?.plan?.name,
      numberOfPax: payment.eventRegistration?.numberOfPax,
    }));

    // Transform customer payments
    const transformedCustomerPayments: PaymentRecord[] = customerPayments.map((payment) => ({
      id: payment.id,
      type: 'CUSTOMER' as const,
      recordType: 'EVENT' as const,
      date: payment.createdAt,
      userName: payment.customer.name,
      userEmail: payment.customer.email,
      userPhone: payment.customer.contactNumber,
      description: payment.eventRegistration
        ? `Event: ${payment.eventRegistration.event.title}`
        : 'Payment',
      amount: payment.amount,
      method: payment.paymentMethod,
      status: payment.status,
      referenceNumber: payment.referenceNumber,
      paymentReference: payment.paymentReference,
      proofImageUrl: payment.proofImageUrl,
      notes: payment.notes,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      eventTitle: payment.eventRegistration?.event.title,
      numberOfPax: payment.eventRegistration?.numberOfPax,
    }));

    // Combine and sort all payments
    const allPayments = [...transformedUserPayments, ...transformedCustomerPayments].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    // Paginate
    const total = allPayments.length;
    const paginatedPayments = allPayments.slice(skip, skip + limit);

    // Calculate stats
    const stats: PaymentStats = {
      totalRevenue: allPayments
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0),
      totalPaid: allPayments.filter((p) => p.status === 'COMPLETED').length,
      totalPending: allPayments.filter((p) => p.status === 'PENDING').length,
      totalRefunded: allPayments.filter((p) => p.status === 'REFUNDED').length,
      eventRevenue: allPayments
        .filter((p) => p.recordType === 'EVENT' && p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0),
      membershipRevenue: allPayments
        .filter((p) => p.recordType === 'MEMBERSHIP' && p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        payments: paginatedPayments,
        stats,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payments',
      },
      { status: 500 }
    );
  }
}