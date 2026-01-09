// filepath: c:\Users\Jude\Documents\GitHub\kitaspaces-app\src\app\api\admin\customers\guest\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/activityLogger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, contactNumber, email } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!contactNumber || !contactNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'Contact number is required' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Validate contact number format
    if (!/^[0-9+\s()-]{10,}$/.test(contactNumber.trim())) {
      return NextResponse.json(
        { success: false, error: 'Invalid contact number format' },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Check for existing customer with same contact number
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        contactNumber: contactNumber.trim(),
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: 'A customer with this contact number already exists',
        },
        { status: 409 }
      );
    }

    // Check for existing customer with same email (if provided)
    if (email && email.trim()) {
      const existingEmailCustomer = await prisma.customer.findFirst({
        where: {
          email: email.toLowerCase().trim(),
        },
      });

      if (existingEmailCustomer) {
        return NextResponse.json(
          {
            success: false,
            error: 'A customer with this email already exists',
          },
          { status: 409 }
        );
      }
    }

    // Create guest customer
    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        contactNumber: contactNumber.trim(),
        email: email && email.trim() ? email.toLowerCase().trim() : null,
        notes: 'Guest customer created by admin',
      },
    });

    // Log admin activity
    await logAdminActivity(
      session.user.id!,
      'ADMIN_USER_CREATED',
      `Created guest customer: ${customer.name}`,
      {
        referenceId: customer.id,
        referenceType: 'CUSTOMER',
        metadata: {
          customerName: customer.name,
          contactNumber: customer.contactNumber,
          email: customer.email || 'Not provided',
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Guest customer created successfully',
    });
  } catch (error) {
    console.error('Error creating guest customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create guest customer',
      },
      { status: 500 }
    );
  }
}