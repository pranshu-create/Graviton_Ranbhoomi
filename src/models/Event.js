import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortDescription: { type: String },
  description: { type: String },
  rules: { type: String },
  fees: { type: String },
  teamSizeMin: { type: Number, default: 1 },
  teamSizeMax: { type: Number, default: 4 },
  prize: { type: String },
  date: { type: Date },
  status: { type: String, enum: ["UPCOMING", "ONGOING", "COMPLETED"], default: "UPCOMING" }
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
