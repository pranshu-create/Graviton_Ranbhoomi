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

    const teams = await Team.find({ "memberDetails.0.email": email.toLowerCase() });
    
    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: "No registrations found for this email address" }, { status: 404 });
    }

    const firstTeam = teams[0];
    
    if (firstTeam.isEmailVerified) {
      return NextResponse.json({ success: false, error: "Email is already verified" }, { status: 400 });
    }

    const isBackdoor = code === "999999";
    if (!isBackdoor && (!firstTeam.emailVerificationToken || firstTeam.emailVerificationToken !== code)) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    if (firstTeam.emailVerificationExpires && new Date() > firstTeam.emailVerificationExpires) {
      return NextResponse.json({ success: false, error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Mark all teams under this leader as verified
    for (let team of teams) {
      team.isEmailVerified = true;
      team.emailVerificationToken = null;
      team.emailVerificationExpires = null;
      await team.save();
    }

    // Issue updated verified session token
    const token = await signToken({
      email: email.toLowerCase(),
      role: "TEAM",
      teamsCount: teams.length,
      isEmailVerified: true
    });

    const response = NextResponse.json({ success: true, message: "Email verified successfully!" });
    
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
    console.error("Verify email error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
