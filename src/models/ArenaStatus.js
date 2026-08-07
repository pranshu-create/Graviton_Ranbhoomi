import mongoose from "mongoose";

const checkListItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  isReady: { type: Boolean, default: false }
});

const arenaStatusSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["RED", "AMBER", "GREEN"], default: "RED" },
  checklist: [checkListItemSchema]
}, { timestamps: true });

export default mongoose.models.ArenaStatus || mongoose.model("ArenaStatus", arenaStatusSchema);
