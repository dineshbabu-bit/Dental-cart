"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { Image as ImageIcon, Plus, Eye } from "lucide-react";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&auto=format&fit=crop&q=80");
  const [buttonText, setButtonText] = useState("Explore Supplies");
  const [buttonLink, setButtonLink] = useState("/products");
  const [badge, setBadge] = useState("Special Promotion");

  const loadBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          imageUrl,
          buttonText,
          buttonLink,
          badge,
        }),
      });

      if (res.ok) {
        setShowAdd(false);
        setTitle("");
        setSubtitle("");
        loadBanners();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Homepage Promotional Banners" />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Hero Banners ({banners.length})</h2>
            <p className="text-xs text-slate-500">Live homepage promotional carousel banners for seasonal dental campaigns</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Banner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover brightness-75" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent">
                  {b.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-500/30 text-sky-300 rounded border border-sky-400/30 self-start mb-1">
                      {b.badge}
                    </span>
                  )}
                  <h3 className="font-bold text-base line-clamp-1">{b.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{b.subtitle}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-slate-500">Link: <strong className="text-sky-700 font-mono">{b.buttonLink || "/products"}</strong></span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                  ACTIVE
                </span>
              </div>
            </div>
          ))}
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <h3 className="text-base font-black text-slate-900">Add Hero Promotion Banner</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Banner Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Monsoon Endodontics Festival"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtitle / Campaign Details</label>
                  <textarea
                    rows={2}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Special discounts on Mani files & apex locators..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Banner Image URL *</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Button Text</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Destination URL</label>
                    <input
                      type="text"
                      value={buttonLink}
                      onChange={(e) => setButtonLink(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Limited Time Offer"
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
                    Publish Banner
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
