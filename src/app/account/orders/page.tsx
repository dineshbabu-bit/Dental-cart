"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/indian-data";
import {
  Package,
  Truck,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }

    if (user) {
      loadOrders();
    }
  }, [user, loading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "PROCESSING":
      case "CONFIRMED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Orders & GST Invoices
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track dental shipment dispatches and download official tax invoices
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            Order More Supplies →
          </Link>
        </div>

        {fetching ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-3xl bg-slate-200/70 animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-sm text-slate-900 font-mono">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/invoice/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>Download Tax Invoice</span>
                    </Link>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
                    >
                      <span>Track Dispatch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="divide-y divide-slate-100">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.sku} | Qty: {item.quantity} | {item.gstPercentage}% GST
                        </p>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        {formatINR(item.total)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-4">
                    <span>Payment: <strong className="uppercase text-slate-800">{order.payment?.paymentMethod || "COD"}</strong></span>
                    {order.trackingNumber && (
                      <span className="text-sky-700 font-semibold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        AWB: {order.trackingNumber} ({order.courierPartner || "Delhivery"})
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-600 font-medium">Grand Total (Inc. GST):</span>
                    <span className="text-base font-black text-slate-900 font-mono">{formatINR(order.grandTotal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              📦
            </div>
            <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your clinic hasn&apos;t placed any supply orders yet. Shop our top-rated dental materials and instruments today.
            </p>
            <Link
              href="/products"
              className="inline-block px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
