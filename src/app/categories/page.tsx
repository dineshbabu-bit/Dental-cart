import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import prisma from "@/lib/prisma";
import { ArrowRight, Sparkles } from "lucide-react";

export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { products: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            All Dental Specialties & Product Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse our complete catalog of certified dental instruments, restorative materials, endodontics, and equipment
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-white rounded-3xl border border-slate-200 hover:border-sky-400 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between p-5"
            >
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-2xl bg-sky-50 overflow-hidden border border-slate-100 flex items-center justify-center">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-3xl">🦷</span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-base">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  {cat._count?.products || 0} Products
                </span>
                <span className="font-bold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
