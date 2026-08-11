import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import { signToken } from "@/lib/auth";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    await connectToDatabase();

    const rawBody = await req.json();
    const { email, code } = mongoSanitize(rawBody);

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email and OTP code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find all teams under this leader
    const teams = await Team.find({ "memberDetails.0.email": normalizedEmail });

    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: "No user found with this email" }, { status: 404 });
    }

    const firstTeam = teams[0];

    if (!firstTeam.twoFactorCode || firstTeam.twoFactorCode !== code) {
      return NextResponse.json({ success: false, error: "Invalid two-factor code" }, { status: 400 });
    }

    if (firstTeam.twoFactorExpires && new Date() > firstTeam.twoFactorExpires) {
      return NextResponse.json({ success: false, error: "Two-factor code has expired" }, { status: 400 });
    }

    // Clear 2FA code for all team documents
    for (let team of teams) {
      team.twoFactorCode = null;
      team.twoFactorExpires = null;
      await team.save();
    }

    // Generate JWT token for team session
    const token = await signToken({
      email: normalizedEmail,
      role: "TEAM",
      teamsCount: teams.length,
      isEmailVerified: !!firstTeam.isEmailVerified
    });

    const response = NextResponse.json({ 
      success: true, 
      userEmail: normalizedEmail, 
      teamsCount: teams.length, 
      isEmailVerified: !!firstTeam.isEmailVerified 
    });
    
    // Set secure HttpOnly cookie for team session
    response.cookies.set({
      name: "team_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/"
    });

    return response;

  } catch (error) {
    console.error("Verify 2FA error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
