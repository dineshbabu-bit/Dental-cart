"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Tag } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonLink?: string | null;
  badge?: string | null;
}

export default function HeroBannerSlider({ banners = [] }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-800">
      {/* Background Image with Gradient Overlay */}
      <div className="relative h-72 sm:h-96 lg:h-[440px] w-full overflow-hidden">
        <img
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-all duration-700 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent flex items-center">
          <div className="max-w-2xl px-6 sm:px-12 py-8 text-white space-y-4">
            {current.badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                {current.badge}
              </span>
            )}

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
              {current.title}
            </h1>

            {current.subtitle && (
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal drop-shadow">
                {current.subtitle}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={current.buttonLink || "/products"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
              >
                {current.buttonText || "Shop Now"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?discount=true"
                className="inline-flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-md transition-colors"
              >
                <Tag className="w-4 h-4 text-amber-400" />
                View Bulk Clinic Discounts
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur border border-white/10 transition-colors shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur border border-white/10 transition-colors shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-7 bg-sky-400 shadow-md" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
