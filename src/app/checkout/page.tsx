"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatINR, INDIAN_STATES, DENTAL_PROFESSIONS, isValidIndianPhone, isValidIndianPincode } from "@/lib/indian-data";
import {
  Check,
  ChevronRight,
  ShieldCheck,
  Building2,
  Truck,
  CreditCard,
  QrCode,
  Landmark,
  Banknote,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, couponCode, discountAmount, gstCalculation, customerState, setCustomerState, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Step 1: Customer Details
  const [customerName, setCustomerName] = useState(user?.name || "Dr. Rohit Sharma");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "dr.sharma@dentalclinic.in");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "+91 98303 34567");
  const [profession, setProfession] = useState(user?.profession || "Dentist");
  const [clinicName, setClinicName] = useState(user?.clinicName || "Sharma Multispeciality Dental Clinic");
  const [gstin, setGstin] = useState(user?.gstin || "27AAACS1234A1Z1");

  // Step 2: Shipping Address
  const [street, setStreet] = useState("Shop 12, Ground Floor, Royal Arcade, SV Road, Bandra West");
  const [landmark, setLandmark] = useState("Opposite Bandra Police Station");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState(customerState || "Maharashtra");
  const [pincode, setPincode] = useState("400050");
  const [addressType, setAddressType] = useState("CLINIC");

  // Step 4: Payment Selection
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("dr.rohitsharma@okhdfcbank");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8821");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("891");

  // Update customer state in context when state input changes
  useEffect(() => {
    if (state) {
      setCustomerState(state);
    }
  }, [state, setCustomerState]);

  // Sync user profile when loaded
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.clinicName) setClinicName(user.clinicName);
      if (user.gstin) setGstin(user.gstin);
      if (user.profession) setProfession(user.profession);
    }
  }, [user]);

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Your cart is empty</h2>
          <p className="text-xs text-slate-500">Please add dental supplies to your cart before proceeding to checkout.</p>
          <Link href="/products" className="inline-block px-6 py-3 bg-sky-600 text-white font-bold text-xs rounded-xl">
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle final order submission
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        clinicName,
        gstin,
        shippingAddress: {
          name: customerName,
          phone: customerPhone,
          street,
          landmark,
          city,
          state,
          pincode,
          type: addressType,
        },
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.product.name,
          quantity: i.quantity,
        })),
        couponCode: couponCode || undefined,
        paymentMethod,
        paymentDetails: {
          method: paymentMethod,
          upiId: paymentMethod === "UPI" ? upiId : undefined,
          bank: paymentMethod === "NETBANKING" ? selectedBank : undefined,
          transactionId: `TXN-IND-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setConfirmedOrder(data.order);
        clearCart();
        setCurrentStep(5); // Move to Step 5: Confirmation
      } else {
        setErrorMessage(data.error || "Failed to place order. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { num: 1, label: "Doctor & Clinic" },
    { num: 2, label: "Delivery Address" },
    { num: 3, label: "Order Review" },
    { num: 4, label: "Indian Payments" },
    { num: 5, label: "Confirmation" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step Progress Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      currentStep === s.num
                        ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-md"
                        : currentStep > s.num
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-bold ${
                      currentStep >= s.num ? "text-slate-900" : "text-slate-400"
                    } hidden md:inline`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > idx + 1 ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 5: Order Confirmation Screen */}
        {currentStep === 5 && confirmedOrder && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-md max-w-3xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold uppercase tracking-wider">
                Order Confirmed & Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Thank you, {confirmedOrder.customerName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your dental supplies order <strong>#{confirmedOrder.orderNumber}</strong> has been successfully placed. We have initiated cold-chain & warehouse packing.
              </p>
            </div>

            {/* Key Order Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Order Number</span>
                <p className="text-sm font-black text-sky-700 font-mono mt-0.5">{confirmedOrder.orderNumber}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Grand Total Paid</span>
                <p className="text-sm font-black text-slate-900 font-mono mt-0.5">{formatINR(confirmedOrder.grandTotal)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Payment Status</span>
                <p className="text-sm font-black text-emerald-700 mt-0.5 uppercase">{confirmedOrder.paymentStatus}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/invoice/${confirmedOrder.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors"
              >
                <FileText className="w-4 h-4" /> Download Official GST Tax Invoice
              </Link>
              <Link
                href={`/account/orders/${confirmedOrder.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors"
              >
                <Truck className="w-4 h-4" /> Track Live Dispatch
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        )}

        {/* Steps 1 to 4 Layout */}
        {currentStep < 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Form Area */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* STEP 1: Customer & Doctor Info */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">Step 1: Practitioner & Clinic Information</h2>
                    <p className="text-xs text-slate-500">Enter your dental clinic details for GST tax billing and delivery communication</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Doctor / Contact Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Dr. Rohit Sharma"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Dental Profession *</label>
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
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (For GST Invoice) *</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="doctor@clinic.com"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (For Courier Updates) *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Clinic / Hospital Name</label>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Sharma Multispeciality Dental Clinic"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Clinic GSTIN <span className="text-slate-400 font-normal">(For Input Tax Credit)</span>
                      </label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        placeholder="27AAACS1234A1Z1"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => {
                        if (!customerName || !customerEmail || !customerPhone) {
                          setErrorMessage("Please fill in your name, email and phone number.");
                          return;
                        }
                        setErrorMessage("");
                        setCurrentStep(2);
                      }}
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors flex items-center gap-2"
                    >
                      <span>Proceed to Address</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Delivery Address */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">Step 2: Clinic Delivery Address</h2>
                    <p className="text-xs text-slate-500">Provide precise delivery location for secure medical courier dispatch</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Clinic / Hospital Full Address *</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Shop/Unit No., Floor, Building Name, Street"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Landmark</label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Near City Hospital / Police Station"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Mumbai"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Indian State (For GST Tax Origin) *</label>
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">6-Digit Pincode *</label>
                        <input
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="400050"
                          maxLength={6}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                      onClick={() => {
                        if (!street || !city || !state || !pincode) {
                          setErrorMessage("Please complete all address fields.");
                          return;
                        }
                        if (!isValidIndianPincode(pincode)) {
                          setErrorMessage("Please enter a valid 6-digit Indian pincode.");
                          return;
                        }
                        setErrorMessage("");
                        setCurrentStep(3);
                      }}
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors flex items-center gap-2"
                    >
                      <span>Proceed to Order Review</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Order Review */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">Step 3: Review Dental Order & Billing</h2>
                    <p className="text-xs text-slate-500">Verify your supply items, shipping address, and tax structure</p>
                  </div>

                  {/* Address Summary */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>Delivery Destination:</span>
                      <button onClick={() => setCurrentStep(2)} className="text-sky-600 hover:underline text-[11px]">Edit</button>
                    </div>
                    <p className="font-semibold">{customerName} {clinicName ? `(${clinicName})` : ""}</p>
                    <p>{street}, {city}, {state} - {pincode}</p>
                    <p className="text-slate-500">Phone: {customerPhone} | State GST Status: {state === "Maharashtra" ? "Intra-State (CGST+SGST)" : "Inter-State (IGST)"}</p>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {items.map((item) => (
                      <div key={item.productId} className="p-3.5 flex items-center justify-between text-xs bg-white">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            SKU: {item.product.sku} | Qty: {item.quantity} | {item.product.gstPercentage}% GST
                          </p>
                        </div>
                        <div className="text-right font-mono font-bold text-slate-900">
                          {formatINR((item.product.discountPrice || item.product.price) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors flex items-center gap-2"
                    >
                      <span>Proceed to Payment</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Indian Payment Selection */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">Step 4: Select Payment Method</h2>
                    <p className="text-xs text-slate-500">Encrypted Indian healthcare payments with instant automated GST invoices</p>
                  </div>

                  {/* Payment Options Grid */}
                  <div className="space-y-3">
                    {/* UPI Option */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "UPI"
                          ? "border-sky-600 bg-sky-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "UPI"}
                        onChange={() => setPaymentMethod("UPI")}
                        className="mt-1 w-4 h-4 text-sky-600"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-sky-600" />
                            <span className="text-xs font-bold text-slate-900">
                              Instant UPI (GPay, PhonePe, Paytm, BHIM)
                            </span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded">
                            Fastest & Zero Fee
                          </span>
                        </div>

                        {paymentMethod === "UPI" && (
                          <div className="p-3 bg-white rounded-xl border border-sky-200 space-y-2 mt-2">
                            <label className="text-[11px] font-bold text-slate-700 block">Enter Your VPA / UPI ID:</label>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="doctor@okhdfcbank"
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                            <p className="text-[10px] text-slate-500">
                              A payment request of <strong>{formatINR(gstCalculation.grandTotal)}</strong> will be approved instantly.
                            </p>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Razorpay Option */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "RAZORPAY"
                          ? "border-sky-600 bg-sky-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "RAZORPAY"}
                        onChange={() => setPaymentMethod("RAZORPAY")}
                        className="mt-1 w-4 h-4 text-sky-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-sky-600" />
                            <span className="text-xs font-bold text-slate-900">
                              Razorpay Indian Payment Gateway
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Cards, Netbanking, Wallets</span>
                        </div>
                      </div>
                    </label>

                    {/* Cards Option */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "CARD"
                          ? "border-sky-600 bg-sky-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "CARD"}
                        onChange={() => setPaymentMethod("CARD")}
                        className="mt-1 w-4 h-4 text-sky-600"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-sky-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Credit / Debit Card (RuPay, Visa, Mastercard)
                          </span>
                        </div>

                        {paymentMethod === "CARD" && (
                          <div className="p-3 bg-white rounded-xl border border-sky-200 space-y-2 mt-2 text-xs">
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">Card Number</label>
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500 block mb-0.5">Expiry (MM/YY)</label>
                                <input
                                  type="text"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 block mb-0.5">CVV</label>
                                <input
                                  type="password"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  maxLength={4}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Net Banking */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "NETBANKING"
                          ? "border-sky-600 bg-sky-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "NETBANKING"}
                        onChange={() => setPaymentMethod("NETBANKING")}
                        className="mt-1 w-4 h-4 text-sky-600"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-sky-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Indian Net Banking (50+ Supported Banks)
                          </span>
                        </div>

                        {paymentMethod === "NETBANKING" && (
                          <div className="p-3 bg-white rounded-xl border border-sky-200 mt-2">
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                            >
                              <option value="HDFC Bank">HDFC Bank</option>
                              <option value="State Bank of India">State Bank of India (SBI)</option>
                              <option value="ICICI Bank">ICICI Bank</option>
                              <option value="Axis Bank">Axis Bank</option>
                              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                              <option value="Punjab National Bank">Punjab National Bank</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "COD"
                          ? "border-sky-600 bg-sky-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="mt-1 w-4 h-4 text-sky-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-sky-600" />
                            <span className="text-xs font-bold text-slate-900">
                              Cash on Delivery (Pay at Clinic Reception)
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                            Available
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      {isProcessing ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <span>Pay & Place Order ({formatINR(gstCalculation.grandTotal)})</span>
                          <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Summary (Sticky) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-24">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
              </h3>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                {items.map((i) => (
                  <div key={i.productId} className="flex justify-between items-start gap-2">
                    <span className="text-slate-700 font-medium truncate">
                      {i.quantity}x {i.product.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900 shrink-0">
                      {formatINR((i.product.discountPrice || i.product.price) * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatINR(gstCalculation.subtotal)}</span>
                </div>

                {gstCalculation.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({couponCode}):</span>
                    <span className="font-mono">-{formatINR(gstCalculation.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span className="font-mono">{formatINR(gstCalculation.taxableAmount)}</span>
                </div>

                {gstCalculation.isInterState ? (
                  <div className="flex justify-between text-teal-800">
                    <span>IGST ({gstCalculation.gstPercentage.toFixed(0)}%):</span>
                    <span className="font-mono font-semibold">{formatINR(gstCalculation.igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-teal-800">
                      <span>CGST ({(gstCalculation.gstPercentage / 2).toFixed(1)}%):</span>
                      <span className="font-mono font-semibold">{formatINR(gstCalculation.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-teal-800">
                      <span>SGST ({(gstCalculation.gstPercentage / 2).toFixed(1)}%):</span>
                      <span className="font-mono font-semibold">{formatINR(gstCalculation.sgst)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-mono font-semibold">
                    {gstCalculation.shippingFee === 0 ? "FREE" : formatINR(gstCalculation.shippingFee)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Total Payable:</span>
                <span className="text-xl font-black text-sky-700 font-mono">
                  {formatINR(gstCalculation.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
