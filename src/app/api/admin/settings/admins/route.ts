import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { logAdminActivity } from "@/lib/activityLogger";
import { Session } from "next-auth"; // Add this import

async function generateUserId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = currentYear.toString();

  const latestUser = await prisma.user.findFirst({
    where: {
      id: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  let nextNumber = 1;

  if (latestUser) {
    const lastNumber = parseInt(latestUser.id.slice(-3));
    nextNumber = lastNumber + 1;
  }

  return `${yearPrefix}${nextNumber.toString().padStart(3, "0")}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Properly type session and body
  let session: Session | null = null;
  let body: { name?: string; email?: string; password?: string } = {};

  try {
    session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    const userId = await generateUserId();
    const hashedPassword = await hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        isMember: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Log admin creation activity
    await logAdminActivity(
      session.user.id,
      "ADMIN_USER_CREATED",
      `Created new admin user: ${admin.name} (${admin.email})`,
      {
        userId: admin.id,
        referenceId: admin.id,
        referenceType: "USER",
        metadata: {
          adminId: admin.id,
          adminName: admin.name,
          adminEmail: admin.email,
          createdBy: session.user.name,
          createdByEmail: session.user.email,
        },
        request,
      }
    );

    return NextResponse.json({ success: true, data: admin });
  } catch (error) {
    console.error("Error creating admin:", error);

    // Log failed admin creation
    if (session?.user?.id) {
      await logAdminActivity(
        session.user.id,
        "ADMIN_USER_CREATED",
        `Failed to create admin user: ${body?.name || "Unknown"}`,
        {
          metadata: {
            attemptedName: body?.name,
            attemptedEmail: body?.email,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          request,
          isSuccess: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
