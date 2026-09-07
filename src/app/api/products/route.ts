import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const isFeatured = searchParams.get("featured") === "true";
    const isBestSeller = searchParams.get("bestseller") === "true";
    const discountOnly = searchParams.get("discount") === "true";
    const inStockOnly = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");

    const where: any = {
      status: "PUBLISHED",
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { brand: { name: { contains: search } } },
        { category: { name: { contains: search } } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (isBestSeller) {
      where.isBestSeller = true;
    }

    if (discountOnly) {
      where.discountPrice = { not: null };
    }

    if (inStockOnly) {
      where.stockQuantity = { gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "rating") orderBy = { rating: "desc" };
    if (sort === "popular") orderBy = { reviewCount: "desc" };

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: { orderBy: { displayOrder: "asc" } },
        specifications: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
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
      images,
      specifications,
    } = body;

    if (!name || !sku || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Product name, SKU, Category, and Price are required." },
        { status: 400 }
      );
    }

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    const initialStock = parseInt(stockQuantity || "0", 10);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        sku: sku.trim().toUpperCase(),
        categoryId,
        brandId: brandId || null,
        supplierId: supplierId || null,
        description: description || "",
        shortDescription: shortDescription || "",
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        gstPercentage: gstPercentage ? parseFloat(gstPercentage) : 12.0,
        hsnCode: hsnCode || "9018",
        stockQuantity: initialStock,
        minStockQuantity: parseInt(minStockQuantity || "5", 10),
        unit: unit || "Piece",
        batchNumber: batchNumber || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: status || "PUBLISHED",
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        images: {
          create: (images || []).map((img: any, idx: number) => ({
            url: typeof img === "string" ? img : img.url,
            isThumbnail: idx === 0,
            displayOrder: idx,
          })),
        },
        specifications: {
          create: (specifications || []).map((s: any) => ({
            key: s.key,
            value: s.value,
          })),
        },
      },
      include: {
        category: true,
        brand: true,
        images: true,
        specifications: true,
      },
    });

    // Record initial inventory transaction
    if (initialStock > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: initialStock,
          previousStock: 0,
          newStock: initialStock,
          batchNumber: product.batchNumber,
          expiryDate: product.expiryDate,
          reason: "Product Creation Stocking",
          createdById: user.id,
        },
      });
    }

    // Audit log
    await logAuditEvent({
      user,
      action: "CREATE_PRODUCT",
      entity: "Product",
      entityId: product.id,
      details: { name: product.name, sku: product.sku, price: product.price, stock: initialStock },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
