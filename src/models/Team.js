import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const TeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  event: { type: String, required: true, default: "Robo Race" }, // Default for backward compatibility
  institution: { type: String, required: true },
  password: { type: String, required: true }, // Should be hashed in prod
  members: { type: Number, required: true },
  status: { type: String, enum: ["UNPAID", "PENDING", "VERIFIED", "FAILED", "DISQUALIFIED"], default: "UNPAID" },
  amountPaid: { type: Number, default: 0 },
  screenshot: { type: String, default: null }, // URL or filename of screenshot
  screenshotHash: { type: String, default: null }, // File signature hash to detect duplicates
  receiptNumber: { type: String, default: null }, // Feature 5: Auto-generated GST receipt
  utr: { type: String, default: null }, // 12-digit UPI reference
  isPresent: { type: Boolean, default: false }, // For QR Scanner on-site check-in
  hasHackedMainframe: { type: Boolean, default: false }, // CTF Easter Egg tracking
  hackedAt: { type: Date, default: null }, // Timestamp for CTF completion
  date: { type: Date, default: Date.now },
  // Email Verification & Password Reset & 2FA Fields
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorCode: { type: String, default: null },
  twoFactorExpires: { type: Date, default: null },
  memberDetails: [
    {
      role: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    }
  ],
  runs: [
    {
      attemptNumber: { type: Number, required: true },
      driverName: { type: String, default: "" },
      initialTime: { type: Number, required: true },      // in seconds
      offTracks: { type: Number, default: 0 },            // +10s penalty each
      handTouches: { type: Number, default: 0 },          // +30s penalty each
      skips: { type: Number, default: 0 },                // +45s penalty each (max 2)
      penaltyTime: { type: Number, default: 0 },          // offTracks*10 + handTouches*30 + skips*45
      totalTime: { type: Number, required: true },        // initial + penalty
      status: { type: String, enum: ["QUALIFIED", "DISQUALIFIED"], default: "QUALIFIED" },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});


TeamSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  // If it's already a bcrypt hash, do not hash it again
  if (/^\$2[ayb]\$.{56}$/.test(this.password)) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Delete the cached model so Next.js HMR compiles the new schema with 'event'
if (mongoose.models.Team) {
  delete mongoose.models.Team;
}

export default mongoose.model("Team", TeamSchema);
