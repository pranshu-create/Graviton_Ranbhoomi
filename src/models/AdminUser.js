import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ["SUPER_ADMIN", "ADMIN", "VOLUNTEER", "HOSTEL_STAFF", "BOYS_HOSTEL_SECURITY", "GIRLS_HOSTEL_SECURITY", "HOSTEL_AUTHORITY"],
    default: "VOLUNTEER" 
  },
  assignedEvent: { type: String, default: null },
  // Password Reset & 2FA Fields
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorCode: { type: String, default: null },
  twoFactorExpires: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
