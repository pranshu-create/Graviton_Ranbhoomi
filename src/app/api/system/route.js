import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SystemConfig from "@/models/SystemConfig";
import { pusherServer } from "@/lib/pusherServer";

const DEFAULT_MAP_NODES = [
  { id: 'arena', label: 'MAIN ARENA', x: '50%', y: '40%', status: 'ONLINE', desc: 'Robo Wars & Heavy Combat Zone', color: 'neon-cyan' },
  { id: 'arena2', label: 'SECONDARY ARENA', x: '80%', y: '20%', status: 'STANDBY', desc: 'Line Follower & Maze', color: 'red-500' },
  { id: 'track', label: 'RACE TRACK', x: '25%', y: '60%', status: 'ONLINE', desc: 'High-Speed Robo Race Course', color: 'electric-purple' },
  { id: 'soccer', label: 'SOCCER FIELD', x: '75%', y: '55%', status: 'STANDBY', desc: 'Robo Soccer Tournament Grounds', color: 'blue-500' },
  { id: 'hq', label: 'REGISTRATION HQ', x: '50%', y: '80%', status: 'ACTIVE', desc: 'Check-in and Technical Support', color: 'green-500' },
  { id: 'vault', label: 'RESOURCE VAULT', x: '20%', y: '30%', status: 'RESTRICTED', desc: 'Component Store & Power Station', color: 'yellow-500' }
];

export async function GET() {
  try {
    await connectToDatabase();
    
    // Find the global config, or create one if it doesn't exist
    let config = await SystemConfig.findOne({ configId: "global" });
    if (!config) {
      config = await SystemConfig.create({ configId: "global", isLockdown: false, mapNodes: DEFAULT_MAP_NODES });
    } else {
      let updated = false;
      if (!config.mapNodes || config.mapNodes.length === 0) {
        config.mapNodes = DEFAULT_MAP_NODES;
        updated = true;
      }
      if (!config.schedule || !config.schedule.day1 || !config.schedule.day2) {
        config.schedule = {
          day1: [
            { time: "08:30 AM - 10:00 AM", phase: "PHASE-01", title: "REGISTRATION & GATEWAY CLEARANCE", desc: "Check-in, QR clearance, technical weight inspection, and safety sign-offs.", location: "Registration HQ", color: "green-500" },
            { time: "10:00 AM - 11:00 AM", phase: "PHASE-02", title: "ARENA INITIATION: OPENING CEREMONY", desc: "Grand commencement protocol, official address, and trophy showcase.", location: "Main Arena Stage", color: "blue-500" },
            { time: "11:00 AM - 01:30 PM", phase: "PHASE-03", title: "ROBO SOCCER PRELIMINARIES // BATCH A", desc: "Head-to-head group matches kick off.", location: "Soccer Field", color: "cyan-500" },
            { time: "01:30 PM - 02:30 PM", phase: "PHASE-04", title: "HQ MID-DAY MAINTENANCE // REFUEL", desc: "Technical diagnostic checks, lithium battery charging, and lunch.", location: "Dining Area", color: "yellow-500" },
            { time: "02:30 PM - 04:30 PM", phase: "PHASE-05", title: "ROBO RACE TELEMETRY // SPEED TRIALS", desc: "Autonomous/RC high-speed speed runs, Attempts 1 & 2.", location: "Speedway Track", color: "purple-500" },
            { time: "04:30 PM - 06:30 PM", phase: "PHASE-06", title: "ROBO SUMO COMBAT // HEAVYWEIGHT 1V1", desc: "Push-out torque matches.", location: "Combat Ring", color: "red-500" },
            { time: "06:30 PM - 08:30 PM", phase: "PHASE-07", title: "MAINFRAME CYBER SECURITY HACKATHON", desc: "CTF challenges open.", location: "Tech Lab", color: "indigo-500" }
          ],
          day2: [
            { time: "09:00 AM - 10:30 AM", phase: "PHASE-08", title: "LINE FOLLOWER TRIALS // ACCURACY RUNS", desc: "Calibration runs and autonomous tracking attempts.", location: "Secondary Track", color: "green-500" },
            { time: "10:30 AM - 01:00 PM", phase: "PHASE-09", title: "ROBO SOCCER & SUMO PLAYOFFS", desc: "Quarter & Semi-final brackets advance.", location: "Soccer & Combat Rings", color: "cyan-500" },
            { time: "01:00 PM - 02:00 PM", phase: "PHASE-10", title: "HQ LUNCH INTERVAL & CALIBRATION", desc: "System checkouts and battery swaps.", location: "HQ Lounge", color: "yellow-500" },
            { time: "02:00 PM - 04:00 PM", phase: "PHASE-11", title: "FINALS PROPAGATION: CHAMPIONSHIPS", desc: "Grand finals of all combat and speed events.", location: "Main Arena", color: "purple-500" },
            { time: "04:00 PM - 05:00 PM", phase: "PHASE-12", title: "MAINFRAME HACKATHON FINAL RESOLUTION", desc: "CTF submissions close and results frozen.", location: "Tech Lab", color: "indigo-500" },
            { time: "05:00 PM - 06:30 PM", phase: "PHASE-13", title: "AWARDS PROPAGATION & CLOSING CEREMONY", desc: "Distribution of ₹85,000+ bounty pool, trophy distribution, and closing remarks.", location: "Main Arena Stage", color: "red-500" }
          ]
        };
        updated = true;
      }
      if (updated) {
        await config.save();
      }
    }
    
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch system config", details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const payload = await req.json();

    // Build the update object dynamically based on what was provided
    const updateFields = {};
    if (payload.isLockdown !== undefined) updateFields.isLockdown = payload.isLockdown;
    if (payload.isMaintenanceMode !== undefined) updateFields.isMaintenanceMode = payload.isMaintenanceMode;
    if (payload.frozenEvents !== undefined) updateFields.frozenEvents = payload.frozenEvents;
    if (payload.globalMessage !== undefined) updateFields.globalMessage = payload.globalMessage;
    if (payload.mapNodes !== undefined) updateFields.mapNodes = payload.mapNodes;
    if (payload.brackets !== undefined) updateFields.brackets = payload.brackets;
    if (payload.showRaceLeaderboard !== undefined) updateFields.showRaceLeaderboard = payload.showRaceLeaderboard;
    if (payload.schedule !== undefined) updateFields.schedule = payload.schedule;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "Invalid payload. No valid fields provided." }, { status: 400 });
    }

    // Update the global config
    const config = await SystemConfig.findOneAndUpdate(
      { configId: "global" },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    try {
      await pusherServer.trigger("god-mode-channel", "system-update", config);
    } catch (e) {
      console.error("Pusher trigger failed:", e);
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to update system config", details: error.message }, { status: 500 });
  }
}
