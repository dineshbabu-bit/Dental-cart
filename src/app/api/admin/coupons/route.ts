import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        category: true,
        product: true,
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountValue,
      validUntil,
      usageLimit,
      isFirstOrderOnly,
      isActive,
    } = await req.json();

    if (!code || discountValue === undefined) {
      return NextResponse.json({ error: "Coupon code and discount value are required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description: description || null,
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscountValue: maxDiscountValue ? parseFloat(maxDiscountValue) : null,
        validFrom: new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date("2029-12-31"),
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : 500,
        isFirstOrderOnly: Boolean(isFirstOrderOnly),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAuditEvent({
      user,
      action: "CREATE_COUPON",
      entity: "Coupon",
      entityId: coupon.id,
      details: { code: coupon.code, discountValue: coupon.discountValue, discountType: coupon.discountType },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}
