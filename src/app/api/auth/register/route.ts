import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth";
import { SessionUser, UserRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, profession, clinicName, gstin } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: "CUSTOMER",
        isActive: true,
        customerProfile: {
          create: {
            profession: profession || "Dentist",
            clinicName: clinicName ? clinicName.trim() : null,
            gstin: gstin ? gstin.trim().toUpperCase() : null,
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });

    const sessionUser: SessionUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role as UserRole,
      clinicName: newUser.customerProfile?.clinicName,
      gstin: newUser.customerProfile?.gstin,
      profession: newUser.customerProfile?.profession,
    };

    const token = signToken(sessionUser);
    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register account. Please try again." },
      { status: 500 }
    );
  }
}
