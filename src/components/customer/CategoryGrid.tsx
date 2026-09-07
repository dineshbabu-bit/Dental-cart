import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
}

export default function CategoryGrid({ categories = [] }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="group p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all text-center flex flex-col items-center justify-between"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-sky-100 overflow-hidden mb-2.5 group-hover:scale-105 transition-transform flex items-center justify-center">
            {cat.image ? (
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">🦷</span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 leading-tight">
            {cat.name}
          </h4>
          {cat._count?.products !== undefined && (
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              {cat._count.products} products
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
