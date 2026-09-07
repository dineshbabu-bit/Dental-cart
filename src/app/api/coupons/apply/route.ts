import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: "Please enter a coupon code" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "Coupon usage limit reached" }, { status: 400 });
    }

    const orderSubtotal = parseFloat(subtotal || "0");
    if (orderSubtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountValue) {
        discount = Math.min(discount, coupon.maxDiscountValue);
      }
    } else {
      discount = Math.min(coupon.discountValue, orderSubtotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscountValue: coupon.maxDiscountValue,
      },
      discount: Math.round(discount * 100) / 100,
      message: `Coupon '${coupon.code}' applied successfully!`,
    });
  } catch (error: any) {
    console.error("Coupon verification error:", error);
    return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
