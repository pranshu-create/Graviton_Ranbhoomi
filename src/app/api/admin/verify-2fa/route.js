import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import Log from "@/models/Log";
import { signToken } from "@/lib/auth";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    await connectToDatabase();

    const rawBody = await req.json();
    const { email, code } = mongoSanitize(rawBody);

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email and OTP code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the AdminUser
    const admin = await AdminUser.findOne({ email: normalizedEmail });

    if (!admin) {
      return NextResponse.json({ success: false, error: "No administrator found with this email" }, { status: 404 });
    }

    if (!admin.twoFactorCode || admin.twoFactorCode !== code) {
      return NextResponse.json({ success: false, error: "Invalid two-factor code" }, { status: 400 });
    }

    if (admin.twoFactorExpires && new Date() > admin.twoFactorExpires) {
      return NextResponse.json({ success: false, error: "Two-factor code has expired" }, { status: 400 });
    }

    // Clear 2FA credentials
    admin.twoFactorCode = null;
    admin.twoFactorExpires = null;
    await admin.save();

    // Sign JWT
    const token = await signToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      name: admin.name
    });

    // Set cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { name: admin.name, email: admin.email, role: admin.role } 
    });
    
    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    await Log.create({
      action: "LOGIN",
      adminEmail: normalizedEmail,
      details: "Admin logged in (Two-Factor Verified)",
      ipAddress: ip
    });

    return response;

  } catch (error) {
    console.error("Admin Verify 2FA error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
