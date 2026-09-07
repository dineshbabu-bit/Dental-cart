"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role === "SUPER_ADMIN" || res.user.role === "ADMIN" || res.user.role === "STAFF") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } else {
      setError(res.error || "Invalid email or password");
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sky-500/25">
            D
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-white">Dental<span className="text-sky-400">Cart</span></span>
            <p className="text-[11px] text-slate-400 font-medium">Your Trusted Dental Supply Partner</p>
          </div>
        </Link>
        <h2 className="text-xl font-bold text-white tracking-tight">Sign in to your Dental Account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-950/80 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <span className="text-[11px] text-sky-400 hover:underline cursor-pointer">Forgot?</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Fill Credentials */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Demo Login (Click to Fill):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("admin@dentalcart.in", "Admin@12345")}
                className="p-2 rounded-xl bg-slate-900 hover:bg-sky-950 border border-slate-700 hover:border-sky-500 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-white">👑 Super Admin</p>
                <p className="text-[9px] text-slate-400 truncate">admin@dentalcart.in</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill("staff@dentalcart.in", "Staff@12345")}
                className="p-2 rounded-xl bg-slate-900 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-white">🛡️ Staff</p>
                <p className="text-[9px] text-slate-400 truncate">staff@dentalcart.in</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill("dr.sharma@dentalclinic.in", "Customer@12345")}
                className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-500 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-white">🏥 Dentist</p>
                <p className="text-[9px] text-slate-400 truncate">dr.sharma@...</p>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2">
            New Dental Clinic or Dentist?{" "}
            <Link href="/register" className="text-sky-400 font-bold hover:underline">
              Register Practice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
