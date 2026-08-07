import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import { verifyToken } from "@/lib/auth";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    const token = req.cookies.get("team_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized: Missing session token" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "TEAM") {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid session" }, { status: 401 });
    }

    await connectToDatabase();

    const rawBody = await req.json();
    const { enabled } = mongoSanitize(rawBody);

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    // Find and update all team documents under this leader email
    const teams = await Team.find({ "memberDetails.0.email": decoded.email });

    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: "No user found with this email" }, { status: 404 });
    }

    for (let team of teams) {
      team.twoFactorEnabled = enabled;
      await team.save();
    }

    return NextResponse.json({ 
      success: true, 
      enabled,
      message: `Two-Factor Authentication has been ${enabled ? "enabled" : "disabled"}.`
    });

  } catch (error) {
    console.error("Toggle 2FA error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
