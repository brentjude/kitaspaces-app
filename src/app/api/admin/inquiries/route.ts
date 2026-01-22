import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InquiryStatus, InquiryReason, InquiryType } from '@/generated/prisma';

interface WhereCondition {
  status?: InquiryStatus;
  reason?: InquiryReason;
  type?: InquiryType;
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    email?: { contains: string; mode: 'insensitive' };
    message?: { contains: string; mode: 'insensitive' };
  }>;
}

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
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const type = searchParams.get('type');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: WhereCondition = {};

    if (status) {
      where.status = status.toUpperCase() as InquiryStatus;
    }
    if (reason) {
      where.reason = reason.toUpperCase() as InquiryReason;
    }
    if (type) {
      where.type = type.toUpperCase() as InquiryType;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          respondedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = {
      PENDING: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };

    stats.forEach((stat) => {
      statusCounts[stat.status as keyof typeof statusCounts] = stat._count;
    });

    return NextResponse.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats: statusCounts,
      },
    });

  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inquiries',
      },
      { status: 500 }
    );
  }
}