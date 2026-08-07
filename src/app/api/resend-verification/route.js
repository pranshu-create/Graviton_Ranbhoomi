import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import { sendVerificationEmail } from "@/lib/email";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const rawBody = await req.json();
    const { email } = mongoSanitize(rawBody);

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const teams = await Team.find({ "memberDetails.0.email": email.toLowerCase() });
    
    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: "No registrations found for this email address" }, { status: 404 });
    }

    const firstTeam = teams[0];
    
    if (firstTeam.isEmailVerified) {
      return NextResponse.json({ success: false, error: "Email is already verified" }, { status: 400 });
    }

    // Generate new code
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update all team records for this leader
    for (let team of teams) {
      team.emailVerificationToken = newOTP;
      team.emailVerificationExpires = expires;
      await team.save();
    }

    // Dispatch email
    const mailSent = await sendVerificationEmail(email.toLowerCase(), firstTeam.name, newOTP);
    if (!mailSent) {
      return NextResponse.json({ success: false, error: "Failed to deliver email. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "A new verification code has been dispatched to your email." });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
