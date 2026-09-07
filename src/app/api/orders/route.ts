import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateOrderGST } from "@/lib/gst";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    // If customer, only show their own orders
    if (user.role === "CUSTOMER") {
      where.userId = user.id;
    }

    if (status) {
      where.orderStatus = status;
    }

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        payment: true,
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      clinicName,
      gstin,
      shippingAddress,
      items,
      couponCode,
      paymentMethod = "COD",
      paymentDetails,
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    if (!customerName || !customerPhone || !shippingAddress || !shippingAddress.state) {
      return NextResponse.json(
        { error: "Customer name, phone, and complete shipping address with state are required" },
        { status: 400 }
      );
    }

    // 1. Validate real-time stock for each product
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product '${item.productName || item.productId}' is no longer available.` },
          { status: 400 }
        );
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for '${product.name}'. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Calculate subtotal & weighted GST
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      const unitPrice = product.price;
      const effectivePrice = product.discountPrice || product.price;
      const total = effectivePrice * item.quantity;
      subtotal += total;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        price: unitPrice,
        discountPrice: product.discountPrice,
        gstPercentage: product.gstPercentage,
        quantity: item.quantity,
        total,
        batchNumber: product.batchNumber,
        expiryDate: product.expiryDate,
      });
    }

    // 3. Check Coupon
    let discountAmount = 0;
    let couponRecord: any = null;
    if (couponCode) {
      couponRecord = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });
      if (couponRecord && couponRecord.isActive) {
        if (couponRecord.discountType === "PERCENTAGE") {
          const calc = (subtotal * couponRecord.discountValue) / 100;
          discountAmount = couponRecord.maxDiscountValue
            ? Math.min(calc, couponRecord.maxDiscountValue)
            : calc;
        } else {
          discountAmount = Math.min(couponRecord.discountValue, subtotal);
        }
      }
    }

    // Free shipping threshold ₹1500
    const shippingFee = subtotal >= 1500 ? 0 : 99;

    // 4. Calculate Indian GST (CGST, SGST, IGST)
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

    const weightedGSTRate =
      orderItemsData.reduce((acc, item) => acc + item.gstPercentage * item.total, 0) / (subtotal || 1);

    const gstCalc = calculateOrderGST({
      subtotal,
      discountAmount,
      shippingFee,
      customerState: shippingAddress.state,
      sellerState: storeSettings.state,
      averageGSTRate: weightedGSTRate,
    });

    // 5. Generate Order and Invoice numbers
    const orderCount = await prisma.order.count();
    const orderNumber = `DC-2026-${String(1000 + orderCount + 1).padStart(5, "0")}`;
    const invoiceNumber = `INV-DC-2026-${String(1000 + orderCount + 1).padStart(5, "0")}`;

    const isPaid = paymentMethod === "UPI" || paymentMethod === "RAZORPAY" || paymentMethod === "CARD" || paymentMethod === "NETBANKING";

    // 6. Database Transaction: Create Order, Invoice, Payment, Deduct Stock, Create Inventory Log
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id || null,
          customerName: customerName.trim(),
          customerEmail: (customerEmail || user?.email || "customer@dentalcart.in").toLowerCase().trim(),
          customerPhone: customerPhone.trim(),
          clinicName: clinicName || user?.clinicName || null,
          gstin: gstin || user?.gstin || null,
          shippingAddressJson: JSON.stringify(shippingAddress),
          subtotal: gstCalc.subtotal,
          discountAmount: gstCalc.discountAmount,
          couponCode: couponRecord ? couponRecord.code : null,
          taxAmount: gstCalc.totalTax,
          cgst: gstCalc.cgst,
          sgst: gstCalc.sgst,
          igst: gstCalc.igst,
          shippingFee: gstCalc.shippingFee,
          grandTotal: gstCalc.grandTotal,
          paymentStatus: isPaid ? "SUCCESS" : "PENDING",
          orderStatus: "CONFIRMED",
          notes: notes || null,
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              paymentMethod,
              transactionId: paymentDetails?.transactionId || (isPaid ? `TXN-${Date.now()}` : null),
              amount: gstCalc.grandTotal,
              status: isPaid ? "SUCCESS" : "PENDING",
              paymentDetailsJson: paymentDetails ? JSON.stringify(paymentDetails) : null,
            },
          },
          invoice: {
            create: {
              invoiceNumber,
              invoiceDate: new Date(),
              subtotal: gstCalc.subtotal,
              taxAmount: gstCalc.totalTax,
              cgst: gstCalc.cgst,
              sgst: gstCalc.sgst,
              igst: gstCalc.igst,
              discountAmount: gstCalc.discountAmount,
              grandTotal: gstCalc.grandTotal,
              businessDetailsJson: JSON.stringify(storeSettings),
              customerDetailsJson: JSON.stringify({
                customerName,
                clinicName,
                gstin,
                phone: customerPhone,
                email: customerEmail || user?.email,
                billingAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
              }),
            },
          },
        },
        include: {
          items: true,
          payment: true,
          invoice: true,
        },
      });

      // Automatically reduce inventory and record audit logs
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        const newStock = Math.max(0, product.stockQuantity - item.quantity);

        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: newStock },
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: "ORDER_DEDUCTION",
            quantity: item.quantity,
            previousStock: product.stockQuantity,
            newStock: newStock,
            batchNumber: product.batchNumber,
            expiryDate: product.expiryDate,
            reason: `Order Deduction #${order.orderNumber}`,
            referenceId: order.id,
            createdById: user?.id || null,
          },
        });
      }

      // Record Coupon Usage
      if (couponRecord) {
        await tx.coupon.update({
          where: { id: couponRecord.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: couponRecord.id,
            userId: user?.id || null,
            orderId: order.id,
            discountApplied: gstCalc.discountAmount,
          },
        });
      }

      return order;
    });

    // 7. Create notifications
    if (user?.id) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          roleTarget: "CUSTOMER",
          title: `Order Placed Successfully (${newOrder.orderNumber})`,
          message: `Your order for ₹${newOrder.grandTotal} is confirmed. We are packing your dental supplies.`,
          type: "ORDER",
          link: `/account/orders/${newOrder.id}`,
        },
      });
    }

    await prisma.notification.create({
      data: {
        roleTarget: "ADMIN",
        title: `New Order Received (${newOrder.orderNumber})`,
        message: `${customerName} placed order #${newOrder.orderNumber} for ₹${newOrder.grandTotal} via ${paymentMethod}.`,
        type: "ORDER",
        link: `/admin/orders/${newOrder.id}`,
      },
    });

    // Audit log
    await logAuditEvent({
      user,
      action: "CREATE_ORDER",
      entity: "Order",
      entityId: newOrder.id,
      details: { orderNumber: newOrder.orderNumber, grandTotal: newOrder.grandTotal, paymentMethod },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 500 }
    );
  }
}
