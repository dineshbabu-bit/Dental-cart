import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: any = {
      role: "CUSTOMER",
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { customerProfile: { clinicName: { contains: search } } },
        { customerProfile: { gstin: { contains: search } } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      include: {
        customerProfile: true,
        addresses: true,
        orders: {
          select: {
            id: true,
            grandTotal: true,
            orderStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => {
      const validOrders = c.orders.filter((o) => o.orderStatus !== "CANCELLED");
      const totalSpent = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        isActive: c.isActive,
        role: c.role,
        createdAt: c.createdAt,
        profession: c.customerProfile?.profession || "Dentist",
        clinicName: c.customerProfile?.clinicName,
        gstin: c.customerProfile?.gstin,
        totalOrders: c.orders.length,
        totalSpent,
        addresses: c.addresses,
        recentOrders: c.orders.slice(0, 3),
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error: any) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { customerId, isActive } = await req.json();
    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update customer status" }, { status: 500 });
  }
}
