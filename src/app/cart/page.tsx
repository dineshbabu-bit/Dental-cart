"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useCart } from "@/context/CartContext";
import { formatINR, INDIAN_STATES } from "@/lib/indian-data";
import {
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  ShoppingBag,
  Sparkles,
  Percent,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    discountAmount,
    couponCode,
    couponDetails,
    gstCalculation,
    customerState,
    setCustomerState,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string }>({});

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setCouponLoading(true);
    setCouponFeedback({});
    const res = await applyCoupon(inputCoupon);
    setCouponFeedback(res);
    setCouponLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-5">
          <div className="w-24 h-24 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
            <ShoppingBag className="w-12 h-12 text-sky-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your Dental Cart is Empty</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            You don&apos;t have any dental supplies in your cart. Explore our medical instruments, composites, and equipment to get started.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-sky-500/25 transition-all"
            >
              Browse Dental Catalog →
            </Link>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Dental Procurement Cart ({totalItems} items)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your items, apply clinic coupons, and verify GST tax calculations
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors self-start sm:self-auto"
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {items.map((item) => {
                const effectivePrice = item.product.discountPrice || item.product.price;
                const itemTotal = effectivePrice * item.quantity;
                const img = item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200&auto=format&fit=crop&q=80";

                return (
                  <div key={item.productId} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Thumbnail & Name */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 p-1">
                        <img src={img} alt={item.product.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wide">
                          {item.product.brand?.name || "Dental Cart"}
                        </span>
                        <Link href={`/products/${item.product.slug}`} className="block hover:text-sky-600 transition-colors">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {item.product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono">SKU: {item.product.sku}</span>
                          <span>•</span>
                          <span>Unit: {item.product.unit}</span>
                          <span>•</span>
                          <span className="text-teal-700 font-semibold">{item.product.gstPercentage}% GST</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold text-xs font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockQuantity}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-bold text-xs disabled:opacity-40 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right min-w-[90px]">
                        <p className="text-sm sm:text-base font-black text-slate-900 font-mono">
                          {formatINR(itemTotal)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          @{formatINR(effectivePrice)}/ea
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupons Strip / Sample Coupon Prompts */}
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-sky-900 font-semibold">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Available Clinic Promo Codes:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setInputCoupon("WELCOME100")}
                  className="px-2.5 py-1 bg-white border border-sky-300 hover:border-sky-500 rounded-lg font-mono font-bold text-sky-800 text-[11px] transition-colors"
                >
                  WELCOME100 (-₹100)
                </button>
                <button
                  onClick={() => setInputCoupon("DENTAL10")}
                  className="px-2.5 py-1 bg-white border border-sky-300 hover:border-sky-500 rounded-lg font-mono font-bold text-sky-800 text-[11px] transition-colors"
                >
                  DENTAL10 (10% Off)
                </button>
                <button
                  onClick={() => setInputCoupon("CLINIC500")}
                  className="px-2.5 py-1 bg-white border border-sky-300 hover:border-sky-500 rounded-lg font-mono font-bold text-sky-800 text-[11px] transition-colors"
                >
                  CLINIC500 (-₹500 on ₹5k+)
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary & GST Breakdown Box */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-teal-600" /> Have a Promo Coupon?
              </h3>

              {couponCode ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-900 font-mono">
                      {couponCode} Applied!
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Savings: {formatINR(discountAmount)}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}

              {couponFeedback.message && (
                <p
                  className={`text-xs ${
                    couponFeedback.success ? "text-emerald-600 font-bold" : "text-rose-600"
                  }`}
                >
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Destination State Selector for GST calculation preview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Destination Clinic State (GST Calculation):
              </label>
              <select
                value={customerState}
                onChange={(e) => setCustomerState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s} {s === "Maharashtra" ? "(Intra-State: CGST + SGST)" : "(Inter-State: IGST)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Payment & Tax Breakdown
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal (Gross Value):</span>
                  <span className="font-mono font-semibold text-slate-800">{formatINR(gstCalculation.subtotal)}</span>
                </div>

                {gstCalculation.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount:</span>
                    <span className="font-mono">-{formatINR(gstCalculation.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxable Amount:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatINR(gstCalculation.taxableAmount)}</span>
                </div>

                {gstCalculation.isInterState ? (
                  <div className="flex justify-between text-teal-800">
                    <span>IGST ({gstCalculation.gstPercentage.toFixed(0)}%):</span>
                    <span className="font-mono font-semibold">{formatINR(gstCalculation.igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-teal-800">
                      <span>CGST ({(gstCalculation.gstPercentage / 2).toFixed(1)}%):</span>
                      <span className="font-mono font-semibold">{formatINR(gstCalculation.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-teal-800">
                      <span>SGST ({(gstCalculation.gstPercentage / 2).toFixed(1)}%):</span>
                      <span className="font-mono font-semibold">{formatINR(gstCalculation.sgst)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span>Healthcare Shipping:</span>
                  <span className="font-mono font-semibold">
                    {gstCalculation.shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE (Above ₹1,500)</span>
                    ) : (
                      formatINR(gstCalculation.shippingFee)
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Grand Total (INR):</span>
                <span className="text-xl font-black text-sky-700 font-mono">
                  {formatINR(gstCalculation.grandTotal)}
                </span>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-4 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Indian Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-2 text-[11px] text-slate-400 space-y-1 text-center">
                <p>🔒 256-Bit SSL Encrypted Indian Payments</p>
                <p>📋 Official GST Tax Invoice issued on placement</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
