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
    const filter = searchParams.get("filter") || "all"; // all, low_stock, out_of_stock, expiring_soon
    const search = searchParams.get("search") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { batchNumber: { contains: search } },
      ];
    }

    if (filter === "low_stock") {
      where.stockQuantity = { gt: 0, lte: 10 };
    } else if (filter === "out_of_stock") {
      where.stockQuantity = 0;
    } else if (filter === "expiring_soon") {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      where.expiryDate = { lte: futureDate };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        supplier: true,
        inventoryLogs: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { stockQuantity: "asc" },
    });

    const transactions = await prisma.inventoryTransaction.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, sku: true } },
      },
    });

    return NextResponse.json({ products, transactions });
  } catch (error: any) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory data" }, { status: 500 });
  }
}
