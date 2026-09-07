import { GSTCalculation } from "./types";

export const DEFAULT_BUSINESS_STATE = "Maharashtra";

export function calculateOrderGST({
  subtotal,
  discountAmount = 0,
  shippingFee = 0,
  customerState = "Maharashtra",
  sellerState = DEFAULT_BUSINESS_STATE,
  averageGSTRate = 12.0,
}: {
  subtotal: number;
  discountAmount?: number;
  shippingFee?: number;
  customerState?: string;
  sellerState?: string;
  averageGSTRate?: number;
}): GSTCalculation {
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const totalTax = (taxableAmount * averageGSTRate) / 100;
  
  const isInterState =
    customerState.trim().toLowerCase() !== sellerState.trim().toLowerCase();

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = totalTax;
  } else {
    cgst = totalTax / 2;
    sgst = totalTax / 2;
  }

  const grandTotal = Math.round(taxableAmount + totalTax + shippingFee);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    gstPercentage: averageGSTRate,
    totalTax: Math.round(totalTax * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    isInterState,
    shippingFee,
    grandTotal,
  };
}
