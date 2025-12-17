import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAdminActivity } from "@/lib/activityLogger";
import { Session } from "next-auth"; // Add this import

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let session: Session | null = null;
  let body: { name?: string; password?: string } = {};
  let adminId = "";

  try {
    session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    adminId = params.id;
    body = await request.json();
    const { name, password } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { id: adminId, role: "ADMIN" },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: { name: string; password?: string } = {
      name: name.trim(),
    };

    // Hash password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Track what changed
    const changes: string[] = [];
    if (existingAdmin.name !== name.trim()) {
      changes.push("name");
    }
    if (password) {
      changes.push("password");
    }

    // Update admin
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Log admin update activity
    await logAdminActivity(
      session.user.id,
      "ADMIN_USER_UPDATED",
      `Updated admin user: ${updatedAdmin.name} (${updatedAdmin.email})`,
      {
        userId: updatedAdmin.id,
        referenceId: updatedAdmin.id,
        referenceType: "USER",
        metadata: {
          adminId: updatedAdmin.id,
          adminName: updatedAdmin.name,
          adminEmail: updatedAdmin.email,
          fieldsUpdated: changes,
          previousName: existingAdmin.name,
          newName: updatedAdmin.name,
          passwordChanged: !!password,
          updatedBy: session.user.name,
          updatedByEmail: session.user.email,
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);

    // Log failed admin update
    if (session?.user?.id) {
      await logAdminActivity(
        session.user.id,
        "ADMIN_USER_UPDATED",
        `Failed to update admin user (ID: ${adminId})`,
        {
          userId: adminId,
          referenceId: adminId,
          referenceType: "USER",
          metadata: {
            attemptedChanges: body,
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
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update admin",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let session: Session | null = null;
  let adminId = "";
  let existingAdmin: { id: string; name: string; email: string } | null = null;

  try {
    session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    adminId = params.id;

    // Prevent self-deletion
    if (adminId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if admin exists
    existingAdmin = await prisma.user.findUnique({
      where: { id: adminId, role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    // Delete admin
    await prisma.user.delete({
      where: { id: adminId },
    });

    // Log admin deletion activity
    await logAdminActivity(
      session.user.id,
      "ADMIN_USER_DELETED",
      `Deleted admin user: ${existingAdmin.name} (${existingAdmin.email})`,
      {
        referenceId: existingAdmin.id,
        referenceType: "USER",
        metadata: {
          deletedAdminId: existingAdmin.id,
          deletedAdminName: existingAdmin.name,
          deletedAdminEmail: existingAdmin.email,
          deletedBy: session.user.name,
          deletedByEmail: session.user.email,
        },
        request,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);

    // Log failed admin deletion
    if (session?.user?.id && adminId) {
      await logAdminActivity(
        session.user.id,
        "ADMIN_USER_DELETED",
        `Failed to delete admin user (ID: ${adminId})`,
        {
          referenceId: adminId,
          referenceType: "USER",
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
            targetAdminName: existingAdmin?.name,
            targetAdminEmail: existingAdmin?.email,
          },
          request,
          isSuccess: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete admin",
      },
      { status: 500 }
    );
  }
}
