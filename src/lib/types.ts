export type UserRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type InventoryTxType = "IN" | "OUT" | "ADJUSTMENT" | "RETURN" | "ORDER_DEDUCTION";

export type PaymentMethod = "RAZORPAY" | "UPI" | "CARD" | "NETBANKING" | "COD";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type DentalProfession =
  | "Dentist"
  | "Dental Clinic"
  | "Dental Student"
  | "Dental Laboratory"
  | "Hospital"
  | "Other";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  clinicName?: string | null;
  gstin?: string | null;
  profession?: string | null;
}

export interface AddressData {
  id?: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  type?: string;
  isDefault?: boolean;
}

export interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  gstPercentage: number;
  stockQuantity: number;
  unit: string;
  images: { url: string; isThumbnail: boolean }[];
  category?: { name: string; slug: string };
  brand?: { name: string; slug: string } | null;
}

export interface CartItemState {
  id?: string;
  productId: string;
  product: CartItemProduct;
  quantity: number;
  price: number;
}

export interface GSTCalculation {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstPercentage: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  igst: number;
  isInterState: boolean;
  shippingFee: number;
  grandTotal: number;
}
