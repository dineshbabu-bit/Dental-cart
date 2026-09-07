"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from "lucide-react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [stockQuantity, setStockQuantity] = useState("0");
  const [minStockQuantity, setMinStockQuantity] = useState("5");
  const [unit, setUnit] = useState("Piece");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [specs, setSpecs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, bRes, sRes, pRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
          fetch("/api/admin/suppliers"),
          fetch(`/api/products/${id}`),
        ]);

        if (cRes.ok) {
          const d = await cRes.json();
          setCategories(d.categories || []);
        }
        if (bRes.ok) {
          const d = await bRes.json();
          setBrands(d.brands || []);
        }
        if (sRes.ok) {
          const d = await sRes.json();
          setSuppliers(d.suppliers || []);
        }
        if (pRes.ok) {
          const d = await pRes.json();
          const p = d.product;
          if (p) {
            setName(p.name);
            setSku(p.sku);
            setCategoryId(p.categoryId);
            setBrandId(p.brandId || "");
            setSupplierId(p.supplierId || "");
            setDescription(p.description || "");
            setShortDescription(p.shortDescription || "");
            setPrice(p.price?.toString() || "");
            setDiscountPrice(p.discountPrice?.toString() || "");
            setGstPercentage(p.gstPercentage?.toString() || "12");
            setHsnCode(p.hsnCode || "9018");
            setStockQuantity(p.stockQuantity?.toString() || "0");
            setMinStockQuantity(p.minStockQuantity?.toString() || "5");
            setUnit(p.unit || "Piece");
            setBatchNumber(p.batchNumber || "");
            setExpiryDate(p.expiryDate ? new Date(p.expiryDate).toISOString().split("T")[0] : "");
            setImageUrl(p.images?.[0]?.url || "");
            setIsFeatured(p.isFeatured);
            setIsBestSeller(p.isBestSeller);
            setSpecs(p.specifications?.length > 0 ? p.specifications : [{ key: "", value: "" }]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku,
          categoryId,
          brandId: brandId || null,
          supplierId: supplierId || null,
          description,
          shortDescription,
          price,
          discountPrice: discountPrice || null,
          gstPercentage,
          hsnCode,
          stockQuantity,
          minStockQuantity,
          unit,
          batchNumber,
          expiryDate: expiryDate || null,
          isFeatured,
          isBestSeller,
          images: imageUrl ? [imageUrl] : undefined,
          specifications: specs.filter((s) => s.key && s.value),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin/products");
      } else {
        setError(data.error || "Failed to update product");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs">Loading product for editing...</div>;
  }

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title={`Edit Product: ${name}`} />

      <div className="p-6 sm:p-8 space-y-6 max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
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
            <h3 className="text-base font-black text-slate-900">Update Product Details</h3>
            <p className="text-xs text-slate-500">Changes will reflect instantly on the customer storefront</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Brand</label>
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Price (INR ₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
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
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
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
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
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
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Update Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
