import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        brand: true,
        supplier: true,
        images: { orderBy: { displayOrder: "asc" } },
        specifications: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Also fetch related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "PUBLISHED",
      },
      include: {
        category: true,
        brand: true,
        images: { where: { isThumbnail: true } },
      },
      take: 4,
    });

    return NextResponse.json({ product, relatedProducts });
  } catch (error: any) {
    console.error("Product GET error:", error);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const {
      name,
      sku,
      categoryId,
      brandId,
      supplierId,
      description,
      shortDescription,
      price,
      discountPrice,
      gstPercentage,
      hsnCode,
      stockQuantity,
      minStockQuantity,
      unit,
      batchNumber,
      expiryDate,
      status,
      isFeatured,
      isBestSeller,
      specifications,
      images,
    } = body;

    // Check if stock quantity changed
    const newStock = stockQuantity !== undefined ? parseInt(stockQuantity, 10) : existing.stockQuantity;
    if (newStock !== existing.stockQuantity) {
      const diff = newStock - existing.stockQuantity;
      await prisma.inventoryTransaction.create({
        data: {
          productId: existing.id,
          type: diff > 0 ? "IN" : "OUT",
          quantity: Math.abs(diff),
          previousStock: existing.stockQuantity,
          newStock: newStock,
          batchNumber: batchNumber || existing.batchNumber,
          expiryDate: expiryDate ? new Date(expiryDate) : existing.expiryDate,
          reason: "Manual Stock Adjustment via Product Edit",
          createdById: user.id,
        },
      });
    }

    // Update specs if provided
    if (specifications && Array.isArray(specifications)) {
      await prisma.productSpecification.deleteMany({ where: { productId: id } });
      await prisma.productSpecification.createMany({
        data: specifications.map((s: any) => ({
          productId: id,
          key: s.key,
          value: s.value,
        })),
      });
    }

    // Update images if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((img: any, idx: number) => ({
          productId: id,
          url: typeof img === "string" ? img : img.url,
          isThumbnail: idx === 0,
          displayOrder: idx,
        })),
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        sku: sku !== undefined ? sku.trim().toUpperCase() : existing.sku,
        categoryId: categoryId || existing.categoryId,
        brandId: brandId !== undefined ? brandId : existing.brandId,
        supplierId: supplierId !== undefined ? supplierId : existing.supplierId,
        description: description !== undefined ? description : existing.description,
        shortDescription: shortDescription !== undefined ? shortDescription : existing.shortDescription,
        price: price !== undefined ? parseFloat(price) : existing.price,
        discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : existing.discountPrice,
        gstPercentage: gstPercentage !== undefined ? parseFloat(gstPercentage) : existing.gstPercentage,
        hsnCode: hsnCode !== undefined ? hsnCode : existing.hsnCode,
        stockQuantity: newStock,
        minStockQuantity: minStockQuantity !== undefined ? parseInt(minStockQuantity, 10) : existing.minStockQuantity,
        unit: unit !== undefined ? unit : existing.unit,
        batchNumber: batchNumber !== undefined ? batchNumber : existing.batchNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : existing.expiryDate,
        status: status || existing.status,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : existing.isBestSeller,
      },
      include: {
        category: true,
        brand: true,
        images: true,
        specifications: true,
      },
    });

    await logAuditEvent({
      user,
      action: "UPDATE_PRODUCT",
      entity: "Product",
      entityId: id,
      details: { name: updated.name, price: updated.price, stock: updated.stockQuantity },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Super Admin or Admin access required." }, { status: 403 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    await logAuditEvent({
      user,
      action: "DELETE_PRODUCT",
      entity: "Product",
      entityId: id,
      details: { name: product.name, sku: product.sku },
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
