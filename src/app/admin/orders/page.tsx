"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import { formatINR } from "@/lib/indian-data";
import {
  ShoppingCart,
  Search,
  FileText,
  Truck,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        setFeedback("Order status updated.");
        loadOrders();
        setTimeout(() => setFeedback(""), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Order Fulfillment & Dispatch Pipeline" />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Clinic Orders ({orders.length})</h2>
            <p className="text-xs text-slate-500">Manage state-level fulfillment, tracking numbers, and automated GST invoices</p>
          </div>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            {feedback}
          </div>
        )}

        {/* Status Filter Bar */}
        <div className="flex flex-wrap gap-2">
          {["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === s ? "bg-sky-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {s ? s.replace(/_/g, " ") : "All Orders"}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer / Clinic</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3 text-right">Grand Total</th>
                  <th className="py-3.5 px-3 text-center">Payment</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 font-mono">Tracking No.</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{order.customerName}</p>
                      {order.clinicName && (
                        <p className="text-[10px] text-teal-700 truncate max-w-xs">🏥 {order.clinicName}</p>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(order.grandTotal)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded uppercase">
                        {order.payment?.paymentMethod || "COD"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="text-xs font-bold rounded-lg px-2 py-1 bg-slate-50 border border-slate-200 outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      {order.trackingNumber ? (
                        <span className="text-sky-700 font-semibold">{order.trackingNumber}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/invoice/${order.id}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Print GST Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
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
