import mongoose from "mongoose";

const SystemConfigSchema = new mongoose.Schema({
  // We use a constant string ID so there's always only one config document
  configId: { type: String, required: true, unique: true, default: "global" },
  isLockdown: { type: Boolean, default: false },
  isMaintenanceMode: { type: Boolean, default: false },
  vaultPassword: { type: String, default: "GRAVITON_2026" },
  globalMessage: { type: String, default: "" },
  frozenEvents: { type: [String], default: [] },
  commsMessages: { type: [Object], default: [] }, // Array of { id, text, timestamp, sender }
  mapNodes: { type: [Object], default: [] },
  godModeEvent: { 
    type: Object, 
    default: { type: null, payload: null, timestamp: null } 
  },
  brackets: {
    type: Object,
    default: {
      "Robo Soccer": { pdfUrl: "", matches: [] },
      "Robo Sumo": { pdfUrl: "", matches: [] },
      "Robo Race": { pdfUrl: "" },
      "Line Follower": { pdfUrl: "" }
    }
  },
  showRaceLeaderboard: { type: Boolean, default: false },
  schedule: {
    type: Object,
    default: {
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
    }
  }
});

// Delete the cached model so Next.js HMR compiles the new schema
if (mongoose.models.SystemConfig) {
  delete mongoose.models.SystemConfig;
}

export default mongoose.model("SystemConfig", SystemConfigSchema);
