"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Tag,
  ShoppingCart,
  Users,
  Boxes,
  Truck,
  TicketPercent,
  Image as ImageIcon,
  Star,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Store,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [productsOpen, setProductsOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      label: "Products",
      icon: Package,
      hasSubmenu: true,
      isOpen: productsOpen,
      toggle: () => setProductsOpen(!productsOpen),
      subItems: [
        { label: "All Products", href: "/admin/products", icon: Package },
        { label: "Add Product", href: "/admin/products/new", icon: PlusCircle },
        { label: "Categories", href: "/admin/categories", icon: FolderTree },
        { label: "Brands", href: "/admin/brands", icon: Tag },
      ],
    },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes },
    { label: "Suppliers", href: "/admin/suppliers", icon: Truck },
    { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-sky-500/20">
            D
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-sm">DentalCart</span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Business Control Center</p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.hasSubmenu) {
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={item.toggle}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories") || pathname.startsWith("/admin/brands")
                      ? "bg-slate-800 text-sky-400"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {item.isOpen && (
                  <div className="pl-6 pr-2 space-y-1">
                    {item.subItems?.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            isSubActive
                              ? "bg-sky-600 text-white font-bold"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5" />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const href = item.href || "/admin";
          const active = isActive(href);
          return (
            <Link
              key={item.label}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/20 font-bold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Info & Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors"
        >
          <Store className="w-4 h-4" />
          <span>Switch to Storefront</span>
        </Link>

        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || "Admin"}</p>
            <p className="text-[10px] text-slate-400 font-mono">{user?.role}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
