import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { verifyToken } from "@/lib/auth";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    let adminEmail = req.headers.get("x-admin-email");

    // Fallback: parse token from cookie manually if header is not present
    if (!adminEmail) {
      const token = req.cookies.get("admin_token")?.value;
      if (token) {
        const decoded = await verifyToken(token);
        if (decoded) {
          adminEmail = decoded.email;
        }
      }
    }

    if (!adminEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized: Missing administrative session" }, { status: 401 });
    }

    await connectToDatabase();

    const rawBody = await req.json();
    const { enabled } = mongoSanitize(rawBody);

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    const admin = await AdminUser.findOne({ email: adminEmail });

    if (!admin) {
      return NextResponse.json({ success: false, error: "Administrator not found" }, { status: 404 });
    }

    admin.twoFactorEnabled = enabled;
    await admin.save();

    return NextResponse.json({ 
      success: true, 
      enabled,
      message: `Administrative Two-Factor Authentication has been ${enabled ? "enabled" : "disabled"}.`
    });

  } catch (error) {
    console.error("Admin toggle 2FA error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
