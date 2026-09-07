import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { orderStatus, paymentStatus, trackingNumber, courierPartner, notes } = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Handle cancellation: if order cancelled, restock products
    if (orderStatus === "CANCELLED" && existingOrder.orderStatus !== "CANCELLED") {
      for (const item of existingOrder.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const newStock = product.stockQuantity + item.quantity;
          await prisma.product.update({
            where: { id: product.id },
            data: { stockQuantity: newStock },
          });

          await prisma.inventoryTransaction.create({
            data: {
              productId: product.id,
              type: "RETURN",
              quantity: item.quantity,
              previousStock: product.stockQuantity,
              newStock,
              batchNumber: item.batchNumber,
              reason: `Restocked from cancelled order #${existingOrder.orderNumber}`,
              referenceId: existingOrder.id,
              createdById: user.id,
            },
          });
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || existingOrder.orderStatus,
        paymentStatus: paymentStatus || existingOrder.paymentStatus,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : existingOrder.trackingNumber,
        courierPartner: courierPartner !== undefined ? courierPartner : existingOrder.courierPartner,
        notes: notes !== undefined ? notes : existingOrder.notes,
      },
      include: {
        items: true,
        payment: true,
        invoice: true,
      },
    });

    // Notify customer
    if (existingOrder.userId) {
      await prisma.notification.create({
        data: {
          userId: existingOrder.userId,
          roleTarget: "CUSTOMER",
          title: `Order #${existingOrder.orderNumber} Status: ${updated.orderStatus}`,
          message: `Your order status has been updated to "${updated.orderStatus}". ${
            updated.trackingNumber ? `Tracking: ${updated.trackingNumber} (${updated.courierPartner || "Courier"})` : ""
          }`,
          type: "ORDER",
          link: `/account/orders/${existingOrder.id}`,
        },
      });
    }

    // Audit log
    await logAuditEvent({
      user,
      action: "UPDATE_ORDER_STATUS",
      entity: "Order",
      entityId: id,
      details: {
        orderNumber: existingOrder.orderNumber,
        previousStatus: existingOrder.orderStatus,
        newStatus: updated.orderStatus,
        trackingNumber: updated.trackingNumber,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
