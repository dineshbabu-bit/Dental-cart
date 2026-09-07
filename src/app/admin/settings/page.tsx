"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { INDIAN_STATES } from "@/lib/indian-data";
import { Settings, Save, CheckCircle2, Building2, CreditCard, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    businessName: "Dental Cart India Pvt. Ltd.",
    tagline: "Your Trusted Dental Supply Partner",
    email: "support@dentalcart.in",
    phone: "+91 98765 43210",
    address: "Unit 402, Dental Hub Plaza, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400069",
    gstin: "27AABCB1234F1Z5",
    pan: "AABCB1234F",
    hsnDefault: "9018",
    currency: "INR",
    currencySymbol: "₹",
    enableRazorpay: true,
    enableUPI: true,
    enableCOD: true,
    freeShippingThreshold: 1500,
    defaultShippingFee: 99,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSettings(data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setFeedback("Store and Indian GST settings saved successfully!");
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs">Loading settings...</div>;
  }

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Business & GST Tax Configuration" />

      <div className="p-6 sm:p-8 space-y-6 max-w-4xl w-full mx-auto">
        <div>
          <h2 className="text-xl font-black text-slate-900">Store Identity, GST & Payment Gateway Settings</h2>
          <p className="text-xs text-slate-500">Configure corporate details for tax invoices, delivery thresholds, and Indian payment switches</p>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            {feedback}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Company Legal Information (Appears on Tax Invoices)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Registered Business Name</label>
                <input
                  type="text"
                  value={settings.businessName || ""}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Tagline</label>
                <input
                  type="text"
                  value={settings.tagline || ""}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Helpline Phone</label>
                <input
                  type="text"
                  value={settings.phone || ""}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Corporate GSTIN</label>
                <input
                  type="text"
                  value={settings.gstin || ""}
                  onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-bold text-sky-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company PAN</label>
                <input
                  type="text"
                  value={settings.pan || ""}
                  onChange={(e) => setSettings({ ...settings, pan: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Seller State (Origin for Intra/Inter-State GST)</label>
                <select
                  value={settings.state || "Maharashtra"}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Registered Address</label>
                <input
                  type="text"
                  value={settings.address || ""}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping & Thresholds */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" />
              <span>Shipping & Delivery Rules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Free Shipping Threshold (INR ₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold || "1500"}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Default Standard Shipping Fee (INR ₹)</label>
                <input
                  type="number"
                  value={settings.defaultShippingFee || "99"}
                  onChange={(e) => setSettings({ ...settings, defaultShippingFee: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              Active Payment Modes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableUPI)}
                  onChange={(e) => setSettings({ ...settings, enableUPI: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <span className="font-bold text-slate-800">Enable UPI (GPay/PhonePe)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableRazorpay)}
                  onChange={(e) => setSettings({ ...settings, enableRazorpay: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <span className="font-bold text-slate-800">Enable Razorpay</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={Boolean(settings.enableCOD)}
                  onChange={(e) => setSettings({ ...settings, enableCOD: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <span className="font-bold text-slate-800">Enable Cash on Delivery</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
