import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
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

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (user.role === "CUSTOMER" && order.userId && order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const storeSettings = (await prisma.storeSettings.findUnique({ where: { id: "default" } })) || {
      businessName: "Dental Cart India Pvt. Ltd.",
      tagline: "Your Trusted Dental Supply Partner",
      email: "support@dentalcart.in",
      phone: "+91 98765 43210",
      address: "Unit 402, Dental Hub Plaza, Andheri East, Mumbai 400069",
      state: "Maharashtra",
      gstin: "27AABCB1234F1Z5",
      pan: "AABCB1234F",
    };

    return NextResponse.json({
      invoice: order.invoice,
      order,
      storeSettings,
    });
  } catch (error: any) {
    console.error("Invoice GET error:", error);
    return NextResponse.json({ error: "Failed to load invoice" }, { status: 500 });
  }
}
