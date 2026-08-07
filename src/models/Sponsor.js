import mongoose from "mongoose";

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tier: { type: String, enum: ["PLATINUM", "GOLD", "SILVER", "PARTNER"], default: "PARTNER" },
  logoUrl: { type: String, required: true },
  websiteUrl: { type: String },
  amountInvested: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Sponsor || mongoose.model("Sponsor", sponsorSchema);
