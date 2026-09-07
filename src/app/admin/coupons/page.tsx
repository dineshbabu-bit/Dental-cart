"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { formatINR } from "@/lib/indian-data";
import { TicketPercent, Plus, Tag, Calendar } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrderValue, setMinOrderValue] = useState("1000");
  const [maxDiscountValue, setMaxDiscountValue] = useState("500");
  const [usageLimit, setUsageLimit] = useState("500");
  const [isFirstOrderOnly, setIsFirstOrderOnly] = useState(false);

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          description,
          discountType,
          discountValue,
          minOrderValue,
          maxDiscountValue,
          usageLimit,
          isFirstOrderOnly,
        }),
      });

      if (res.ok) {
        setShowAdd(false);
        setCode("");
        setDescription("");
        loadCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Discount Coupons & Promotional Engine" />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Discount Coupons ({coupons.length})</h2>
            <p className="text-xs text-slate-500">Configure percentage or flat discounts, minimum order conditions, and clinic limits</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {coupons.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-sky-50 text-sky-800 font-mono font-black text-sm rounded-xl border border-sky-200">
                  {c.code}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                  {c.isActive ? "ACTIVE" : "EXPIRED"}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900">
                  {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `Flat ${formatINR(c.discountValue)} OFF`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{c.description || "Valid on all clinic supplies."}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Min Order:</span>
                  <span className="font-mono font-semibold">{formatINR(c.minOrderValue)}</span>
                </div>
                {c.maxDiscountValue && (
                  <div className="flex justify-between">
                    <span>Max Discount:</span>
                    <span className="font-mono font-semibold">{formatINR(c.maxDiscountValue)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Usage Count:</span>
                  <span className="font-semibold text-sky-700">{c.usedCount || 0} / {c.usageLimit || "∞"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <h3 className="text-base font-black text-slate-900">Create Discount Coupon</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CLINIC20"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-bold outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Flat (INR ₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Min Order Value (₹)</label>
                    <input
                      type="number"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      value={maxDiscountValue}
                      onChange={(e) => setMaxDiscountValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 10% discount on endodontics supplies"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 text-white rounded-xl font-bold shadow"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
