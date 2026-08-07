import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET(req) {
  try {
    const userRole = req.headers.get("x-user-role");
    const teamEmail = req.headers.get("x-team-email");

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("path");

    // 1. Prevent Directory Traversal
    if (!fileName || fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      return NextResponse.json({ success: false, error: "Invalid path specification" }, { status: 400 });
    }

    // 2. Determine Team Association from filename (format: {teamId}_{type}_{uuid}.{ext})
    let associatedTeamId = null;
    if (fileName.includes("_screenshot_")) {
      associatedTeamId = fileName.split("_screenshot_")[0];
    } else if (fileName.includes("_id_")) {
      associatedTeamId = fileName.split("_id_")[0];
    }

    // 3. Authorization Check
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

    if (!isAdmin) {
      if (userRole === "TEAM") {
        if (!associatedTeamId || associatedTeamId === "generic") {
          // If no specific team is associated (or generic fallback), check if they have a team token
          if (!teamEmail) {
            return NextResponse.json({ success: false, error: "Forbidden: Unauthorized team access" }, { status: 403 });
          }
        } else {
          // Verify they are the owner of the associated team
          await connectToDatabase();
          const team = await Team.findOne({ teamId: associatedTeamId });
          if (!team || !team.memberDetails || !team.memberDetails[0] || team.memberDetails[0].email.toLowerCase() !== teamEmail.toLowerCase()) {
            return NextResponse.json({ success: false, error: "Forbidden: You are not authorized to view this file" }, { status: 403 });
          }
        }
      } else {
        return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
      }
    }

    // 4. Read file from private-uploads directory
    const filePath = path.join(process.cwd(), "private-uploads", fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine MIME type
    let contentType = "application/octet-stream";
    const ext = path.extname(fileName).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".pdf") contentType = "application/pdf";

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch (error) {
    console.error("Secure File Server Error:", error);
    return NextResponse.json({ success: false, error: "Failed to read file", details: error.message }, { status: 500 });
  }
}
