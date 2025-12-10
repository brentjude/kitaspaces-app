import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/payment-settings
 * Fetch payment settings (bank info and QR code) for public use
 * No authentication required
 */
export async function GET() {
  try {
    const settings = await prisma.adminSettings.findFirst();

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Return only payment-related fields (no sensitive data)
    return NextResponse.json({
      success: true,
      data: {
        bankName: settings.bankName,
        accountNumber: settings.accountNumber,
        accountName: settings.accountName,
        qrCodeUrl: settings.qrCodeUrl,
        qrCodeNumber: settings.qrCodeNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment settings",
      },
      { status: 500 }
    );
  }
}
