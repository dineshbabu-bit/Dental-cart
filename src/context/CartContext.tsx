"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItemProduct, CartItemState, GSTCalculation } from "@/lib/types";
import { calculateOrderGST } from "@/lib/gst";

interface CartContextType {
  items: CartItemState[];
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  couponDetails: any | null;
  gstCalculation: GSTCalculation;
  customerState: string;
  setCustomerState: (state: string) => void;
  addItem: (product: CartItemProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "dentalcart_items_v1";
const COUPON_STORAGE_KEY = "dentalcart_coupon_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemState[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDetails, setCouponDetails] = useState<any | null>(null);
  const [customerState, setCustomerState] = useState<string>("Maharashtra");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        setCouponCode(parsed.code);
        setCouponDetails(parsed);
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (couponDetails) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(couponDetails));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save coupon to storage", e);
    }
  }, [couponDetails, isLoaded]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.product.discountPrice || item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  // Calculate discount based on coupon
  let discountAmount = 0;
  if (couponDetails) {
    if (couponDetails.discountType === "PERCENTAGE") {
      const calculated = (subtotal * couponDetails.discountValue) / 100;
      discountAmount = couponDetails.maxDiscountValue
        ? Math.min(calculated, couponDetails.maxDiscountValue)
        : calculated;
    } else {
      discountAmount = Math.min(couponDetails.discountValue, subtotal);
    }
  }

  // Free shipping over ₹1500, else ₹99
  const shippingFee = subtotal > 0 && subtotal >= 1500 ? 0 : subtotal > 0 ? 99 : 0;

  // Average GST percentage from items
  const weightedGST =
    items.length > 0
      ? items.reduce((acc, item) => {
          const itemTotal = (item.product.discountPrice || item.product.price) * item.quantity;
          return acc + (item.product.gstPercentage || 12.0) * itemTotal;
        }, 0) / (subtotal || 1)
      : 12.0;

  const gstCalculation = calculateOrderGST({
    subtotal,
    discountAmount,
    shippingFee,
    customerState,
    averageGSTRate: weightedGST,
  });

  const addItem = (product: CartItemProduct, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQty } : i
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            quantity: Math.min(quantity, product.stockQuantity || 1),
            price: product.discountPrice || product.price,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const maxStock = item.product.stockQuantity || 999;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setCouponDetails(null);
  };

  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: "Please enter a coupon code" };

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponCode(cleanCode);
        setCouponDetails(data.coupon);
        return {
          success: true,
          message: data.message || `Coupon ${cleanCode} applied!`,
          discount: data.discount,
        };
      }
      return { success: false, message: data.error || "Invalid coupon code" };
    } catch {
      return { success: false, message: "Failed to validate coupon" };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDetails(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        discountAmount,
        couponCode,
        couponDetails,
        gstCalculation,
        customerState,
        setCustomerState,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
