import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requestOtpSchema } from '@/lib/validations/passwordReset';
import { generateOTP, hashOTP, getOTPExpiry } from '@/lib/otp';
import { sendEmail } from '@/lib/email-service';
import PasswordResetEmail from '@/app/components/email-template/PasswordResetEmail';
import { ZodError } from 'zod';

const MAX_REQUESTS_PER_HOUR = 3;
const REQUEST_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestOtpSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset code.',
      });
    }

    // Rate limiting: Check recent requests
    const recentRequests = await prisma.passwordResetToken.count({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - REQUEST_WINDOW_MS),
        },
      },
    });

    if (recentRequests >= MAX_REQUESTS_PER_HOUR) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many reset requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp, email);
    const expiresAt = getOTPExpiry();

    // Invalidate previous tokens
    await prisma.passwordResetToken.updateMany({
      where: {
        email,
        used: false,
        expiresAt: { gte: new Date() },
      },
      data: { used: true },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        otpHash,
        expiresAt,
      },
    });

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset Code - KITA Spaces',
        react: PasswordResetEmail({
          userName: user.name || 'Member',
          otp,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send reset email. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a reset code.',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Password reset request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}