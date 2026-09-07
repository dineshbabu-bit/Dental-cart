"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { formatINR } from "@/lib/indian-data";
import { Users, Search, Building2, Phone, Mail, FileText, CheckCircle2, XCircle } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadCustomers = async () => {
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, isActive: !currentStatus }),
      });
      if (res.ok) {
        setFeedback("Customer status updated.");
        loadCustomers();
        setTimeout(() => setFeedback(""), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Dental Clinic & Doctor Directory" />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Registered Practitioners & Clinics ({customers.length})</h2>
            <p className="text-xs text-slate-500">View clinic details, GSTIN registration for ITC, order history, and cumulative spend</p>
          </div>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            {feedback}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by dentist name, clinic name, email, phone, or GSTIN..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Dentist / Contact</th>
                  <th className="py-3.5 px-4">Clinic & Profession</th>
                  <th className="py-3.5 px-3">GSTIN</th>
                  <th className="py-3.5 px-3 text-center">Orders</th>
                  <th className="py-3.5 px-3 text-right">Total Spent (INR)</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{c.email}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{c.phone || "No phone"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {c.clinicName ? `🏥 ${c.clinicName}` : "Individual Practice"}
                      </span>
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {c.profession || "Dentist"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-sky-800 font-semibold">
                      {c.gstin || <span className="text-slate-400 font-normal">Unregistered</span>}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                      {c.totalOrders}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(c.totalSpent)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {c.isActive ? "ACTIVE" : "DISABLED"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleActive(c.id, c.isActive)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          c.isActive
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
