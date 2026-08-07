import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import SystemConfig from "@/models/SystemConfig";
import AdminUser from "@/models/AdminUser";
import { pusherServer } from "@/lib/pusherServer";

export async function POST(req) {
  try {
    const email = req.headers.get("x-admin-email");
    const role = req.headers.get("x-admin-role");

    if (!email || !role) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!["SUPER_ADMIN", "ADMIN", "VOLUNTEER"].includes(role)) {
      return NextResponse.json({ success: false, error: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    await connectToDatabase();
    const admin = await AdminUser.findOne({ email });

    const payload = await req.json();
    const { action } = payload;

    if (!action) {
      return NextResponse.json({ success: false, error: "Missing action" }, { status: 400 });
    }

    // Helper function to check volunteer clearance
    const verifyEventClearance = (event) => {
      if (role === "VOLUNTEER") {
        if (!admin?.assignedEvent || admin.assignedEvent.toLowerCase() !== event.toLowerCase()) {
          throw new Error(`Forbidden: You are not assigned to handle ${event}`);
        }
      }
    };

    if (action === "LOG_RUN") {
      const { teamId, driverName, attemptNumber, initialTime, offTracks, handTouches, skips } = payload;

      if (!teamId || attemptNumber === undefined || initialTime === undefined) {
        return NextResponse.json({ success: false, error: "Missing required run parameters" }, { status: 400 });
      }

      // Fetch team to get event name
      const team = await Team.findOne({ teamId });
      if (!team) {
        return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
      }

      try {
        verifyEventClearance(team.event);
      } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 403 });
      }

      const parsedOffTracks = parseInt(offTracks || 0);
      const parsedHandTouches = parseInt(handTouches || 0);
      const parsedSkips = parseInt(skips || 0);
      const parsedInitialTime = parseFloat(initialTime);

      // Calculations
      const penaltyTime = parsedOffTracks * 10 + parsedHandTouches * 30 + parsedSkips * 45;
      const totalTime = parsedInitialTime + penaltyTime;
      const runStatus = parsedSkips > 2 ? "DISQUALIFIED" : "QUALIFIED";

      const newRun = {
        attemptNumber: parseInt(attemptNumber),
        driverName: driverName || "",
        initialTime: parsedInitialTime,
        offTracks: parsedOffTracks,
        handTouches: parsedHandTouches,
        skips: parsedSkips,
        penaltyTime,
        totalTime,
        status: runStatus,
        timestamp: new Date(),
      };

      // Push run to team runs list
      team.runs.push(newRun);
      await team.save();

      // Trigger Pusher notification
      try {
        await pusherServer.trigger("god-mode-channel", "scoring-update", {
          type: "RUN_LOGGED",
          teamId,
          event: team.event,
        });
      } catch (e) {
        console.error("Pusher trigger failed:", e);
      }

      return NextResponse.json({ success: true, team });
    }

    if (action === "DELETE_RUN") {
      const { teamId, runId } = payload;

      if (!teamId || !runId) {
        return NextResponse.json({ success: false, error: "Missing teamId or runId" }, { status: 400 });
      }

      const team = await Team.findOne({ teamId });
      if (!team) {
        return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
      }

      try {
        verifyEventClearance(team.event);
      } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 403 });
      }

      team.runs = team.runs.filter((r) => r._id.toString() !== runId);
      await team.save();

      try {
        await pusherServer.trigger("god-mode-channel", "scoring-update", {
          type: "RUN_DELETED",
          teamId,
          event: team.event,
        });
      } catch (e) {
        console.error("Pusher trigger failed:", e);
      }

      return NextResponse.json({ success: true, team });
    }

    if (action === "LOG_MATCH") {
      const { event, matchId, round, team1, team2, penalties, winnerId, isLosersBracket, status } = payload;

      if (!event || !matchId || !round || !team1 || !team2) {
        return NextResponse.json({ success: false, error: "Missing required match parameters" }, { status: 400 });
      }

      try {
        verifyEventClearance(event);
      } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 403 });
      }

      let config = await SystemConfig.findOne({ configId: "global" });
      if (!config) {
        config = await SystemConfig.create({ configId: "global" });
      }

      if (!config.brackets) config.brackets = {};
      if (!config.brackets[event]) {
        config.brackets[event] = { pdfUrl: "", matches: [] };
      }

      const matches = config.brackets[event].matches || [];

      // Create or update match
      const updatedMatch = {
        matchId,
        round,
        team1: {
          id: team1.id,
          name: team1.name,
          goals: parseInt(team1.goals || 0),
          status: team1.status || "QUALIFIED",
        },
        team2: {
          id: team2.id,
          name: team2.name,
          goals: parseInt(team2.goals || 0),
          status: team2.status || "QUALIFIED",
        },
        penalties: penalties || "",
        winnerId: winnerId || "",
        isLosersBracket: !!isLosersBracket,
        status: status || "UPCOMING",
      };

      const existingIndex = matches.findIndex((m) => m.matchId === matchId);
      if (existingIndex > -1) {
        matches[existingIndex] = updatedMatch;
      } else {
        matches.push(updatedMatch);
      }

      config.brackets[event].matches = matches;
      config.markModified("brackets");
      await config.save();

      try {
        await pusherServer.trigger("god-mode-channel", "scoring-update", {
          type: "MATCH_LOGGED",
          event,
        });
      } catch (e) {
        console.error("Pusher trigger failed:", e);
      }

      return NextResponse.json({ success: true, config });
    }

    if (action === "UPDATE_BRACKET_PDF") {
      const { event, pdfUrl, imageUrl } = payload;

      if (!event) {
        return NextResponse.json({ success: false, error: "Missing event name" }, { status: 400 });
      }

      try {
        verifyEventClearance(event);
      } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 403 });
      }

      let config = await SystemConfig.findOne({ configId: "global" });
      if (!config) {
        config = await SystemConfig.create({ configId: "global" });
      }

      if (!config.brackets) config.brackets = {};
      if (!config.brackets[event]) {
        config.brackets[event] = { pdfUrl: "", matches: [] };
      }

      config.brackets[event].pdfUrl = pdfUrl || "";
      config.brackets[event].imageUrl = imageUrl || "";
      config.markModified("brackets");
      await config.save();

      try {
        await pusherServer.trigger("god-mode-channel", "scoring-update", {
          type: "PDF_UPDATED",
          event,
        });
      } catch (e) {
        console.error("Pusher trigger failed:", e);
      }

      return NextResponse.json({ success: true, config });
    }

    if (action === "DELETE_MATCH") {
      const { event, matchId } = payload;

      if (!event || !matchId) {
        return NextResponse.json({ success: false, error: "Missing event or matchId" }, { status: 400 });
      }

      try {
        verifyEventClearance(event);
      } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 403 });
      }

      let config = await SystemConfig.findOne({ configId: "global" });
      if (config && config.brackets && config.brackets[event]) {
        config.brackets[event].matches = (config.brackets[event].matches || []).filter((m) => m.matchId !== matchId);
        config.markModified("brackets");
        await config.save();
      }

      try {
        await pusherServer.trigger("god-mode-channel", "scoring-update", {
          type: "MATCH_DELETED",
          event,
        });
      } catch (e) {
        console.error("Pusher trigger failed:", e);
      }

      return NextResponse.json({ success: true, config });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Scoring Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
