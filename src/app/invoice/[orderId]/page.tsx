import React from "react";
import { notFound } from "next/navigation";
import GSTInvoiceView from "@/components/ui/GSTInvoiceView";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  let order: any = null;
  let storeSettings = {
    businessName: "Dental Cart India Pvt. Ltd.",
    tagline: "Your Trusted Dental Supply Partner",
    email: "support@dentalcart.in",
    phone: "+91 98765 43210",
    address: "Unit 402, Dental Hub Plaza, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400069",
    gstin: "27AABCB1234F1Z5",
    pan: "AABCB1234F",
  };

  try {
    order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        invoice: true,
      },
    });

    const dbSettings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    if (dbSettings) {
      storeSettings = dbSettings as any;
    }
  } catch (error) {
    console.error("[InvoicePage] Error fetching invoice:", error);
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <GSTInvoiceView order={order} invoice={order.invoice} storeSettings={storeSettings} />
    </div>
  );
}
