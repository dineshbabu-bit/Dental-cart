"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { formatINR } from "@/lib/indian-data";
import {
  Boxes,
  Plus,
  Minus,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  History,
  FileText,
  Truck,
} from "lucide-react";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, low_stock, out_of_stock, expiring_soon
  const [search, setSearch] = useState("");

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustType, setAdjustType] = useState("IN"); // IN, OUT, ADJUSTMENT
  const [adjustQty, setAdjustQty] = useState("10");
  const [adjustReason, setAdjustReason] = useState("Restocking from Supplier");
  const [adjustBatch, setAdjustBatch] = useState("");
  const [adjustExpiry, setAdjustExpiry] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [filter, search]);

  const openAdjust = (prod: any, defaultType = "IN") => {
    setSelectedProduct(prod);
    setAdjustType(defaultType);
    setAdjustQty(defaultType === "ADJUSTMENT" ? prod.stockQuantity.toString() : "10");
    setAdjustBatch(prod.batchNumber || "");
    setAdjustExpiry(prod.expiryDate ? new Date(prod.expiryDate).toISOString().split("T")[0] : "");
    setAdjustReason(defaultType === "IN" ? "Restocking from Supplier" : defaultType === "OUT" ? "Damaged / Expired Clearance" : "Physical Audit Adjustment");
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: adjustType,
          quantity: adjustQty,
          reason: adjustReason,
          batchNumber: adjustBatch,
          expiryDate: adjustExpiry || undefined,
        }),
      });

      if (res.ok) {
        setFeedback(`Stock updated for ${selectedProduct.name}`);
        setShowAdjustModal(false);
        loadInventory();
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Inventory & Warehouse Stock Control" />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Dental Inventory & Batch Ledger</h2>
            <p className="text-xs text-slate-500">Track real-time stock levels, batch numbers, expiry dates, and automatic order deductions</p>
          </div>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            {feedback}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Stock ({products.length})
            </button>
            <button
              onClick={() => setFilter("low_stock")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === "low_stock" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              ⚠️ Low Stock
            </button>
            <button
              onClick={() => setFilter("out_of_stock")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === "out_of_stock" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              ❌ Out of Stock
            </button>
            <button
              onClick={() => setFilter("expiring_soon")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === "expiring_soon" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200"
              }`}
            >
              📅 Expiring Soon
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, product, batch..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Inventory Datatable */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Product Name & SKU</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Batch Number</th>
                  <th className="py-3.5 px-3">Expiry Date</th>
                  <th className="py-3.5 px-3 text-center">Current Stock</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isOutOfStock = p.stockQuantity === 0;
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= (p.minStockQuantity || 5);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{p.category?.name}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{p.batchNumber || "N/A"}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "N/A"}
                      </td>
                      <td className="py-3 px-3 text-center font-bold font-mono text-sm text-slate-900">
                        {p.stockQuantity} <span className="text-[10px] font-normal text-slate-400">{p.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOutOfStock
                              ? "bg-rose-100 text-rose-800"
                              : isLowStock
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAdjust(p, "IN")}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold border border-emerald-200 transition-colors"
                            title="Add Stock / Restock"
                          >
                            + Stock
                          </button>
                          <button
                            onClick={() => openAdjust(p, "OUT")}
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-bold border border-rose-200 transition-colors"
                            title="Deduct Stock"
                          >
                            - Deduct
                          </button>
                          <button
                            onClick={() => openAdjust(p, "ADJUSTMENT")}
                            className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-bold transition-colors"
                            title="Set Exact Quantity"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Recent Warehouse Stock Transactions</h3>
              <p className="text-xs text-slate-500">Audit trail of order deductions, supplier receipts, and manual adjustments</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Last 50 movements</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-2 text-center">Tx Type</th>
                  <th className="py-2.5 px-2 text-center">Change</th>
                  <th className="py-2.5 px-2 text-center">Balance</th>
                  <th className="py-2.5 px-3">Reason / Ref ID</th>
                  <th className="py-2.5 px-3 font-mono">Batch No.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {transactions.slice(0, 15).map((t) => {
                  const isPositive = t.type === "IN" || t.type === "RETURN";

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(t.createdAt).toLocaleString("en-IN", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-800 truncate max-w-xs">
                        {t.product?.name}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.type === "ORDER_DEDUCTION"
                              ? "bg-sky-50 text-sky-800"
                              : isPositive
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-2.5 px-2 text-center font-bold ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                        {isPositive ? `+${t.quantity}` : `-${t.quantity}`}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-900">{t.newStock}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{t.reason || "N/A"}</td>
                      <td className="py-2.5 px-3 text-slate-500">{t.batchNumber || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Adjustment Modal */}
        {showAdjustModal && selectedProduct && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">Stock Adjuster</h3>
                <p className="text-xs text-slate-500 truncate">{selectedProduct.name}</p>
                <p className="text-xs font-bold text-sky-700 mt-1">Current Stock: {selectedProduct.stockQuantity} {selectedProduct.unit}</p>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Adjustment Action</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                  >
                    <option value="IN">Receive Stock / Restock (+)</option>
                    <option value="OUT">Deduct Stock / Damaged (-)</option>
                    <option value="ADJUSTMENT">Set Exact Stock Count (=)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity ({selectedProduct.unit})</label>
                  <input
                    type="number"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={adjustBatch}
                    onChange={(e) => setAdjustBatch(e.target.value)}
                    placeholder="e.g. BATCH-2026-X9"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={adjustExpiry}
                    onChange={(e) => setAdjustExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason / Note</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Received new shipment from distributor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow"
                  >
                    {saving ? "Saving..." : "Apply Adjustment"}
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
