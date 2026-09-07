import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dental Cart | Your Trusted Dental Supply Partner India",
  description:
    "India's premier e-commerce platform for dental clinics, dentists, and hospitals. Shop 100% genuine dental materials, instruments, endodontics, implants, and equipment with GST input credit and fast delivery.",
  keywords: [
    "Dental Cart",
    "Dental Supplies India",
    "Dental Materials Online",
    "Dental Instruments",
    "Endodontic Files",
    "3M ESPE Dental India",
    "Mani Rotary Files",
    "GC Gold Label GIC",
    "Dental Equipment GST Invoice",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col antialiased selection:bg-teal-500 selection:text-white`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
