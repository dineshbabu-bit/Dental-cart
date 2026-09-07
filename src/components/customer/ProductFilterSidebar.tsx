"use client";

import React from "react";
import { Filter, RotateCcw, Check } from "lucide-react";
import { formatINR } from "@/lib/indian-data";

interface FilterSidebarProps {
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
  selectedCategory: string;
  selectedBrand: string;
  inStockOnly: boolean;
  discountOnly: boolean;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (slug: string) => void;
  onBrandChange: (slug: string) => void;
  onInStockChange: (val: boolean) => void;
  onDiscountChange: (val: boolean) => void;
  onPriceChange: (min: string, max: string) => void;
  onReset: () => void;
}

export default function ProductFilterSidebar({
  categories = [],
  brands = [],
  selectedCategory,
  selectedBrand,
  inStockOnly,
  discountOnly,
  minPrice,
  maxPrice,
  onCategoryChange,
  onBrandChange,
  onInStockChange,
  onDiscountChange,
  onPriceChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm">Filter Dental Supplies</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Stock & Offer Switches */}
      <div className="space-y-2.5">
        <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-xs font-semibold text-slate-700">In Stock Products Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <span className="text-xs font-semibold text-slate-700">Special Discount Deals</span>
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => onDiscountChange(e.target.checked)}
            className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
          />
        </label>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Categories</h4>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-xs">
          <button
            onClick={() => onCategoryChange("")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
              !selectedCategory ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5 text-sky-600" />}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategoryChange(c.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                selectedCategory === c.slug ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="truncate">{c.name}</span>
              {selectedCategory === c.slug && <Check className="w-3.5 h-3.5 text-sky-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Leading Brands</h4>
        <div className="max-h-44 overflow-y-auto space-y-1 pr-1 text-xs">
          <button
            onClick={() => onBrandChange("")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
              !selectedBrand ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Brands</span>
            {!selectedBrand && <Check className="w-3.5 h-3.5 text-sky-600" />}
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => onBrandChange(b.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                selectedBrand === b.slug ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="truncate">{b.name}</span>
              {selectedBrand === b.slug && <Check className="w-3.5 h-3.5 text-sky-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Price (INR ₹)</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Min (₹)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
              placeholder="0"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Max (₹)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
              placeholder="10000"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
