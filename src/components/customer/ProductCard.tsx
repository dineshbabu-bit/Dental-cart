"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Star, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/indian-data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    discountPrice?: number | null;
    gstPercentage: number;
    stockQuantity: number;
    minStockQuantity?: number;
    unit: string;
    rating: number;
    reviewCount: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    images?: { url: string; isThumbnail?: boolean }[];
    category?: { name: string; slug: string };
    brand?: { name: string; slug: string } | null;
    batchNumber?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.minStockQuantity || 5);

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        discountPrice: product.discountPrice,
        gstPercentage: product.gstPercentage,
        stockQuantity: product.stockQuantity,
        unit: product.unit,
        images: (product.images && product.images.length > 0
          ? product.images
          : [{ url: imageUrl, isThumbnail: true }]
        ).map((img, idx) => ({ url: img.url, isThumbnail: Boolean(img.isThumbnail ?? idx === 0) })),
        category: product.category,
        brand: product.brand,
      },
      1
    );

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1400);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top badges: Discount & Bestseller */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {hasDiscount && (
          <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-md shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-md shadow-sm">
            ★ Bestseller
          </span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
          isFavorite
            ? "bg-rose-50 text-rose-600 shadow"
            : "bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500"
        }`}
        title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
      </button>

      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Category header */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold text-sky-700 uppercase tracking-wide truncate max-w-[120px]">
              {product.brand?.name || "Dental Cart"}
            </span>
            <span className="truncate max-w-[100px]">{product.category?.name}</span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-sky-600 transition-colors">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[11px] font-bold">
              <span>{product.rating.toFixed(1)}</span>
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            </div>
            <span className="text-[11px] text-slate-400">({product.reviewCount})</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] text-slate-500 font-mono">SKU: {product.sku}</span>
          </div>
        </div>

        {/* Price & Stock & Add to Cart button */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {formatINR(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatINR(product.price)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-teal-700 font-medium">
                +{product.gstPercentage}% GST Extra (ITC Available)
              </p>
            </div>

            {/* Stock indicator */}
            <div>
              {isOutOfStock ? (
                <span className="text-[10px] font-bold text-rose-600">Out of Stock</span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {product.stockQuantity} Left
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-600">✓ In Stock</span>
              )}
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : addedAnimation
                ? "bg-emerald-600 text-white shadow-emerald-500/30"
                : "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20 active:scale-95"
            }`}
          >
            {isOutOfStock ? (
              "Currently Unavailable"
            ) : addedAnimation ? (
              <>
                <Check className="w-4 h-4" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
