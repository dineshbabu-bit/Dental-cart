import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, Mail, Phone, MapPin, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs mt-auto">
      {/* 4 Trust Value Badges */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">100% Genuine Supplies</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Direct authorized partnerships with 3M, Mani, GC Dental, Dentsply Sirona & Ivoclar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">GST Input Tax Credit</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Tax invoice with GSTIN & HSN codes for 100% Input Tax Credit claim on every clinic purchase.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Pan-India Express Dispatch</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Same-day warehouse dispatch with temperature-monitored packaging for sensitive composites.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">BDS Clinical Helpdesk</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Technical support and product consultations by verified dental professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-lg">
                D
              </div>
              <div>
                <span className="text-xl font-black text-white">Dental<span className="text-sky-400">Cart</span></span>
                <p className="text-[11px] text-slate-400 font-medium">Your Trusted Dental Supply Partner</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Dental Cart India Pvt. Ltd. is India&apos;s leading digital procurement portal for dental clinics, practitioners, laboratories, and dental colleges. Delivering quality medical instruments, composites, and equipment at transparent wholesale prices.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Unit 402, Dental Hub Plaza, Andheri East, Mumbai, Maharashtra - 400069</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Helpline: +91 98765 43210 / 1800-209-3368</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Email: support@dentalcart.in / orders@dentalcart.in</span>
              </div>
              <p className="text-[11px] text-teal-400 font-mono mt-2">GSTIN: 27AABCB1234F1Z5</p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-xs mb-3.5">Popular Categories</h5>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/products?category=dental-materials" className="hover:text-white transition-colors">Dental Materials</Link></li>
              <li><Link href="/products?category=endodontics" className="hover:text-white transition-colors">Endodontic Rotary Files</Link></li>
              <li><Link href="/products?category=dental-instruments" className="hover:text-white transition-colors">Diagnostic Instruments</Link></li>
              <li><Link href="/products?category=dental-equipment" className="hover:text-white transition-colors">LED Curing Lights</Link></li>
              <li><Link href="/products?category=prosthodontics" className="hover:text-white transition-colors">Impression Materials</Link></li>
              <li><Link href="/products?category=ppe" className="hover:text-white transition-colors">Nitrile Medical Gloves</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-xs mb-3.5">Customer Care</h5>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Track Order Status</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">View Cart</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">Clinic GST Profile</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Doctor Login</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register Clinic Account</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Indian Payment Methods */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-xs mb-3.5">Secure Indian Payments</h5>
            <p className="text-slate-400 text-xs mb-3 leading-relaxed">
              We support all major Indian payment gateways & modes:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-slate-800 text-teal-300 font-bold rounded border border-slate-700 text-[11px]">UPI (GPay / PhonePe / Paytm)</span>
              <span className="px-2.5 py-1 bg-slate-800 text-sky-300 font-bold rounded border border-slate-700 text-[11px]">Razorpay</span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-bold rounded border border-slate-700 text-[11px]">RuPay / Visa / Mastercard</span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-bold rounded border border-slate-700 text-[11px]">Net Banking (50+ Banks)</span>
              <span className="px-2.5 py-1 bg-slate-800 text-amber-300 font-bold rounded border border-slate-700 text-[11px]">Cash on Delivery</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[11px] gap-3">
          <p>© {new Date().getFullYear()} Dental Cart India Pvt. Ltd. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Return & Replacement Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
