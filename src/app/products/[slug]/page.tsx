import React from "react";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/customer/ProductCard";
import ProductDetailClient from "./ProductDetailClient";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        category: true,
        brand: true,
        supplier: true,
        images: { orderBy: { displayOrder: "asc" } },
        specifications: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
                customerProfile: { select: { profession: true, clinicName: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (product) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          status: "PUBLISHED",
        },
        include: {
          category: true,
          brand: true,
          images: { orderBy: { displayOrder: "asc" } },
        },
        take: 4,
      });
    }
  } catch (error) {
    console.error("[ProductDetailPage] Error fetching product:", error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        <ProductDetailClient product={product} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Related Dental Supplies in {product.category.name}
                </h3>
                <p className="text-xs text-slate-500">Frequently ordered together by dental practitioners</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
