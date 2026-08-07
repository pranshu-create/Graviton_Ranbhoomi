import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Find one team where the user is a member and update
    const result = await Team.updateOne(
      { "memberDetails.email": email, hasHackedMainframe: { $ne: true } },
      { 
        $set: { 
          hasHackedMainframe: true,
          hackedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) {
    console.error("CTF Complete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
