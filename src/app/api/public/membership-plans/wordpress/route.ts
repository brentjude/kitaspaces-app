import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, MembershipType } from "@/generated/prisma";
import { validateWordPressApiKey } from "@/lib/wordpress/api-key-validator";
import { checkRateLimit } from "@/lib/wordpress/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify API Key
    const apiKey = request.headers.get("x-api-key");
    if (!validateWordPressApiKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // 2. Rate Limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const type = searchParams.get("type") || "";

    // 4. Build query
    const where: Prisma.MembershipPlanWhereInput = {
      isActive: true,
    };

    if (type) {
      const validTypes = Object.values(MembershipType);
      if (validTypes.includes(type as MembershipType)) {
        where.type = type as MembershipType;
      }
    }

    // 5. Fetch membership plans with perks
    const plans = await prisma.membershipPlan.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        price: true,
        durationDays: true,
        isActive: true,
        perks: {
          select: {
            id: true,
            name: true,
            description: true,
            perkType: true,
            quantity: true,
            unit: true,
            maxPerDay: true,
            maxPerWeek: true,
            daysOfWeek: true,
            isRecurring: true,
            validFrom: true,
            validUntil: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: [{ type: "asc" }, { price: "asc" }],
      take: limit,
    });

    // 6. Transform data for WordPress
    const transformedPlans = plans.map((plan) => {
      const pricePerDay = plan.price / plan.durationDays;

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        type: plan.type,
        price: plan.price,
        durationDays: plan.durationDays,
        isActive: plan.isActive,
        pricePerDay: Math.round(pricePerDay * 100) / 100,
        perks: plan.perks.map((perk) => ({
          id: perk.id,
          name: perk.name,
          description: perk.description,
          type: perk.perkType,
          quantity: perk.quantity,
          unit: perk.unit,
          maxPerDay: perk.maxPerDay,
          maxPerWeek: perk.maxPerWeek,
          daysOfWeek: perk.daysOfWeek,
          isRecurring: perk.isRecurring,
          validFrom: perk.validFrom,
          validUntil: perk.validUntil,
        })),
        membershipUrl: `${process.env.NEXTAUTH_URL}/membership`,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: transformedPlans,
        meta: {
          count: transformedPlans.length,
          generatedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "Access-Control-Allow-Origin": process.env.WORDPRESS_SITE_URL || "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "x-api-key",
        },
      }
    );
  } catch (error) {
    console.error("WordPress Membership API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": process.env.WORDPRESS_SITE_URL || "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "x-api-key",
      },
    }
  );
}