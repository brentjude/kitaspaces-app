import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch payment settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get or create settings (there should only be one record)
    let settings = await prisma.adminSettings.findFirst();

    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {},
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment settings" },
      { status: 500 }
    );
  }
}

// PUT - Update payment settings (partial updates allowed)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get existing settings
    let settings = await prisma.adminSettings.findFirst();

    // Prepare update data (only include fields that are present in body)
    const updateData: {
      bankName?: string | null;
      accountNumber?: string | null;
      accountName?: string | null;
      qrCodeUrl?: string | null;
      qrCodeNumber?: string | null;
    } = {};

    if ("bankName" in body) updateData.bankName = body.bankName;
    if ("accountNumber" in body) updateData.accountNumber = body.accountNumber;
    if ("accountName" in body) updateData.accountName = body.accountName;
    if ("qrCodeUrl" in body) updateData.qrCodeUrl = body.qrCodeUrl;
    if ("qrCodeNumber" in body) updateData.qrCodeNumber = body.qrCodeNumber;

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.adminSettings.create({
        data: updateData,
      });
    } else {
      // Update existing (only provided fields)
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Payment settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment settings" },
      { status: 500 }
    );
  }
}
