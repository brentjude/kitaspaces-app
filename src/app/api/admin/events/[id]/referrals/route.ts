import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueReferralCode } from "@/lib/utils/referral";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/events/[id]/referrals
 * Returns all referrals for an event
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: eventId } = await params;

    const referrals = await prisma.eventReferral.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: referrals });
  } catch (error) {
    console.error("GET referrals error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch referrals" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/events/[id]/referrals
 * Creates a new referral for the event
 * Body: { name: string, code: string }
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, hasReferral: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    if (!event.hasReferral) {
      return NextResponse.json(
        { success: false, error: "Referrals are not enabled for this event" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { name?: string; code?: string };
    const { name } = body;
    let { code } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Referral name is required" },
        { status: 400 },
      );
    }

    // If no code provided, generate a unique one
    if (!code?.trim()) {
      code = await generateUniqueReferralCode(prisma);
    } else {
      code = code.trim().toUpperCase();
      // Validate: 6 alphanumeric chars
      if (!/^[A-Z0-9]{6}$/.test(code)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Referral code must be exactly 6 alphanumeric characters (A-Z, 0-9)",
          },
          { status: 400 },
        );
      }
    }

    const referral = await prisma.eventReferral.create({
      data: {
        eventId,
        name: name.trim(),
        code,
      },
    });

    return NextResponse.json({ success: true, data: referral });
  } catch (error) {
    console.error("POST referral error:", error);

    // Unique constraint violation (code already exists)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This referral code is already in use. Please choose a different code.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create referral" },
      { status: 500 },
    );
  }
}
