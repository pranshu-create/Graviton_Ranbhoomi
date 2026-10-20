import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";

export async function DELETE(req) {
  try {
    const role = req.headers.get('x-admin-role');
    
    // Ensure only high-level admins can eradicate data
    if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      return NextResponse.json({ success: false, error: "Unauthorized. Insufficient clearance." }, { status: 403 });
    }

    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json({ success: false, error: "Missing teamId" }, { status: 400 });
    }

    await connectToDatabase();

    // Eradicate the team using the custom teamId ('id' in frontend mapped to 'teamId' or 'id' in schema)
    // The schema has `id` for custom T-00X string.
    const deletedTeam = await Team.findOneAndDelete({ $or: [{ id: teamId }, { teamId: teamId }] });

    if (!deletedTeam) {
      return NextResponse.json({ success: false, error: "Operative not found in database." }, { status: 404 });
    }

    // Eradicate corresponding accommodation requests
    try {
      const { default: Accommodation } = await import("@/models/Accommodation");
      await Accommodation.deleteMany({ teamId: deletedTeam.teamId });
    } catch (accErr) {
      console.warn("Accommodation eradication cleanup notice:", accErr);
    }

    // Broadcast eradication to immediately purge active client sessions
    try {
      const { pusherServer } = await import("@/lib/pusherServer");
      await pusherServer.trigger("god-mode-channel", "team-eradicated", {
        teamId: deletedTeam.teamId,
        leaderEmail: deletedTeam.memberDetails?.[0]?.email
      });
    } catch (pushErr) {
      console.warn("Pusher eradication trigger failed:", pushErr);
    }

    return NextResponse.json({ success: true, message: "Operative data eradicated permanently." });
  } catch (error) {
    console.error("Eradication Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error during eradication." }, { status: 500 });
  }
}
