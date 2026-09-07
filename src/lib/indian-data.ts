export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const DENTAL_PROFESSIONS = [
  "Dentist (BDS/MDS)",
  "Dental Clinic / Practice",
  "Dental Student / Intern",
  "Dental Laboratory",
  "Hospital / Dental Dept.",
  "Dental Dealer / Distributor",
  "Other",
] as const;

export const COURIER_PARTNERS = [
  "Delhivery Express Healthcare",
  "Blue Dart MedExpress",
  "DTDC Health Logistics",
  "Shadowfax Prime",
  "India Post Speed Post",
] as const;

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function isValidIndianPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, "");
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith("91"));
}

export function isValidGSTIN(gstin: string): boolean {
  if (!gstin) return true; // optional for individual dentists
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstin.trim().toUpperCase());
}
