import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MembershipType } from "@/generated/prisma";

// GET specific membership plan
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const plan = await prisma.membershipPlan.findUnique({
      where: { id },
      include: {
        perks: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Membership plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Error fetching membership plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch membership plan" },
      { status: 500 }
    );
  }
}

// PUT - Update membership plan
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const { name, description, type, price, durationDays, isActive, perks } =
      body;

    // Check if plan exists
    const existingPlan = await prisma.membershipPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: "Membership plan not found" },
        { status: 404 }
      );
    }

    // Delete existing perks and create new ones
    await prisma.membershipPlanPerk.deleteMany({
      where: { planId: id },
    });

    const plan = await prisma.membershipPlan.update({
      where: { id },
      data: {
        name,
        description: description || null,
        type: type as MembershipType,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        isActive: isActive !== false,
        perks: {
          create: (perks || []).map(
            (perk: {
              perkType: string;
              name: string;
              description?: string;
              quantity: number;
              unit: string;
              maxPerDay?: number;
              maxPerWeek?: number;
              maxPerMonth?: number;
              daysOfWeek?: number[];
              isRecurring: boolean;
              validFrom?: string;
              validUntil?: string;
            }) => ({
              perkType: perk.perkType,
              name: perk.name,
              description: perk.description || null,
              quantity: parseFloat(String(perk.quantity)),
              unit: perk.unit,
              maxPerDay: perk.maxPerDay
                ? parseFloat(String(perk.maxPerDay))
                : null,
              maxPerWeek: perk.maxPerWeek
                ? parseFloat(String(perk.maxPerWeek))
                : null,
              maxPerMonth: perk.maxPerMonth
                ? parseFloat(String(perk.maxPerMonth))
                : null,
              daysOfWeek: perk.daysOfWeek
                ? JSON.stringify(perk.daysOfWeek)
                : null,
              isRecurring: perk.isRecurring !== false,
              validFrom: perk.validFrom || null,
              validUntil: perk.validUntil || null,
            })
          ),
        },
      },
      include: {
        perks: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: plan,
      message: "Membership plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating membership plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update membership plan" },
      { status: 500 }
    );
  }
}

// DELETE membership plan
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Check if plan exists
    const existingPlan = await prisma.membershipPlan.findUnique({
      where: { id },
      include: {
        memberships: true,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: "Membership plan not found" },
        { status: 404 }
      );
    }

    // Check if plan has active memberships
    if (existingPlan.memberships.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete plan with active memberships. Deactivate it instead.",
        },
        { status: 400 }
      );
    }

    await prisma.membershipPlan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Membership plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting membership plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete membership plan" },
      { status: 500 }
    );
  }
}
