import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const roleTarget = searchParams.get("roleTarget") || "CUSTOMER";

    const where: any = {};
    if (user) {
      if (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "STAFF") {
        where.OR = [{ roleTarget: "ADMIN" }, { roleTarget: "ALL" }, { userId: user.id }];
      } else {
        where.OR = [{ roleTarget: "CUSTOMER" }, { roleTarget: "ALL" }, { userId: user.id }];
      }
    } else {
      where.roleTarget = roleTarget;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        data: { isRead: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}
