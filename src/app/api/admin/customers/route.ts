import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';

/**
 * GET /api/admin/customers
 * 
 * @description Get all customers (both registered users and guest customers)
 * @query search - Search by name, email, or company
 * @query filter - Filter by type: 'all' | 'registered' | 'guest'
 * @query page - Page number for pagination
 * @query limit - Items per page
 * 
 * @returns Combined list of users and customers with registration/payment stats
 * 
 * @note This endpoint requires ADMIN authentication
 * @note Registered users are from User model, guests are from Customer model
 */

// Type for transformed user data
type TransformedUser = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  contactNumber: string | null;
  isRegistered: true;
  isMember: boolean;
  referralSource: string | null;
  joinedDate: Date;
  eventRegistrations: number;
  totalPayments: number;
  type: 'user';
};

// Type for transformed customer data
type TransformedCustomer = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  contactNumber: string | null;
  isRegistered: false;
  isMember: false;
  referralSource: string | null;
  joinedDate: Date;
  eventRegistrations: number;
  totalPayments: number;
  type: 'customer';
  linkedUserId: string | null;
};

// Combined type for API response
type CombinedCustomerData = TransformedUser | TransformedCustomer;

// Type for API response
type CustomerApiResponse = {
  success: boolean;
  data?: {
    customers: CombinedCustomerData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      totalUsers: number;
      totalCustomers: number;
      totalCombined: number;
    };
  };
  error?: string;
  message?: string;
};

export async function GET(request: NextRequest): Promise<NextResponse<CustomerApiResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const skip = (page - 1) * limit;

    // Helper function to build search where clause for User
    const buildUserSearchWhere = (searchTerm: string): Prisma.UserWhereInput => {
      if (!searchTerm) return {};

      return {
        OR: [
          { name: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
          { company: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
        ],
      };
    };

    // Helper function to build search where clause for Customer
    const buildCustomerSearchWhere = (searchTerm: string): Prisma.CustomerWhereInput => {
      if (!searchTerm) return {};

      return {
        OR: [
          { name: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
          { company: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
        ],
      };
    };

    let users: TransformedUser[] = [];
    let customers: TransformedCustomer[] = [];
    let totalUsers = 0;
    let totalCustomers = 0;

    // Fetch registered users if filter allows
    if (filter === 'all' || filter === 'registered') {
      const userWhere: Prisma.UserWhereInput = {
        ...buildUserSearchWhere(search),
        role: 'USER', // Only fetch non-admin users
      };

      const [fetchedUsers, userCount] = await Promise.all([
        prisma.user.findMany({
          where: userWhere,
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            contactNumber: true,
            isMember: true,
            createdAt: true,
            referralSource: true,
            _count: {
              select: {
                eventRegistrations: true,
                payments: true,
              },
            },
          },
          skip: filter === 'registered' ? skip : undefined,
          take: filter === 'registered' ? limit : undefined,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: userWhere }),
      ]);

      totalUsers = userCount;

      // Transform users with proper typing
      users = fetchedUsers.map((user): TransformedUser => ({
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        contactNumber: user.contactNumber,
        isRegistered: true,
        isMember: user.isMember,
        referralSource: user.referralSource,
        joinedDate: user.createdAt,
        eventRegistrations: user._count.eventRegistrations,
        totalPayments: user._count.payments,
        type: 'user',
      }));
    }

    // Fetch guest customers if filter allows
    if (filter === 'all' || filter === 'guest') {
      const customerWhere: Prisma.CustomerWhereInput = {
        ...buildCustomerSearchWhere(search),
      };

      const [fetchedCustomers, customerCount] = await Promise.all([
        prisma.customer.findMany({
          where: customerWhere,
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            contactNumber: true,
            createdAt: true,
            referralSource: true,
            userId: true,
            _count: {
              select: {
                eventRegistrations: true,
                payments: true,
              },
            },
          },
          skip: filter === 'guest' ? skip : undefined,
          take: filter === 'guest' ? limit : undefined,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.customer.count({ where: customerWhere }),
      ]);

      totalCustomers = customerCount;

      // Transform customers with proper typing
      customers = fetchedCustomers.map((customer): TransformedCustomer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        company: customer.company,
        contactNumber: customer.contactNumber,
        isRegistered: false,
        isMember: false,
        referralSource: customer.referralSource,
        joinedDate: customer.createdAt,
        eventRegistrations: customer._count.eventRegistrations,
        totalPayments: customer._count.payments,
        type: 'customer',
        linkedUserId: customer.userId,
      }));
    }

    // Combine and sort by date - properly typed
    const combined: CombinedCustomerData[] = [...users, ...customers].sort((a, b) => 
      new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
    );

    // Apply pagination for 'all' filter
    const paginatedData = filter === 'all' 
      ? combined.slice(skip, skip + limit)
      : combined;

    const total = filter === 'all' 
      ? totalUsers + totalCustomers
      : filter === 'registered' 
        ? totalUsers 
        : totalCustomers;

    return NextResponse.json({
      success: true,
      data: {
        customers: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalUsers,
          totalCustomers,
          totalCombined: totalUsers + totalCustomers,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}