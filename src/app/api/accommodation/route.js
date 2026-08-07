import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Accommodation from "@/models/Accommodation";
import Team from "@/models/Team";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limiter";
import { accommodationSchema } from "@/lib/schemas";
import mongoSanitize from "mongo-sanitize";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const userRole = request.headers.get("x-user-role");
    const teamEmail = request.headers.get("x-team-email");

    await connectDB();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status");

    // 1. Authorization: Teams can only query their own accommodation records
    if (userRole === "TEAM") {
      if (!teamId) {
        return NextResponse.json({ success: false, error: "Forbidden: Team ID required" }, { status: 403 });
      }
      const team = await Team.findOne({ teamId });
      if (!team || !team.memberDetails || !team.memberDetails[0] || team.memberDetails[0].email.toLowerCase() !== teamEmail.toLowerCase()) {
        return NextResponse.json({ success: false, error: "Forbidden: Unauthorized team access" }, { status: 403 });
      }
    } else if (!userRole) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    let query = {};
    if (teamId) query.teamId = teamId;
    if (status) query.status = status;

    const requests = await Accommodation.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userRole = request.headers.get("x-user-role");
    const teamEmail = request.headers.get("x-team-email");

    // Rate Limit Check
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip, 10, 60000, "accommodation");
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait 1 minute." }, { status: 429 });
    }

    await connectDB();
    const rawBody = await request.json();
    const sanitizedBody = mongoSanitize(rawBody);

    const { teamId, teamName, members } = sanitizedBody; 

    if (!teamId || !members || members.length === 0) {
      return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
    }

    // 1. Authorization Check for Team User
    const team = await Team.findOne({ teamId });
    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    if (userRole === "TEAM") {
      if (!team.memberDetails || !team.memberDetails[0] || team.memberDetails[0].email.toLowerCase() !== teamEmail.toLowerCase()) {
        return NextResponse.json({ success: false, error: "Forbidden: Unauthorized team access" }, { status: 403 });
      }
    }

    const createdRequests = [];

    // 2. Schema Validation (via Zod) for each member details record
    for (const member of members) {
      const validation = accommodationSchema.safeParse({
        teamId,
        teamName,
        ...member
      });

      if (!validation.success) {
        const errorMsg = validation.error.errors[0]?.message || "Invalid member data format";
        return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
      }

      const validMember = validation.data;

      // Check if already requested
      const existing = await Accommodation.findOne({ teamId, memberEmail: validMember.memberEmail });
      if (!existing) {
        const qrCodeId = crypto.randomBytes(16).toString('hex');
        
        const newReq = await Accommodation.create({
          teamId,
          teamName,
          memberName: validMember.memberName,
          memberEmail: validMember.memberEmail,
          gender: validMember.gender,
          age: validMember.age,
          arrivalDateTime: validMember.arrivalDateTime,
          departureDateTime: validMember.departureDateTime,
          emergencyContactName: validMember.emergencyContactName,
          emergencyContactPhone: validMember.emergencyContactPhone,
          idProofUrl: validMember.idProofUrl,
          qrCodeId
        });
        createdRequests.push(newReq);
      }
    }

    return NextResponse.json({ success: true, message: "Requested successfully", data: createdRequests });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { sendAccommodationFormEmail, sendAccommodationQREmail } from "@/lib/email";

export async function PUT(request) {
  try {
    const userRole = request.headers.get("x-user-role");

    // 1. Strict Administrator authorization check
    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectDB();
    const rawBody = await request.json();
    const sanitizedBody = mongoSanitize(rawBody);
    const { id, status, roomNumber } = sanitizedBody;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const acc = await Accommodation.findById(id);
    if (!acc) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (roomNumber !== undefined) updateData.roomNumber = roomNumber;

    // Handle APPROVED transition
    if (status === "APPROVED" && acc.status !== "APPROVED" && roomNumber) {
      let targetEmail = acc.memberEmail;
      
      // Fallback to team leader if the member has a placeholder email
      if (!targetEmail || targetEmail.includes("@temp.com")) {
        const team = await Team.findOne({ teamId: acc.teamId });
        if (team) {
          const leader = team.memberDetails.find(m => m.role === "Leader") || team.memberDetails[0];
          if (leader && leader.email) {
            targetEmail = leader.email;
          }
        }
      }

      if (targetEmail) {
        // Send QR code email asynchronously directly to the target
        sendAccommodationQREmail(targetEmail, acc.teamName, acc.memberName, roomNumber, acc.qrCodeId);
      }
    }

    const updated = await Accommodation.findByIdAndUpdate(id, updateData, { new: true });
    
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

