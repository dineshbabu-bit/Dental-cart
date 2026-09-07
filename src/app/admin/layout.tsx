"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (
        user.role !== "SUPER_ADMIN" &&
        user.role !== "ADMIN" &&
        user.role !== "STAFF"
      ) {
        // Customer attempting to access admin route
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
        Verifying administrative authorization...
      </div>
    );
  }

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-100 antialiased font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
