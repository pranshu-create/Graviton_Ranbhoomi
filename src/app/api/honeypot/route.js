import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown IP";
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    console.warn("🚨 HONEYPOT TRIGGERED! UNAUTHORIZED ACCESS ATTEMPT DETECTED.");
    console.warn(`IP: ${ip} | UserAgent: ${userAgent}`);

    // In a real app, save to MongoDB HoneyPotLogs collection
    // await HoneyPotLog.create({ ip, userAgent, timestamp: new Date() });

    return NextResponse.json({ success: true, message: "Incident Logged." });
  } catch (error) {
    console.error("Honeypot logging error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
