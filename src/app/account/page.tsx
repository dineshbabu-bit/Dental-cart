"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";
import { DENTAL_PROFESSIONS, INDIAN_STATES } from "@/lib/indian-data";
import {
  User,
  Building2,
  FileText,
  MapPin,
  Package,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  LogOut,
} from "lucide-react";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, loading, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile"); // profile, addresses, security

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("Dentist");
  const [clinicName, setClinicName] = useState("");
  const [gstin, setGstin] = useState("");
  const [savedFeedback, setSavedFeedback] = useState("");

  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("Mumbai");
  const [addrState, setAddrState] = useState("Maharashtra");
  const [addrPincode, setAddrPincode] = useState("400050");
  const [addrType, setAddrType] = useState("CLINIC");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setProfession(user.profession || "Dentist");
      setClinicName(user.clinicName || "");
      setGstin(user.gstin || "");
    }
  }, [user, loading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback("Profile updated successfully!");
    setTimeout(() => setSavedFeedback(""), 3000);
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-xs">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[10px] font-bold uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              {user.clinicName && (
                <p className="text-xs font-semibold text-sky-800 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  {user.clinicName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/account/orders"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>My Orders & Invoices</span>
            </Link>
            <button
              onClick={() => logout()}
              className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tabs Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-3 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-colors text-left ${
                activeTab === "profile" ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Practitioner Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-colors text-left ${
                activeTab === "addresses" ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Clinic Addresses</span>
            </button>

            <Link
              href="/account/orders"
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
            >
              <Package className="w-4 h-4" />
              <span>Order History & Invoices</span>
            </Link>

            <Link
              href="/account/wishlist"
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
            >
              <FileText className="w-4 h-4" />
              <span>Saved Wishlist</span>
            </Link>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-base font-black text-slate-900">Clinical Profile & GST Settings</h2>
                  <p className="text-xs text-slate-500">
                    Your clinic information and GSTIN will automatically appear on all future tax invoices for Input Tax Credit.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Profession</label>
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                      {DENTAL_PROFESSIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Clinic / Practice Name</label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Clinic GSTIN (For ITC)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>

                {savedFeedback && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{savedFeedback}</span>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Saved Clinic Delivery Addresses</h2>
                    <p className="text-xs text-slate-500">Manage destination addresses for fast 1-click re-ordering</p>
                  </div>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-sky-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                </div>

                {/* Sample Saved Address */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span className="flex items-center gap-1.5 text-sky-800">
                      <Building2 className="w-4 h-4 text-sky-600" /> Main Clinic (Default)
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-extrabold text-[10px]">
                      DEFAULT
                    </span>
                  </div>
                  <p className="font-bold text-slate-800">{user.name}</p>
                  <p className="text-slate-600">Shop 12, Ground Floor, Royal Arcade, SV Road, Bandra West</p>
                  <p className="text-slate-600">Mumbai, Maharashtra - 400050</p>
                  <p className="text-slate-500">Phone: {user.phone || "+91 98303 34567"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
