"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [gstPercentage, setGstPercentage] = useState("12");
  const [hsnCode, setHsnCode] = useState("9018");
  const [stockQuantity, setStockQuantity] = useState("20");
  const [minStockQuantity, setMinStockQuantity] = useState("5");
  const [unit, setUnit] = useState("Piece");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Specifications
  const [specs, setSpecs] = useState([{ key: "Material", value: "Medical Grade Stainless Steel" }]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, bRes, sRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
          fetch("/api/admin/suppliers"),
        ]);
        if (cRes.ok) {
          const d = await cRes.json();
          setCategories(d.categories || []);
          if (d.categories?.[0]) setCategoryId(d.categories[0].id);
        }
        if (bRes.ok) {
          const d = await bRes.json();
          setBrands(d.brands || []);
        }
        if (sRes.ok) {
          const d = await sRes.json();
          setSuppliers(d.suppliers || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  const handleAddSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku,
          categoryId,
          brandId: brandId || undefined,
          supplierId: supplierId || undefined,
          description,
          shortDescription,
          price,
          discountPrice: discountPrice || undefined,
          gstPercentage,
          hsnCode,
          stockQuantity,
          minStockQuantity,
          unit,
          batchNumber,
          expiryDate: expiryDate || undefined,
          isFeatured,
          isBestSeller,
          images: [imageUrl],
          specifications: specs.filter((s) => s.key && s.value),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin/products");
      } else {
        setError(data.error || "Failed to create product");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Add New Dental Product" />

      <div className="p-6 sm:p-8 space-y-6 max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">Product Specification & Pricing Details</h3>
            <p className="text-xs text-slate-500">Add dental materials, equipment, or surgical instruments with GST configuration</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 3M Filtek Z250 Universal Composite Restorative (4g, Shade A2)"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SKU (Stock Keeping Unit) *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="3M-Z250-A2-4G"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Dental Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Brand / Manufacturer</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Regular Price (INR ₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1850.00"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Discount Price (INR ₹)</label>
              <input
                type="number"
                step="0.01"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="1599.00"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">GST Percentage (%) *</label>
              <select
                value={gstPercentage}
                onChange={(e) => setGstPercentage(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="5">5% (Hygiene / Basic PPE)</option>
                <option value="12">12% (Standard Dental Materials & Instruments)</option>
                <option value="18">18% (Dental Equipment & Electronics)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">HSN Code</label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="90184900"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Initial Stock Quantity *</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Min Stock Reorder Level</label>
              <input
                type="number"
                value={minStockQuantity}
                onChange={(e) => setMinStockQuantity(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="FLTK-2026-B84"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive clinical details, indications, handling instructions..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Technical Specifications builder */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Technical Specifications</span>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            {specs.map((spec, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Specification Key (e.g. Shade, Curing Time)"
                  value={spec.key}
                  onChange={(e) => {
                    const newSpecs = [...specs];
                    newSpecs[idx].key = e.target.value;
                    setSpecs(newSpecs);
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Shade A2, 20s)"
                  value={spec.value}
                  onChange={(e) => {
                    const newSpecs = [...specs];
                    newSpecs[idx].value = e.target.value;
                    setSpecs(newSpecs);
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Featured toggles */}
          <div className="pt-4 border-t border-slate-100 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span>Mark as Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span>Mark as Bestseller</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Publishing..." : "Save & Publish Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
