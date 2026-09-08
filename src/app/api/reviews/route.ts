import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const where: any = { isApproved: true };
    if (productId) {
      where.productId = productId;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, customerProfile: { select: { profession: true } } } },
        product: { select: { name: true, sku: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a review." }, { status: 401 });
    }

    const { productId, rating, title, comment, imageUrl } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: "Product ID, rating (1-5), and review comment are required." },
        { status: 400 }
      );
    }

    // Check if customer has purchased this product
    const purchaseCount = await prisma.orderItem.count({
      where: {
        productId,
        order: {
          userId: user.id,
          orderStatus: { in: ["DELIVERED", "PROCESSING", "SHIPPED", "CONFIRMED"] },
        },
      },
    });

    const isVerifiedPurchase = purchaseCount > 0;

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        title: title ? title.trim() : null,
        comment: comment.trim(),
        imageUrl: imageUrl || null,
        isVerifiedPurchase,
        isApproved: true,
      },
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
