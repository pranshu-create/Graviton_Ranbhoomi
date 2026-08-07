import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import AdminUser from "@/models/AdminUser";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limiter";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip, 3, 600000, "forgot-password"); // 3 requests per 10 minutes
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: "Too many forgot password requests. Please wait 10 minutes." }, { status: 429 });
    }

    await connectToDatabase();

    const rawBody = await req.json();
    const { email } = mongoSanitize(rawBody);

    if (!email) {
      return NextResponse.json({ success: false, error: "Email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if email belongs to an AdminUser
    const admin = await AdminUser.findOne({ email: normalizedEmail });
    
    // 2. Check if email belongs to a Team leader
    const teams = await Team.find({ "memberDetails.0.email": normalizedEmail });

    if (!admin && teams.length === 0) {
      // Security Best Practice: Return a success message even if the email doesn't exist 
      // to prevent account enumeration.
      return NextResponse.json({ 
        success: true, 
        message: "If that email exists in our system, an override transmission has been sent." 
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${APP_URL}/reset-password?token=${token}`;

    let recipientName = "";

    if (admin) {
      admin.passwordResetToken = hashedToken;
      admin.passwordResetExpires = expires;
      await admin.save();
      recipientName = admin.name;
    }

    if (teams.length > 0) {
      for (let team of teams) {
        team.passwordResetToken = hashedToken;
        team.passwordResetExpires = expires;
        await team.save();
      }
      recipientName = teams[0].name; // Use the first team name as name
    }

    // Send the password reset email
    const mailSent = await sendPasswordResetEmail(normalizedEmail, recipientName, resetLink);
    if (!mailSent) {
      return NextResponse.json({ success: false, error: "Failed to send reset email. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "If that email exists in our system, an override transmission has been sent." 
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
