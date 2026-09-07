"use client";

import React, { useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  FileText,
  Download,
  DollarSign,
  Package,
  Boxes,
  Users,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState("");

  const handleDownload = async (type: string) => {
    setDownloading(type);
    try {
      window.location.href = `/api/admin/reports?type=${type}&format=csv`;
    } finally {
      setTimeout(() => setDownloading(""), 1500);
    }
  };

  const reportCards = [
    {
      type: "sales",
      title: "Sales & GST Tax Revenue Report",
      desc: "Complete financial statement with order breakdown, CGST, SGST, IGST, buyer state, and payment modes.",
      icon: DollarSign,
      color: "bg-emerald-500 text-white",
    },
    {
      type: "products",
      title: "Product Sales & Revenue Performance",
      desc: "Sales metrics per dental SKU, units sold, revenue generated, GST slabs, batch numbers, and expiry.",
      icon: Package,
      color: "bg-sky-500 text-white",
    },
    {
      type: "inventory",
      title: "Warehouse Inventory & Batch Ledger",
      desc: "Current stock availability, minimum threshold alerts, out-of-stock items, and supplier associations.",
      icon: Boxes,
      color: "bg-amber-500 text-white",
    },
    {
      type: "customers",
      title: "Clinic & Practitioner Directory Report",
      desc: "Registered dentist list, clinic affiliations, GSTIN registrations for Input Tax Credit, and total spend.",
      icon: Users,
      color: "bg-indigo-500 text-white",
    },
  ];

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Business Intelligence & GST Reports" />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div>
          <h2 className="text-xl font-black text-slate-900">Download Official Reports & CSV Spreadsheets</h2>
          <p className="text-xs text-slate-500">
            Export structured financial, sales, inventory, and customer databases for Indian accounting and tax filing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((r) => {
            const Icon = r.icon;
            const isWorking = downloading === r.type;

            return (
              <div
                key={r.type}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl ${r.color} shadow-md shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900">{r.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Format: .CSV / Excel</span>
                  <button
                    onClick={() => handleDownload(r.type)}
                    disabled={Boolean(downloading)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isWorking ? "Exporting..." : "Download CSV Report"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
