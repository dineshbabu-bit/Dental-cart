import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import HeroBannerSlider from "@/components/customer/HeroBannerSlider";
import CategoryGrid from "@/components/customer/CategoryGrid";
import ProductCard from "@/components/customer/ProductCard";
import prisma from "@/lib/prisma";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
  Stethoscope,
  Building2,
  PhoneCall,
  Clock,
} from "lucide-react";

export const revalidate = 0; // Dynamic server render

export default async function HomePage() {
  // Resilient parallel data fetching with graceful error fallback
  let banners: any[] = [];
  let categories: any[] = [];
  let featuredProducts: any[] = [];
  let bestSellerProducts: any[] = [];
  let brands: any[] = [];

  try {
    const [bannersData, categoriesData, featuredData, bestSellerData, brandsData] =
      await Promise.all([
        prisma.banner.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.category.findMany({
          where: { isActive: true },
          include: {
            _count: { select: { products: { where: { status: "PUBLISHED" } } } },
          },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.product.findMany({
          where: { status: "PUBLISHED", isFeatured: true },
          include: {
            category: true,
            brand: true,
            images: { orderBy: { displayOrder: "asc" } },
          },
          take: 8,
        }),
        prisma.product.findMany({
          where: { status: "PUBLISHED", isBestSeller: true },
          include: {
            category: true,
            brand: true,
            images: { orderBy: { displayOrder: "asc" } },
          },
          take: 8,
        }),
        prisma.brand.findMany({
          where: { isActive: true },
          take: 10,
        }),
      ]);

    banners = bannersData;
    categories = categoriesData;
    featuredProducts = featuredData;
    bestSellerProducts = bestSellerData;
    brands = brandsData;
  } catch (error) {
    console.error("[HomePage] Database query failed (verify DATABASE_URL and run npx prisma db push):", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 pb-16 space-y-12">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <HeroBannerSlider banners={banners} />
        </section>

        {/* Categories Carousel / Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Shop by Dental Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Explore comprehensive clinical supplies curated for dental procedures
              </p>
            </div>
            <Link
              href="/categories"
              className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
            >
              View All Categories
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <CategoryGrid categories={categories} />
        </section>

        {/* Featured Dental Supplies */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Featured Clinic Supplies
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Top-rated composites, rotary files, and high-performance dental instruments
                </p>
              </div>
            </div>
            <Link
              href="/products?featured=true"
              className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
            >
              See All Featured
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Promotional Clinic Special Offer Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-sky-900 via-teal-900 to-slate-900 p-8 sm:p-12 text-white overflow-hidden shadow-xl border border-sky-800/40">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
            <div className="max-w-2xl relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <Percent className="w-3.5 h-3.5" /> Clinic Bulk Savings
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Bulk Purchasing for Dental Clinics & Hospitals
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Save up to an extra 15% on high-volume clinic orders with instant GST invoices. Use coupon code{" "}
                <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  CLINIC500
                </strong>{" "}
                for flat ₹500 discount on orders above ₹5,000.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/products?discount=true"
                  className="px-6 py-3 bg-white text-slate-900 hover:bg-sky-50 rounded-xl text-xs sm:text-sm font-black shadow-lg transition-all"
                >
                  Shop Discounted Supplies →
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-3 bg-transparent hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/30 transition-colors"
                >
                  Register as Dental Clinic
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Dental Bestsellers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Most ordered supplies by Indian dental clinics this month
                </p>
              </div>
            </div>
            <Link
              href="/products?bestseller=true"
              className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
            >
              View All Bestsellers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestSellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Popular Dental Brands */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Authorized Global & Indian Dental Brands
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                100% Genuine batch-coded products straight from certified manufacturers
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.slug}`}
                  className="p-5 bg-slate-50 hover:bg-sky-50 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all flex flex-col items-center justify-center text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-sky-700 text-sm shadow-xs group-hover:scale-110 transition-transform mb-2">
                    {brand.name.substring(0, 3)}
                  </div>
                  <span className="font-bold text-xs text-slate-800 group-hover:text-sky-600 transition-colors">
                    {brand.name}
                  </span>
                  <span className="text-[10px] text-teal-700 mt-0.5">Authorized Partner</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Dental Professional Testimonials & Why Choose Dental Cart */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  RS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Dr. Rohit Sharma, MDS</h4>
                  <p className="text-[11px] text-slate-500">Sharma Multispeciality Dental Clinic, Mumbai</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &quot;Dental Cart has simplified our entire clinic supply chain. Genuine 3M composites with 2-year expiry, timely delivery, and clear GST input bills for our accounts.&quot;
              </p>
              <div className="text-[11px] font-bold text-amber-500">★★★★★ Verified Dentist</div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                  PP
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Dr. Priya Patel, BDS</h4>
                  <p className="text-[11px] text-slate-500">DentaCare Orthodontics, Ahmedabad</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &quot;Mani rotary files and Woodpecker equipment at wholesale rates. The checkout process with UPI and immediate invoice download is flawless.&quot;
              </p>
              <div className="text-[11px] font-bold text-amber-500">★★★★★ Verified Clinic</div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                  AK
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Dr. Amit Kulkarni</h4>
                  <p className="text-[11px] text-slate-500">SmileCraft Dental Implant Center, Pune</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &quot;The live inventory tracking guarantees no stock surprises. Highly recommended for every private practitioner in India.&quot;
              </p>
              <div className="text-[11px] font-bold text-amber-500">★★★★★ Verified Surgeon</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
