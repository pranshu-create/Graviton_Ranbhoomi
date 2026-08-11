import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { loginSchema } from "@/lib/schemas";
import { verifyTurnstileToken } from "@/lib/turnstile";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    // 1. Rate Limiting Check (5 attempts / minute per IP)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip, 5, 60000, "login");
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: "Too many login requests. Please wait 1 minute." }, { status: 429 });
    }

    await connectToDatabase();
    
    // Parse body and sanitize
    const rawBody = await req.json();
    const sanitizedBody = mongoSanitize(rawBody);

    // 2. Input Schema Validation
    const validation = loginSchema.safeParse(sanitizedBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues?.[0]?.message || "Invalid input data";
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { email, password, turnstileToken } = validation.data;

    // 3. CAPTCHA Verification
    const isHuman = await verifyTurnstileToken(turnstileToken, ip);
    if (!isHuman) {
      return NextResponse.json({ success: false, error: "Bot verification failed. Please try again." }, { status: 400 });
    }

    // Find teams where the leader's email matches the input email
    const teams = await Team.find({ 
      "memberDetails.0.email": email
    });

    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid credentials or no teams found" }, { status: 401 });
    }

    // Leader password check
    const firstTeam = teams[0];
    const isHashed = /^\$2[ayb]\$.{56}$/.test(firstTeam.password);
    let isValid = false;

    if (isHashed) {
      isValid = await bcrypt.compare(password, firstTeam.password);
    } else {
      isValid = (password === firstTeam.password);
      // Auto-migrate to hashed password
      if (isValid) {
        for (let team of teams) {
          team.password = password; // Pre-save hook will hash this
          await team.save();
        }
      }
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials or no teams found" }, { status: 401 });
    }

    // Check if Two-Factor Authentication is active
    if (firstTeam.twoFactorEnabled) {
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      const twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      for (let team of teams) {
        team.twoFactorCode = twoFactorCode;
        team.twoFactorExpires = twoFactorExpires;
        await team.save();
      }

      // Dispatch 2FA code
      const { send2FAEmail } = await import("@/lib/email");
      try {
        await send2FAEmail(email, firstTeam.name, twoFactorCode);
      } catch (err) {
        console.error("2FA Email sending failed:", err);
      }

      return NextResponse.json({ 
        success: true, 
        requires2FA: true, 
        userEmail: email 
      });
    }

    // Generate JWT token for team session
    const token = await signToken({
      email: email,
      role: "TEAM",
      teamsCount: teams.length,
      isEmailVerified: !!firstTeam.isEmailVerified
    });

    const response = NextResponse.json({ success: true, userEmail: email, teamsCount: teams.length, isEmailVerified: !!firstTeam.isEmailVerified });
    
    // Set secure HttpOnly cookie for team session
    response.cookies.set({
      name: "team_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}


