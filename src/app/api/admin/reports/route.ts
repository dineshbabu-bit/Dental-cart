import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "sales"; // sales, products, inventory, customers, orders
    const format = searchParams.get("format") || "json"; // json, csv

    if (type === "sales") {
      const orders = await prisma.order.findMany({
        where: { orderStatus: { not: "CANCELLED" } },
        include: { items: true, payment: true },
        orderBy: { createdAt: "desc" },
      });

      if (format === "csv") {
        let csv = "Order Number,Date,Customer Name,Clinic Name,State,Payment Method,Subtotal,GST (Tax),Discount,Shipping,Grand Total,Status\n";
        orders.forEach((o) => {
          const date = new Date(o.createdAt).toLocaleDateString("en-IN");
          const safeCust = `"${(o.customerName || "").replace(/"/g, '""')}"`;
          const safeClinic = `"${(o.clinicName || "").replace(/"/g, '""')}"`;
          const address = JSON.parse(o.shippingAddressJson || "{}");
          const state = `"${(address.state || "").replace(/"/g, '""')}"`;
          csv += `${o.orderNumber},${date},${safeCust},${safeClinic},${state},${o.payment?.paymentMethod || "COD"},${o.subtotal},${o.taxAmount},${o.discountAmount},${o.shippingFee},${o.grandTotal},${o.orderStatus}\n`;
        });

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="dentalcart_sales_report_${Date.now()}.csv"`,
          },
        });
      }

      return NextResponse.json({ orders });
    }

    if (type === "products") {
      const products = await prisma.product.findMany({
        include: {
          category: true,
          brand: true,
          supplier: true,
          orderItems: true,
        },
        orderBy: { stockQuantity: "desc" },
      });

      const productReport = products.map((p) => {
        const totalUnitsSold = p.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = p.orderItems.reduce((sum, item) => sum + item.total, 0);
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category.name,
          brand: p.brand?.name || "N/A",
          supplier: p.supplier?.name || "N/A",
          price: p.price,
          discountPrice: p.discountPrice,
          gstPercentage: p.gstPercentage,
          hsnCode: p.hsnCode,
          stockQuantity: p.stockQuantity,
          totalUnitsSold,
          totalRevenue,
          batchNumber: p.batchNumber,
          expiryDate: p.expiryDate,
        };
      });

      if (format === "csv") {
        let csv = "Product Name,SKU,Category,Brand,Price (INR),Stock,Units Sold,Total Revenue (INR),GST%,Batch No,Expiry\n";
        productReport.forEach((p) => {
          const safeName = `"${p.name.replace(/"/g, '""')}"`;
          const expiry = p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN") : "N/A";
          csv += `${safeName},${p.sku},"${p.category}","${p.brand}",${p.discountPrice || p.price},${p.stockQuantity},${p.totalUnitsSold},${p.totalRevenue},${p.gstPercentage},${p.batchNumber || "N/A"},${expiry}\n`;
        });

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="dentalcart_product_report_${Date.now()}.csv"`,
          },
        });
      }

      return NextResponse.json({ products: productReport });
    }

    if (type === "inventory") {
      const products = await prisma.product.findMany({
        include: { category: true, brand: true, supplier: true },
        orderBy: { stockQuantity: "asc" },
      });

      if (format === "csv") {
        let csv = "Product Name,SKU,Category,Current Stock,Min Stock Level,Status,Unit,Batch No,Expiry Date,Supplier\n";
        products.forEach((p) => {
          const safeName = `"${p.name.replace(/"/g, '""')}"`;
          const expiry = p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN") : "N/A";
          const status = p.stockQuantity === 0 ? "Out of Stock" : p.stockQuantity <= p.minStockQuantity ? "Low Stock" : "In Stock";
          csv += `${safeName},${p.sku},"${p.category.name}",${p.stockQuantity},${p.minStockQuantity},${status},"${p.unit}",${p.batchNumber || "N/A"},${expiry},"${p.supplier?.name || "N/A"}"\n`;
        });

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="dentalcart_inventory_report_${Date.now()}.csv"`,
          },
        });
      }

      return NextResponse.json({ products });
    }

    if (type === "customers") {
      const customers = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: { customerProfile: true, orders: true },
        orderBy: { createdAt: "desc" },
      });

      const customerReport = customers.map((c) => {
        const validOrders = c.orders.filter((o) => o.orderStatus !== "CANCELLED");
        const totalSpent = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          clinicName: c.customerProfile?.clinicName || "N/A",
          profession: c.customerProfile?.profession || "Dentist",
          gstin: c.customerProfile?.gstin || "N/A",
          ordersCount: c.orders.length,
          totalSpent,
          joinedDate: c.createdAt,
        };
      });

      if (format === "csv") {
        let csv = "Customer Name,Email,Phone,Clinic Name,Profession,GSTIN,Orders Count,Total Spent (INR),Joined Date\n";
        customerReport.forEach((c) => {
          const safeName = `"${c.name.replace(/"/g, '""')}"`;
          const safeClinic = `"${c.clinicName.replace(/"/g, '""')}"`;
          const date = new Date(c.joinedDate).toLocaleDateString("en-IN");
          csv += `${safeName},${c.email},${c.phone || "N/A"},${safeClinic},"${c.profession}",${c.gstin},${c.ordersCount},${c.totalSpent},${date}\n`;
        });

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="dentalcart_customer_report_${Date.now()}.csv"`,
          },
        });
      }

      return NextResponse.json({ customers: customerReport });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
