import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOtpSchema } from '@/lib/validations/passwordReset';
import { verifyOTP, isOTPExpired } from '@/lib/otp';
import { ZodError } from 'zod';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    // Find valid token
    const token = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired reset code.',
        },
        { status: 400 }
      );
    }

    // Check attempts
    if (token.attempts >= MAX_ATTEMPTS) {
      await prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { used: true },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed attempts. Please request a new code.',
        },
        { status: 400 }
      );
    }

    // Check if expired
    if (isOTPExpired(token.expiresAt)) {
      await prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { used: true },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Reset code has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = verifyOTP(otp, email, token.otpHash);

    if (!isValid) {
      // Increment attempts
      await prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { attempts: token.attempts + 1 },
      });

      const attemptsLeft = MAX_ATTEMPTS - (token.attempts + 1);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully.',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.issues, // Changed from error.errors
        },
        { status: 400 }
      );
    }

    console.error('OTP verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}