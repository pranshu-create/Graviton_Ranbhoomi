import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import Event from "@/models/Event";
import { checkRateLimit } from "@/lib/rate-limiter";
import { teamRegisterSchema } from "@/lib/schemas";
import { verifyTurnstileToken } from "@/lib/turnstile";
import mongoSanitize from "mongo-sanitize";

export async function GET(req) {
  try {
    const userRole = req.headers.get("x-user-role");
    const teamEmail = req.headers.get("x-team-email");

    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const event = searchParams.get("event");
    
    // Authorization Check: Teams can only view their own registered squads.
    if (userRole === "TEAM") {
      if (!email || email.toLowerCase() !== teamEmail.toLowerCase()) {
        return NextResponse.json({ error: "Forbidden: You can only view your own squads." }, { status: 403 });
      }
    } else if (!userRole) {
      // Public view limits (only verified teams for leaderboard, no email allowed)
      if (email) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
    }

    let query = {};
    if (email) {
      query = { "memberDetails.0.email": email }; // Leader email
    } else if (event) {
      query = { event: new RegExp('^' + event.replace(/[^a-zA-Z0-9\s]/g, '') + '$', 'i'), status: "VERIFIED" }; // Only verified teams for leaderboard (sanitize regex)
    }

    const teams = await Team.find(query).sort({ date: -1 });
    
    // Map _id to id for frontend compatibility
    const formattedTeams = teams.map(t => ({
      ...t.toObject(),
      id: t.teamId,
      _id: t._id.toString()
    }));
    
    return NextResponse.json({ teams: formattedTeams });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch teams", details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // 1. Rate Limiting Check (10 attempts / minute per IP)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip, 10, 60000, "register");
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Too many registration attempts. Please wait 1 minute." }, { status: 429 });
    }

    await connectToDatabase();
    
    // Check lockdown status
    const { default: SystemConfig } = await import("@/models/SystemConfig");
    const config = await SystemConfig.findOne({ configId: "global" });
    if (config && config.isLockdown) {
      return NextResponse.json({ error: "System is under lockdown. Registrations are closed." }, { status: 403 });
    }

    // Parse and sanitize payload
    const rawBody = await req.json();
    const sanitizedBody = mongoSanitize(rawBody);

    // 2. Input Validation via Zod Schema
    const validation = teamRegisterSchema.safeParse(sanitizedBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues?.[0]?.message || "Invalid registration data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const data = validation.data;

    // 3. CAPTCHA Verification
    const isHuman = await verifyTurnstileToken(data.turnstileToken, ip);
    if (!isHuman) {
      return NextResponse.json({ error: "Bot verification failed. Please try again." }, { status: 400 });
    }

    // Handle Password Logic for multi-event registration
    const leaderEmail = data.memberDetails?.[0]?.email;
    const existingTeam = await Team.findOne({ "memberDetails.0.email": leaderEmail });

    // Verify session using request headers or directly from cookies (since POST /api/teams bypasses proxy path protection)
    let isSessionOwner = false;
    const userRole = req.headers.get("x-user-role");
    const teamEmail = req.headers.get("x-team-email");
    
    if (userRole === "TEAM" && teamEmail && teamEmail.toLowerCase() === leaderEmail.toLowerCase()) {
      isSessionOwner = true;
    } else {
      const token = req.cookies.get("team_token")?.value;
      if (token) {
        const { verifyToken } = await import("@/lib/auth");
        const decoded = await verifyToken(token);
        if (decoded && decoded.role === "TEAM" && decoded.email && decoded.email.toLowerCase() === leaderEmail.toLowerCase()) {
          isSessionOwner = true;
        }
      }
    }

    if (existingTeam) {
      if (isSessionOwner) {
        // Logged-in session owner, reuse their password hash silently
        data.password = existingTeam.password;
      } else {
        // Not logged in or registering as someone else: verify the password if provided
        if (!data.password) {
          return NextResponse.json({ error: "This email is already registered. Please log in first." }, { status: 400 });
        }
        const bcrypt = await import("bcryptjs");
        const isPasswordHashed = /^\$2[ayb]\$.{56}$/.test(existingTeam.password);
        let isValid = false;
        if (isPasswordHashed) {
          isValid = await bcrypt.default.compare(data.password, existingTeam.password);
        } else {
          isValid = data.password === existingTeam.password;
        }
        if (!isValid) {
          return NextResponse.json({ error: "This email is already registered. Incorrect password." }, { status: 400 });
        }
        data.password = existingTeam.password; // reuse password hash
      }
    } else {
      // For a new registration, password must be provided and must be at least 6 characters
      if (!data.password || data.password.length < 6) {
        return NextResponse.json({ error: "Password is required and must be at least 6 characters" }, { status: 400 });
      }
    }

    // Check if event is frozen
    const isFrozen = config && config.frozenEvents && config.frozenEvents.some(e => e.toUpperCase() === data.event.toUpperCase());
    if (isFrozen) {
      return NextResponse.json({ error: `Registrations for ${data.event} are currently frozen.` }, { status: 403 });
    }

    // Generate unique team ID robustly
    let teamId;
    let isUnique = false;
    let attempt = 0;
    const lastTeam = await Team.findOne().sort({ teamId: -1 });
    let nextIdNumber = 1;
    if (lastTeam && lastTeam.teamId) {
      const match = lastTeam.teamId.match(/\d+/);
      if (match) {
        nextIdNumber = parseInt(match[0], 10) + 1;
      }
    }

    while (!isUnique && attempt < 100) {
      teamId = `T-${String(nextIdNumber + attempt).padStart(3, '0')}`;
      const duplicate = await Team.findOne({ teamId });
      if (!duplicate) {
        isUnique = true;
      } else {
        attempt++;
      }
    }

    // Fetch the event to determine the current registration fee
    const eventDoc = await Event.findOne({ name: new RegExp('^' + data.event.replace(/[^a-zA-Z0-9\s]/g, '') + '$', 'i') });
    let amountPaid = 0;
    if (eventDoc && eventDoc.fees) {
      const feeMatch = eventDoc.fees.match(/\d+/);
      if (feeMatch) amountPaid = parseInt(feeMatch[0], 10);
    }

    // Generate verification code
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newTeam = new Team({
      teamId,
      ...data,
      members: data.memberDetails.length,
      amountPaid: amountPaid,
      status: "UNPAID",
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires
    });

    await newTeam.save();

    // Send verification email
    try {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail(leaderEmail, data.name, emailVerificationToken);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
    }

    // Generate JWT token for team session (unverified status)
    const { signToken } = await import("@/lib/auth");
    const token = await signToken({
      email: leaderEmail,
      role: "TEAM",
      isEmailVerified: false
    });

    const response = NextResponse.json({ success: true, team: newTeam }, { status: 201 });
    
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
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to register team", details: error.message }, { status: 500 });
  }
}

