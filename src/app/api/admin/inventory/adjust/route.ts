import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { productId, type, quantity, reason, batchNumber, expiryDate } = await req.json();

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID, transaction type (IN/OUT/ADJUSTMENT), and quantity are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const qty = parseInt(quantity, 10);
    let newStock = product.stockQuantity;

    if (type === "IN") {
      newStock += qty;
    } else if (type === "OUT") {
      newStock = Math.max(0, newStock - qty);
    } else if (type === "ADJUSTMENT") {
      newStock = Math.max(0, qty);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newStock,
        batchNumber: batchNumber || product.batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : product.expiryDate,
      },
    });

    const transaction = await prisma.inventoryTransaction.create({
      data: {
        productId,
        type,
        quantity: qty,
        previousStock: product.stockQuantity,
        newStock,
        batchNumber: batchNumber || product.batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : product.expiryDate,
        reason: reason || "Manual Inventory Adjustment",
        createdById: user.id,
      },
    });

    await logAuditEvent({
      user,
      action: "INVENTORY_ADJUSTMENT",
      entity: "Product",
      entityId: productId,
      details: {
        productName: product.name,
        type,
        quantity: qty,
        previousStock: product.stockQuantity,
        newStock,
        reason,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct, transaction });
  } catch (error: any) {
    console.error("Inventory adjustment error:", error);
    return NextResponse.json({ error: error.message || "Failed to adjust inventory" }, { status: 500 });
  }
}
