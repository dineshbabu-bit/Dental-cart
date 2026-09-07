import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ suppliers });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, company, phone, email, address, gstin } = await req.json();

    if (!name || !company || !phone || !email) {
      return NextResponse.json({ error: "Name, company, phone, and email are required." }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        company: company.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        address: address || null,
        gstin: gstin ? gstin.trim().toUpperCase() : null,
        isActive: true,
      },
    });

    await logAuditEvent({
      user,
      action: "CREATE_SUPPLIER",
      entity: "Supplier",
      entityId: supplier.id,
      details: { name: supplier.name, company: supplier.company },
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create supplier" }, { status: 500 });
  }
}
