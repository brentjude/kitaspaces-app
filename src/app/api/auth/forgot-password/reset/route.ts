import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/passwordReset';
import { verifyOTP, isOTPExpired } from '@/lib/otp';
import { hash } from 'bcryptjs';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = resetPasswordSchema.parse(body);

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
          error: 'Invalid or expired reset session.',
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
          error: 'Reset session has expired. Please start over.',
        },
        { status: 400 }
      );
    }

    // Verify OTP one more time
    const isValid = verifyOTP(otp, email, token.otpHash);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid reset session.',
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Password reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}