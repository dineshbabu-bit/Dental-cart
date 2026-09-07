"use client";

import React from "react";
import { Printer, Download, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/indian-data";

interface GSTInvoiceProps {
  order: any;
  invoice: any;
  storeSettings?: any;
}

export default function GSTInvoiceView({ order, invoice, storeSettings }: GSTInvoiceProps) {
  const seller = storeSettings || {
    businessName: "Dental Cart India Pvt. Ltd.",
    tagline: "Your Trusted Dental Supply Partner",
    email: "support@dentalcart.in",
    phone: "+91 98765 43210",
    address: "Unit 402, Dental Hub Plaza, Andheri East, Mumbai",
    state: "Maharashtra",
    pincode: "400069",
    gstin: "27AABCB1234F1Z5",
    pan: "AABCB1234F",
  };

  const address = JSON.parse(order.shippingAddressJson || "{}");
  const isInterState = Boolean(order.igst > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls (hidden when printing) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Order #{order.orderNumber}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="invoice-print-area"
        className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md text-slate-800 text-xs font-sans"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-700 flex items-center justify-center text-white font-black text-xl">
                D
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{seller.businessName}</h1>
                <p className="text-[11px] text-slate-500 font-medium">{seller.tagline}</p>
              </div>
            </div>
            <div className="mt-3 text-slate-600 space-y-0.5 text-[11px]">
              <p>{seller.address}</p>
              <p>{seller.city}, {seller.state} - {seller.pincode}</p>
              <p>Email: {seller.email} | Tel: {seller.phone}</p>
              <p className="font-bold text-slate-900 mt-1">
                GSTIN: <span className="font-mono text-sky-800">{seller.gstin}</span> | PAN: {seller.pan}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded">
              TAX INVOICE
            </span>
            <p className="text-xs font-bold text-slate-900 mt-2">
              Invoice No: <span className="font-mono text-sky-700">{invoice?.invoiceNumber || `INV-${order.orderNumber}`}</span>
            </p>
            <p className="text-slate-600">
              Invoice Date: {new Date(invoice?.invoiceDate || order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <p className="text-slate-600">
              Order No: <span className="font-mono font-semibold">{order.orderNumber}</span>
            </p>
            <p className="text-slate-600">
              Payment Mode: <strong className="uppercase">{order.payment?.paymentMethod || "COD"}</strong>
            </p>
            {order.payment?.transactionId && (
              <p className="text-[10px] text-slate-500 font-mono">
                Txn ID: {order.payment.transactionId}
              </p>
            )}
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Billed To / Buyer Details</h3>
            <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
            {order.clinicName && (
              <p className="font-semibold text-teal-800 text-xs mt-0.5">🏥 {order.clinicName}</p>
            )}
            <p className="text-slate-600 mt-1">{address.street || order.customerPhone}</p>
            <p className="text-slate-600">{address.city}, {address.state} - {address.pincode}</p>
            <p className="text-slate-600">Mobile: {order.customerPhone} | Email: {order.customerEmail}</p>
            <p className="font-bold text-slate-900 mt-1.5">
              Buyer GSTIN: <span className="font-mono text-sky-800">{order.gstin || "Unregistered / B2C"}</span>
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Shipping Destination</h3>
            <p className="text-sm font-bold text-slate-900">{address.name || order.customerName}</p>
            <p className="text-slate-600 mt-1">{address.street}</p>
            {address.landmark && <p className="text-slate-500 italic">Landmark: {address.landmark}</p>}
            <p className="text-slate-600">{address.city}, {address.state} - {address.pincode}</p>
            <p className="text-slate-600">Place of Supply: <strong className="text-slate-800">{address.state || "Maharashtra"} (State Code: 27)</strong></p>
            {order.trackingNumber && (
              <p className="text-xs text-sky-700 font-semibold mt-1">
                Courier: {order.courierPartner || "Delhivery"} | AWB: {order.trackingNumber}
              </p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-y border-slate-300">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Description of Dental Goods</th>
                <th className="py-2.5 px-2">HSN</th>
                <th className="py-2.5 px-2">Batch / Expiry</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-2 text-center">GST%</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items?.map((item: any, idx: number) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</p>
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-600">{item.product?.hsnCode || "9018"}</td>
                  <td className="py-3 px-2 text-[10px] text-slate-600">
                    {item.batchNumber ? `B:${item.batchNumber}` : "N/A"}
                    {item.expiryDate && (
                      <span className="block text-slate-400">
                        Exp: {new Date(item.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-slate-800">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatINR(item.discountPrice || item.price)}</td>
                  <td className="py-3 px-2 text-center text-teal-700 font-semibold">{item.gstPercentage}%</td>
                  <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">{formatINR(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax Calculation Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-800">
          <div className="space-y-2 text-[11px] text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold uppercase text-slate-800 text-xs">Bank Details for Direct Settlement:</h4>
            <p>Beneficiary: <strong>Dental Cart India Pvt. Ltd.</strong></p>
            <p>Bank: HDFC Bank Ltd | Branch: Andheri East, Mumbai</p>
            <p>Account No: <span className="font-mono font-bold">50200084920194</span></p>
            <p>IFSC Code: <span className="font-mono font-bold">HDFC0000240</span></p>
            <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 mt-2">
              Note: 100% Genuine dental goods sold with manufacturer warranty. Claim Input Tax Credit using our GSTIN 27AABCB1234F1Z5.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Subtotal (Gross Value):</span>
              <span className="font-mono font-semibold">{formatINR(order.subtotal)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                <span>Coupon Discount ({order.couponCode || "PROMO"}):</span>
                <span className="font-mono font-semibold">-{formatINR(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Taxable Value:</span>
              <span className="font-mono font-semibold">{formatINR(order.subtotal - order.discountAmount)}</span>
            </div>

            {isInterState ? (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Integrated GST (IGST):</span>
                <span className="font-mono font-semibold text-teal-700">{formatINR(order.igst || order.taxAmount)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Central GST (CGST):</span>
                  <span className="font-mono font-semibold text-teal-700">{formatINR(order.cgst || order.taxAmount / 2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">State GST (SGST):</span>
                  <span className="font-mono font-semibold text-teal-700">{formatINR(order.sgst || order.taxAmount / 2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Shipping & Handling:</span>
              <span className="font-mono font-semibold">{order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-slate-800 text-sm font-black text-slate-900 bg-sky-50 px-3 rounded-lg">
              <span>Grand Total (INR):</span>
              <span className="font-mono text-sky-800 text-base">{formatINR(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Signatory Footer */}
        <div className="flex justify-between items-end pt-12 text-[11px] text-slate-500">
          <div>
            <p>This is a computer-generated GST Tax Invoice.</p>
            <p className="text-emerald-700 font-semibold mt-0.5">✓ Authenticated by Dental Cart E-Commerce Gateway</p>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-slate-400 mb-1"></div>
            <p className="font-bold text-slate-800">Authorized Signatory</p>
            <p>{seller.businessName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
