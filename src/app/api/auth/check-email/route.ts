import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email exists in users table
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    return NextResponse.json({
      success: true,
      exists: !!existingUser,
      message: existingUser
        ? 'Email is already registered'
        : 'Email is available',
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check email availability',
      },
      { status: 500 }
    );
  }
}