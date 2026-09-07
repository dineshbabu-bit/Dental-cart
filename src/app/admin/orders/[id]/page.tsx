"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import { formatINR, COURIER_PARTNERS } from "@/lib/indian-data";
import {
  ArrowLeft,
  FileText,
  Truck,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierPartner, setCourierPartner] = useState("Delhivery Express Healthcare");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        const o = data.order;
        setOrder(o);
        if (o) {
          setOrderStatus(o.orderStatus);
          setPaymentStatus(o.paymentStatus);
          setTrackingNumber(o.trackingNumber || "");
          setCourierPartner(o.courierPartner || "Delhivery Express Healthcare");
          setNotes(o.notes || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          trackingNumber,
          courierPartner,
          notes,
        }),
      });

      if (res.ok) {
        setFeedback("Order details and status updated successfully!");
        loadOrder();
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-12 text-center text-xs text-rose-600">Order not found.</div>;
  }

  const shipping = JSON.parse(order.shippingAddressJson || "{}");

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title={`Order #${order.orderNumber}`} />

      <div className="p-6 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <Link
            href={`/invoice/${order.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow"
          >
            <FileText className="w-4 h-4" /> Print Tax Invoice
          </Link>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Order Update Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Fulfillment & Status Manager</h3>
                <p className="text-xs text-slate-500">Update shipping milestones and dispatch identifiers</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Order Pipeline Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING (Packing)</option>
                    <option value="SHIPPED">SHIPPED (Dispatched)</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED (Restocks Inventory)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SUCCESS">SUCCESS (Paid)</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Courier Partner</label>
                  <select
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white outline-none"
                  >
                    {COURIER_PARTNERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Air Waybill (AWB) / Tracking No.</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="DELHIVERY-MH-994821"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Clinic instructions, special packaging notes..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Update Order Status"}</span>
                </button>
              </div>
            </form>

            {/* Items List */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Ordered Products ({order.items?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <p className="font-bold text-slate-800">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        SKU: {item.sku} | Qty: {item.quantity} | {item.gstPercentage}% GST
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatINR(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer & Billing Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Practitioner & Clinic
              </h3>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              {order.clinicName && <p className="font-semibold text-teal-800">🏥 {order.clinicName}</p>}
              <p className="text-slate-600">{shipping.street}</p>
              <p className="text-slate-600">{shipping.city}, {shipping.state} - {shipping.pincode}</p>
              <p className="text-slate-500">Phone: {order.customerPhone} | Email: {order.customerEmail}</p>
              {order.gstin && (
                <p className="font-mono text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded border border-teal-200 inline-block mt-1">
                  GSTIN: {order.gstin}
                </p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Financial Breakdown
              </h3>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">{formatINR(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({order.couponCode || "PROMO"}):</span>
                    <span className="font-mono">-{formatINR(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax Amount (GST):</span>
                  <span className="font-mono">{formatINR(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-mono">{order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono text-sky-700">{formatINR(order.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
