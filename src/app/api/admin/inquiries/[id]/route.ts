import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { InquiryStatus } from '@/generated/prisma';
import { logAdminActivity } from '@/lib/activityLogger';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
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
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inquiry,
    });

  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inquiry',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    interface UpdateData {
      status?: InquiryStatus;
      assignedToId?: string | null;
      response?: string;
      respondedAt?: Date;
      respondedById?: string;
    }

    const updateData: UpdateData = {};

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.assignedToId !== undefined) {
      updateData.assignedToId = body.assignedToId;
    }

    if (body.response) {
      updateData.response = body.response;
      updateData.respondedAt = new Date();
      updateData.respondedById = session.user.id!;
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData,
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
    });

    // Convert updateData to serializable format for logging
    const serializedChanges: { [key: string]: string | null } = {};
    
    if (updateData.status) {
      serializedChanges.status = updateData.status;
    }
    
    if (updateData.assignedToId !== undefined) {
      serializedChanges.assignedToId = updateData.assignedToId;
    }
    
    if (updateData.response) {
      serializedChanges.response = updateData.response;
    }
    
    if (updateData.respondedAt) {
      serializedChanges.respondedAt = updateData.respondedAt.toISOString();
    }
    
    if (updateData.respondedById) {
      serializedChanges.respondedById = updateData.respondedById;
    }

    // Log admin activity
    await logAdminActivity(
      session.user.id!,
      'ADMIN_INQUIRY_UPDATED',
      `Updated inquiry from ${inquiry.name} (${inquiry.email})`,
      {
        referenceId: inquiry.id,
        referenceType: 'INQUIRY',
        metadata: {
          changes: serializedChanges,
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      data: inquiry,
      message: 'Inquiry updated successfully',
    });

  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update inquiry',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const inquiry = await prisma.inquiry.delete({
      where: { id },
    });

    // Log admin activity
    await logAdminActivity(
      session.user.id!,
      'ADMIN_INQUIRY_DELETED',
      `Deleted inquiry from ${inquiry.name} (${inquiry.email})`,
      {
        referenceId: inquiry.id,
        referenceType: 'INQUIRY',
        metadata: {
          inquiry: {
            name: inquiry.name,
            email: inquiry.email,
            reason: inquiry.reason,
          },
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete inquiry',
      },
      { status: 500 }
    );
  }
}