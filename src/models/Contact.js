import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "RESOLVED"], default: "PENDING" },
  ipAddress: { type: String, default: null },
}, { timestamps: true });

if (mongoose.models.Contact) {
  delete mongoose.models.Contact;
}

export default mongoose.model("Contact", ContactSchema);
