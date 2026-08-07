import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export async function POST(req) {
  try {
    const userRole = req.headers.get("x-user-role");
    const teamEmail = req.headers.get("x-team-email");

    const data = await req.formData();
    const file = data.get("file");
    const teamId = data.get("teamId");
    const utr = data.get("utr");

    if (!file || !teamId || !utr) {
      return NextResponse.json({ success: false, error: "Missing file, teamId, or UTR" }, { status: 400 });
    }

    // 1. Authorization: Ensure team user is uploading for their own team
    await connectToDatabase();
    const team = await Team.findOne({ teamId: teamId });
    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    if (userRole === "TEAM") {
      if (!team.memberDetails || !team.memberDetails[0] || team.memberDetails[0].email.toLowerCase() !== teamEmail.toLowerCase()) {
        return NextResponse.json({ success: false, error: "Forbidden: You cannot upload files for another team" }, { status: 403 });
      }
    }

    // 2. File size validation (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Executable / Malware check: inspect magic bytes
    if (buffer.length >= 2) {
      const isPE = buffer[0] === 0x4D && buffer[1] === 0x5A; // MZ header
      const isELF = buffer.length >= 4 && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46; // ELF header
      if (isPE || isELF) {
        return NextResponse.json({ success: false, error: "Malicious file detected. Upload rejected." }, { status: 400 });
      }
    }

    // 4. MIME type validation
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Allowed: JPG, JPEG, PNG, PDF" }, { status: 400 });
    }

    // 5. File extension validation
    const ext = path.extname(file.name).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ success: false, error: "Invalid file extension. Allowed: .jpg, .jpeg, .png, .pdf" }, { status: 400 });
    }

    // AI Fraud Detection: Hash the image buffer
    const screenshotHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Validate UTR strict format (must be 12 digits, standard for UPI)
    if (!/^\d{12}$/.test(utr)) {
      return NextResponse.json({ success: false, error: "Invalid UTR. It must be exactly 12 digits." }, { status: 400 });
    }

    // Check if hash already exists
    const existingTeam = await Team.findOne({ screenshotHash });
    if (existingTeam && existingTeam.teamId !== teamId) {
      return NextResponse.json({ 
        success: false, 
        error: "FRAUD DETECTED: This identical screenshot has already been used by another team.", 
        isDuplicateFraud: true 
      }, { status: 403 });
    }

    // Check if UTR is already used by another team
    const existingUtr = await Team.findOne({ utr });
    if (existingUtr && existingUtr.teamId !== teamId) {
      return NextResponse.json({
        success: false,
        error: "FRAUD DETECTED: This UTR has already been submitted by another team.",
        isDuplicateFraud: true
      }, { status: 403 });
    }

    // Save to private-uploads directory
    const uploadDir = path.join(process.cwd(), "private-uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique random UUID filename to prevent direct file scanning
    const fileName = `${teamId}_screenshot_${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    const updatedTeam = await Team.findOneAndUpdate(
      { teamId: teamId },
      { 
        status: "PENDING",
        screenshot: `/api/admin/files?path=${fileName}`,
        screenshotHash: screenshotHash,
        utr: utr
      },
      { new: true }
    );

    if (!updatedTeam) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Upload failed", details: error.message }, { status: 500 });
  }
}

