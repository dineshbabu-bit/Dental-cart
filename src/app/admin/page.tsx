"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminHeader from "@/components/layout/AdminHeader";
import { formatINR } from "@/lib/indian-data";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Boxes,
  ArrowUpRight,
  ChevronRight,
  PlusCircle,
  FolderTree,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1">
        <AdminHeader title="Admin Dashboard Overview" />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="h-72 rounded-3xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const { metrics, salesTrends = [], recentOrders = [], lowStockList = [], categoryDistribution = [] } = data || {};

  const maxRevenue = Math.max(...salesTrends.map((s: any) => s.revenue), 1000);

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Executive Business Dashboard" />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
        {/* Quick Action Shortcuts Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Quick Actions:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition-colors border border-sky-200"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Link>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors border border-teal-200"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Manage Orders ({metrics?.pendingOrders || 0} Pending)</span>
            </Link>
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors border border-amber-200"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Stock Ledger</span>
            </Link>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors border border-indigo-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export CSV Reports</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Revenue & Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {formatINR(metrics?.totalRevenue)}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Across all Indian states</span>
              </p>
            </div>
          </div>

          {/* Today & Monthly Revenue */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Revenue</span>
              <div className="p-2 bg-sky-50 text-sky-700 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {formatINR(metrics?.todayRevenue)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Monthly: <strong className="font-mono text-slate-800">{formatINR(metrics?.monthlyRevenue)}</strong>
              </p>
            </div>
          </div>

          {/* Total Orders & Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Orders Pipeline</span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {metrics?.totalOrders || 0}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-bold mt-1">
                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  {metrics?.pendingOrders || 0} Pending
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {metrics?.completedOrders || 0} Delivered
                </span>
              </div>
            </div>
          </div>

          {/* Catalog & Inventory Alert */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Catalog & Stock</span>
              <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {metrics?.totalProducts || 0} <span className="text-xs font-normal text-slate-400">SKUs</span>
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-bold mt-1">
                {metrics?.lowStockProducts > 0 && (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    ⚠️ {metrics.lowStockProducts} Low Stock
                  </span>
                )}
                {metrics?.outOfStockProducts > 0 && (
                  <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                    ❌ {metrics.outOfStockProducts} Out of Stock
                  </span>
                )}
                {metrics?.lowStockProducts === 0 && metrics?.outOfStockProducts === 0 && (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    ✓ All Stock Healthy
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sales Chart & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 6-Month Sales Trend Visual SVG Bar Chart */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Monthly Sales Trend</h3>
                <p className="text-xs text-slate-500">Revenue performance across the last 6 months (INR ₹)</p>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                INR (₹) Analytics
              </span>
            </div>

            {/* SVG Bar Chart */}
            <div className="pt-4 h-64 flex items-end justify-between gap-3 sm:gap-6 px-2">
              {salesTrends.map((s: any, idx: number) => {
                const heightPercent = Math.max(12, Math.round((s.revenue / maxRevenue) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatINR(s.revenue)}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] bg-gradient-to-t from-sky-600 to-teal-400 rounded-t-xl group-hover:brightness-110 transition-all shadow-xs"
                    />
                    <span className="text-xs font-bold text-slate-600">{s.month}</span>
                    <span className="text-[10px] text-slate-400">{s.orders} orders</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
              Top Dental Categories
            </h3>

            <div className="space-y-3">
              {categoryDistribution.slice(0, 6).map((c: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span className="truncate">{c.name}</span>
                    <span className="font-mono text-sky-700">{c.count} SKUs</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (c.count / (metrics?.totalProducts || 1)) * 100)}%` }}
                      className="h-full bg-sky-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/admin/categories"
              className="block text-center pt-3 text-xs font-bold text-sky-600 hover:text-sky-700"
            >
              Manage All Categories →
            </Link>
          </div>
        </div>

        {/* Low Stock Alert Section */}
        {lowStockList.length > 0 && (
          <div className="bg-amber-50/70 rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-amber-950 text-base">Low Stock & Out of Stock Alerts</h3>
                  <p className="text-xs text-amber-800">The following dental items require warehouse replenishment</p>
                </div>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-50 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
              >
                Open Stock Adjuster →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {lowStockList.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-sky-700 uppercase">{item.brand?.name || "Brand"}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        item.stockQuantity === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.stockQuantity === 0 ? "OUT OF STOCK" : `${item.stockQuantity} LEFT`}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders Datatable */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base">Recent Clinic Orders</h3>
              <p className="text-xs text-slate-500">Live order status updater and tax invoice dispatcher</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Order No.</th>
                  <th className="py-3 px-4">Doctor / Clinic</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Grand Total</th>
                  <th className="py-3 px-3 text-center">Payment</th>
                  <th className="py-3 px-3">Current Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{order.customerName}</p>
                      {order.clinicName && (
                        <p className="text-[10px] text-teal-700 truncate max-w-xs">🏥 {order.clinicName}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(order.grandTotal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded uppercase">
                        {order.payment?.paymentMethod || "COD"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="text-xs font-bold rounded-lg px-2 py-1 bg-slate-50 border border-slate-200 outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/invoice/${order.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </Link>
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
