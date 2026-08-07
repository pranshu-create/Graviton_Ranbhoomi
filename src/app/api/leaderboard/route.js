import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all teams, sorted by hackedAt ascending (fastest hackers first)
    const teams = await Team.find({}, { name: 1, event: 1, hasHackedMainframe: 1, hackedAt: 1, status: 1 })
      .sort({ hasHackedMainframe: -1, hackedAt: 1 })
      .lean();

    return NextResponse.json({ success: true, teams });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
