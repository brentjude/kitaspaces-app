import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signUpSchema } from '@/lib/validations/zodauth';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validatedFields = signUpSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validatedFields.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Validate that name exists
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await hash(password, 10);

    // Create new user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name, // Now TypeScript knows it's definitely a string
        role: UserRole.USER,
        isMember: false,
      },
    });

    // Return user data (exclude password for security)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}