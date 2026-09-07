"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  PhoneCall,
  ShieldCheck,
  Truck,
  FileText,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Package,
  LogOut,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatINR } from "@/lib/indian-data";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navCategories = [
    { name: "All Categories", href: "/categories" },
    { name: "Dental Materials", href: "/products?category=dental-materials" },
    { name: "Endodontics", href: "/products?category=endodontics" },
    { name: "Instruments", href: "/products?category=dental-instruments" },
    { name: "Equipment", href: "/products?category=dental-equipment" },
    { name: "Orthodontics", href: "/products?category=orthodontics" },
    { name: "PPE & Hygiene", href: "/products?category=ppe" },
    { name: "🔥 Offers", href: "/products?discount=true" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top utility notification bar */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-slate-200 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-teal-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Genuine Supplies & Authorized Distributors
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              GST Tax Invoices with Full Input Tax Credit (ITC)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              Free Shipping on Orders above ₹1,500
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              Toll Free: <strong className="text-white">1800-209-3368</strong> (9am - 8pm)
            </span>
            <span className="text-slate-500">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Pan-India Fast Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="relative flex items-center justify-center">
                <span className="text-2xl font-black tracking-tighter">D</span>
                <span className="absolute -top-1 -right-1.5 text-xs text-amber-300">✦</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Dental<span className="text-sky-600">Cart</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                  India
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-tight hidden sm:block">
                Your Trusted Dental Supply Partner
              </p>
            </div>
          </Link>

          {/* Search bar */}
          <div ref={searchRef} className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchDropdown(true)}
                  placeholder="Search 10,000+ dental products, composites, burs, instruments, brands (e.g. 3M, Mani, GIC)..."
                  className="w-full pl-11 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent transition-all shadow-inner"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Instant Search Suggestions Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-500">Searching dental supplies...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    <div className="px-3 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Matching Products
                    </div>
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 p-3 hover:bg-sky-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          {item.images?.[0]?.url ? (
                            <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Tooth</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-sky-700">
                              {formatINR(item.discountPrice || item.price)}
                            </span>
                            {item.discountPrice && (
                              <span className="text-[11px] text-slate-400 line-through">
                                {formatINR(item.price)}
                              </span>
                            )}
                            <span className="text-[10px] text-teal-600 font-medium">
                              • {item.category?.name || "Dental"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="block text-center py-2.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 transition-colors"
                    >
                      View all results for &quot;{searchQuery}&quot; →
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No dental supplies found matching &quot;{searchQuery}&quot;. Try searching for &quot;Composite&quot;, &quot;Files&quot;, or &quot;3M&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons: Wishlist, Cart, Account */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl relative transition-colors hidden sm:flex items-center"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="flex items-center gap-2.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl transition-all shadow-sm group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-sky-700 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-soft-pulse">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] text-slate-500 font-semibold uppercase leading-none">Cart</p>
                <p className="text-xs font-bold text-slate-900">{formatINR(subtotal)}</p>
              </div>
            </Link>

            {/* User Account / Auth Dropdown */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-800"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user.name}</p>
                      <p className="text-[10px] text-teal-700 font-semibold">{user.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        {user.clinicName && (
                          <p className="text-[10px] text-teal-700 font-semibold mt-1 truncate">
                            🏥 {user.clinicName}
                          </p>
                        )}
                      </div>

                      {(user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "STAFF") && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-sky-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/account/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders & Invoices
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Clinic Profile & Addresses
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-bold text-sky-700 hover:text-sky-800 hover:bg-sky-50 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hidden sm:block"
                  >
                    Register Clinic
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg md:hidden"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Category Navigation Bar (Desktop) */}
        <nav className="hidden md:flex items-center justify-between py-2.5 border-t border-slate-100 overflow-x-auto text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-6">
            {navCategories.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-sky-600 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Use Coupon <strong>WELCOME100</strong> for ₹100 Off</span>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {navCategories.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className="p-2.5 bg-slate-50 hover:bg-sky-50 rounded-lg text-slate-800"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Link
              href="/account/orders"
              onClick={() => setShowMobileMenu(false)}
              className="block p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              📦 Track Orders & Invoices
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setShowMobileMenu(false)}
              className="block p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              ❤️ Saved Dental Wishlist ({wishlistCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
