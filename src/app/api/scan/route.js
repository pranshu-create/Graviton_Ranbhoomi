import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import { pusherServer } from "@/lib/pusherServer";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(req) {
  try {
    const userRole = req.headers.get("x-user-role");
    
    // 1. Double check Administrator Clearance
    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    // 2. Admin rate limit check (20 requests/minute per IP)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip, 20, 60000, "admin");
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: "Too many scan operations. Please slow down." }, { status: 429 });
    }

    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json({ success: false, error: "Missing teamId in QR payload" }, { status: 400 });
    }

    await connectToDatabase();

    const team = await Team.findOne({ teamId });
    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found in registry" }, { status: 404 });
    }

    if (team.status !== "VERIFIED") {
      return NextResponse.json({ success: false, error: "Team payment is not verified", teamStatus: team.status }, { status: 403 });
    }

    if (team.isPresent) {
      return NextResponse.json({ success: false, error: "Team has already checked in", team }, { status: 400 });
    }

    // Mark as present
    team.isPresent = true;
    await team.save();

    try {
      await pusherServer.trigger("god-mode-channel", "event-scan", team);
    } catch (e) {
      console.error("Pusher trigger failed:", e);
    }

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Scan Error:", error);
    return NextResponse.json({ success: false, error: "Scan verification failed", details: error.message }, { status: 500 });
  }
}

