import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/indian-data";
import {
  ArrowLeft,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Building2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 0;

export default async function OrderTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: true,
      payment: true,
      invoice: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = JSON.parse(order.shippingAddressJson || "{}");

  const timelineSteps = [
    { key: "CONFIRMED", label: "Order Confirmed", desc: "Payment received & verified" },
    { key: "PROCESSING", label: "Packed & Quality Checked", desc: "Dental supplies inspected & batch-logged" },
    { key: "SHIPPED", label: "Shipped / Dispatched", desc: "Handed over to Express MedCourier" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Courier on route to clinic destination" },
    { key: "DELIVERED", label: "Delivered to Clinic", desc: "Signed at clinic reception" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING": return 0;
      case "CONFIRMED": return 0;
      case "PROCESSING": return 1;
      case "SHIPPED": return 2;
      case "OUT_FOR_DELIVERY": return 3;
      case "DELIVERED": return 4;
      default: return 0;
    }
  };

  const currentIdx = getStepIndex(order.orderStatus);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              href="/account/orders"
              className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 font-mono">#{order.orderNumber}</h1>
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 font-extrabold text-[10px] uppercase rounded-full">
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <Link
            href={`/invoice/${order.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Download GST Tax Invoice</span>
          </Link>
        </div>

        {/* Visual Tracking Progress Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-600" />
            <span>Live Dispatch & Delivery Timeline</span>
          </h2>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {timelineSteps.map((step, idx) => {
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.key} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isPassed
                          ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div>
                      <p className={`text-xs font-bold ${isPassed ? "text-slate-900" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {order.trackingNumber && (
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Courier Partner: {order.courierPartner || "Delhivery Express"}</span>
                  <p className="text-slate-600 text-[11px]">Air Waybill (AWB): <strong className="font-mono text-sky-800">{order.trackingNumber}</strong></p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white text-teal-800 font-bold text-[11px] rounded-lg border border-sky-200 shadow-2xs self-start sm:self-auto">
                Temperature Sensitive Cold-Chain Verified
              </span>
            </div>
          )}
        </div>

        {/* Order Details & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shipping Address */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <h3 className="font-bold uppercase text-slate-400 text-[11px] tracking-wider flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-sky-600" /> Delivery Address
            </h3>
            <p className="font-bold text-slate-900">{order.customerName}</p>
            {order.clinicName && <p className="font-semibold text-sky-800">🏥 {order.clinicName}</p>}
            <p className="text-slate-600">{shippingAddress.street}</p>
            <p className="text-slate-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
            <p className="text-slate-500 mt-1">Phone: {order.customerPhone}</p>
            {order.gstin && <p className="font-mono text-[11px] text-teal-700 font-semibold mt-1">GSTIN: {order.gstin}</p>}
          </div>

          {/* Payment Info */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <h3 className="font-bold uppercase text-slate-400 text-[11px] tracking-wider flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Payment & Billing
            </h3>
            <p className="font-bold text-slate-900">Mode: <strong className="uppercase">{order.payment?.paymentMethod || "COD"}</strong></p>
            <p className="text-slate-600">Status: <strong className="text-emerald-700 uppercase">{order.paymentStatus}</strong></p>
            {order.payment?.transactionId && (
              <p className="text-[11px] text-slate-500 font-mono">Txn: {order.payment.transactionId}</p>
            )}
            <p className="text-slate-500 pt-2 border-t border-slate-100">
              Tax Invoice: <strong className="font-mono text-sky-700">{order.invoice?.invoiceNumber || "Generated"}</strong>
            </p>
          </div>

          {/* Amount Breakdown */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <h3 className="font-bold uppercase text-slate-400 text-[11px] tracking-wider mb-2">
              Tax & Grand Total
            </h3>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatINR(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon ({order.couponCode}):</span>
                <span className="font-mono">-{formatINR(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST Total:</span>
              <span className="font-mono">{formatINR(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping:</span>
              <span className="font-mono">{order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Grand Total:</span>
              <span className="font-mono text-sky-700">{formatINR(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Item List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Supplies in this Order ({order.items.length} items)
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-bold text-slate-800">{item.productName}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono">SKU: {item.sku}</span>
                    {item.batchNumber && <span>Batch: {item.batchNumber}</span>}
                    {item.expiryDate && <span>Exp: {new Date(item.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>}
                    <span className="text-teal-700 font-semibold">{item.gstPercentage}% GST</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-900">{formatINR(item.total)}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{item.quantity} x {formatINR(item.discountPrice || item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
