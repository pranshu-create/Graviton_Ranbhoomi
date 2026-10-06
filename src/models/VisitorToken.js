import mongoose from "mongoose";

const visitorTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  ip: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24h
});

export default mongoose.models.VisitorToken || mongoose.model("VisitorToken", visitorTokenSchema);
