import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import VisitorToken from "@/models/VisitorToken";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_for_dev");

export async function GET(req) {
  try {
    const existingToken = req.cookies.get("ddos_guard_token")?.value;
    if (existingToken) {
      return NextResponse.json({ success: true, message: "Token already exists" });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    
    // Generate a secure JWT
    const tokenPayload = { ip, timestamp: Date.now() };
    const jwt = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(SECRET_KEY);

    await connectToDatabase();
    
    // Store in database
    await VisitorToken.create({ token: jwt, ip });

    const response = NextResponse.json({ success: true, message: "Token initialized" });
    
    // Set cookie
    response.cookies.set({
      name: "ddos_guard_token",
      value: jwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Init Token Error:", error);
    return NextResponse.json({ error: "Failed to initialize token" }, { status: 500 });
  }
}
