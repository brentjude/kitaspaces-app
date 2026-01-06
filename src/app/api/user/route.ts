import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        company: true,
        contactNumber: true,
        birthdate: true,
        referralSource: true,
        agreeToNewsletter: true,
        role: true,
        isMember: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      nickname,
      company,
      contactNumber,
      birthdate,
      referralSource,
      agreeToNewsletter,
    } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!contactNumber?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Contact number is required' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        nickname: nickname?.trim() || null,
        company: company?.trim() || null,
        contactNumber: contactNumber.trim(),
        birthdate: birthdate ? new Date(birthdate) : null,
        referralSource: referralSource || null,
        agreeToNewsletter: agreeToNewsletter || false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        company: true,
        contactNumber: true,
        birthdate: true,
        referralSource: true,
        agreeToNewsletter: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}