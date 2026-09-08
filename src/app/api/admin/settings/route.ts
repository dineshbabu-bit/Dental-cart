import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.storeSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...body,
      },
      update: {
        businessName: body.businessName,
        tagline: body.tagline,
        logoUrl: body.logoUrl,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        gstin: body.gstin,
        pan: body.pan,
        hsnDefault: body.hsnDefault,
        currency: body.currency,
        currencySymbol: body.currencySymbol,
        enableRazorpay: Boolean(body.enableRazorpay),
        enableUPI: Boolean(body.enableUPI),
        enableCOD: Boolean(body.enableCOD),
        freeShippingThreshold: body.freeShippingThreshold ? parseFloat(body.freeShippingThreshold) : 1500,
        defaultShippingFee: body.defaultShippingFee ? parseFloat(body.defaultShippingFee) : 99,
      },
    });

    await logAuditEvent({
      user,
      action: "UPDATE_SETTINGS",
      entity: "StoreSettings",
      entityId: "default",
      details: { businessName: updated.businessName, gstin: updated.gstin },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
