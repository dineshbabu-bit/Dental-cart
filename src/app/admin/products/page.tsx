"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import { formatINR } from "@/lib/indian-data";
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Copy,
  FolderTree,
  Tag,
  Boxes,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("limit", "100");

      const [pRes, cRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch("/api/categories"),
      ]);

      if (pRes.ok) {
        const data = await pRes.json();
        setProducts(data.products || []);
      }
      if (cRes.ok) {
        const data = await cRes.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback(`Product "${name}" deleted.`);
        loadProducts();
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Dental Product Catalog Management" />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">All Dental Products ({products.length})</h2>
            <p className="text-xs text-slate-500">Manage SKUs, prices, GST rates, stock levels, batch numbers, and expiry dates</p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            {feedback}
          </div>
        )}

        {/* Search & Category Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, SKU, or brand..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Product / SKU</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Brand</th>
                  <th className="py-3.5 px-3 text-right">Price (INR)</th>
                  <th className="py-3.5 px-2 text-center">GST%</th>
                  <th className="py-3.5 px-3 text-center">Stock Level</th>
                  <th className="py-3.5 px-3">Batch / Expiry</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=100&auto=format&fit=crop&q=80";
                  const isOutOfStock = p.stockQuantity <= 0;
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= (p.minStockQuantity || 5);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={img} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0" />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{p.category?.name}</td>
                      <td className="py-3 px-3 font-bold text-sky-800">{p.brand?.name || "Dental Cart"}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        <span className="font-bold text-slate-900">{formatINR(p.discountPrice || p.price)}</span>
                        {p.discountPrice && (
                          <span className="block text-[10px] text-slate-400 line-through">{formatINR(p.price)}</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center text-teal-700 font-bold">{p.gstPercentage}%</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isOutOfStock
                              ? "bg-rose-100 text-rose-800"
                              : isLowStock
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.stockQuantity} {p.unit || "pcs"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500">
                        {p.batchNumber ? <span className="font-mono text-slate-700 block">B: {p.batchNumber}</span> : null}
                        {p.expiryDate ? (
                          <span className="text-slate-400">
                            Exp: {new Date(p.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View in Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
}
