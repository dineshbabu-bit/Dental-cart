import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, subtitle, imageUrl, buttonText, buttonLink, badge, displayOrder, isActive } = await req.json();

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Banner title and image URL are required" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle: subtitle || null,
        imageUrl: imageUrl.trim(),
        buttonText: buttonText || "Shop Now",
        buttonLink: buttonLink || "/products",
        badge: badge || null,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAuditEvent({
      user,
      action: "CREATE_BANNER",
      entity: "Banner",
      entityId: banner.id,
      details: { title: banner.title },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create banner" }, { status: 500 });
  }
}
