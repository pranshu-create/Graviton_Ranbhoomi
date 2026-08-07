import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import AdminUser from "@/models/AdminUser";
import { hashPassword } from "@/lib/auth";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    await connectToDatabase();

    const rawBody = await req.json();
    const { token, password } = mongoSanitize(rawBody);

    if (!token || !password) {
      return NextResponse.json({ success: false, error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Hash the token to match the database stored value
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 1. Look for matching AdminUser
    const admin = await AdminUser.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (admin) {
      const hashedPassword = await hashPassword(password);
      admin.password = hashedPassword;
      admin.passwordResetToken = null;
      admin.passwordResetExpires = null;
      await admin.save();

      return NextResponse.json({ success: true, message: "Passphrase has been reset successfully." });
    }

    // 2. Look for matching Team leader
    const firstTeam = await Team.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (firstTeam) {
      const leaderEmail = firstTeam.memberDetails[0].email;
      
      // Update all team profiles registered under this leader
      const teams = await Team.find({ "memberDetails.0.email": leaderEmail });
      
      const hashedPassword = await hashPassword(password);

      for (let team of teams) {
        team.password = hashedPassword;
        team.passwordResetToken = null;
        team.passwordResetExpires = null;
        await team.save();
      }

      return NextResponse.json({ success: true, message: "Passphrase has been reset successfully." });
    }

    return NextResponse.json({ success: false, error: "Invalid or expired reset token" }, { status: 400 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
