import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string; refId: string }>;
}

/**
 * PATCH /api/admin/events/[id]/referrals/[refId]
 * Updates a referral's name and/or code
 * Body: { name?: string, code?: string }
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: eventId, refId } = await params;

    const existing = await prisma.eventReferral.findFirst({
      where: { id: refId, eventId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Referral not found" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as { name?: string; code?: string };

    const updateData: { name?: string; code?: string } = {};

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json(
          { success: false, error: "Referral name cannot be empty" },
          { status: 400 },
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.code !== undefined) {
      const code = body.code.trim().toUpperCase();
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
      updateData.code = code;
    }

    const updated = await prisma.eventReferral.update({
      where: { id: refId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH referral error:", error);

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
      { success: false, error: "Failed to update referral" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/events/[id]/referrals/[refId]
 * Deletes a referral
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: eventId, refId } = await params;

    const existing = await prisma.eventReferral.findFirst({
      where: { id: refId, eventId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Referral not found" },
        { status: 404 },
      );
    }

    await prisma.eventReferral.delete({ where: { id: refId } });

    return NextResponse.json({ success: true, message: "Referral deleted" });
  } catch (error) {
    console.error("DELETE referral error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete referral" },
      { status: 500 },
    );
  }
}
