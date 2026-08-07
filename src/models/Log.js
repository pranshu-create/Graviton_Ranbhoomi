import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  adminEmail: { type: String, required: true },
  targetId: { type: String },
  details: { type: String },
  ipAddress: { type: String },
}, { timestamps: true });

export default mongoose.models.Log || mongoose.model("Log", logSchema);
