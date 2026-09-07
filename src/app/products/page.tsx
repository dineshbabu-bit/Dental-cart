"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/customer/ProductCard";
import ProductFilterSidebar from "@/components/customer/ProductFilterSidebar";
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");
  const [discountOnly, setDiscountOnly] = useState(searchParams.get("discount") === "true");
  const [isFeatured, setIsFeatured] = useState(searchParams.get("featured") === "true");
  const [isBestSeller, setIsBestSeller] = useState(searchParams.get("bestseller") === "true");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(1);

  // Fetch Categories and Brands
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        if (catRes.ok) {
          const cData = await catRes.json();
          setCategories(cData.categories || []);
        }
        if (brandRes.ok) {
          const bData = await brandRes.json();
          setBrands(bData.brands || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  // Fetch Products based on current filters
  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (brand) params.set("brand", brand);
        if (inStockOnly) params.set("inStock", "true");
        if (discountOnly) params.set("discount", "true");
        if (isFeatured) params.set("featured", "true");
        if (isBestSeller) params.set("bestseller", "true");
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (sort) params.set("sort", sort);
        params.set("page", page.toString());
        params.set("limit", "24");

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalCount(data.pagination?.total || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredProducts();
  }, [search, category, brand, inStockOnly, discountOnly, isFeatured, isBestSeller, minPrice, maxPrice, sort, page]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setInStockOnly(false);
    setDiscountOnly(false);
    setIsFeatured(false);
    setIsBestSeller(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    router.push("/products");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Sort options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {category
              ? `${categories.find((c) => c.slug === category)?.name || "Dental Products"}`
              : brand
              ? `${brands.find((b) => b.slug === brand)?.name || "Dental Brand"}`
              : "Dental Catalog & Supplies"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} of {totalCount} genuine dental items with GST invoices
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilterSidebar
            categories={categories}
            brands={brands}
            selectedCategory={category}
            selectedBrand={brand}
            inStockOnly={inStockOnly}
            discountOnly={discountOnly}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
            onBrandChange={(val) => {
              setBrand(val);
              setPage(1);
            }}
            onInStockChange={(val) => {
              setInStockOnly(val);
              setPage(1);
            }}
            onDiscountChange={(val) => {
              setDiscountOnly(val);
              setPage(1);
            }}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
              setPage(1);
            }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-200/70 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-base font-bold text-slate-800">No dental supplies match your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing active filters, adjusting price ranges, or searching for other dental materials.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pb-16">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading dental catalog...</div>}>
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
