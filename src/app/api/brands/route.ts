import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { status: "PUBLISHED" } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ brands });
  } catch (error: any) {
    console.error("Brands GET error:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { name, logo, description, website, isActive } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug,
        logo: logo || null,
        description: description || null,
        website: website || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAuditEvent({
      user,
      action: "CREATE_BRAND",
      entity: "Brand",
      entityId: brand.id,
      details: { name: brand.name, slug: brand.slug },
    });

    return NextResponse.json({ success: true, brand });
  } catch (error: any) {
    console.error("Brand creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create brand" }, { status: 500 });
  }
}
