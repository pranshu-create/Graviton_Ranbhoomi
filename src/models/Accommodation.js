import mongoose from "mongoose";

const AccommodationSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  memberName: { type: String, required: true },
  memberEmail: { type: String, required: true },
  gender: { type: String, enum: ["BOYS", "GIRLS"], required: true },
  age: { type: Number, default: null },
  status: { type: String, enum: ["PENDING", "FORM_SENT", "DOCS_SUBMITTED", "APPROVED", "REJECTED"], default: "PENDING" },
  roomNumber: { type: String, default: null },
  idProofUrl: { type: String, default: null },
  arrivalDateTime: { type: Date, default: null },
  departureDateTime: { type: Date, default: null },
  emergencyContactName: { type: String, default: null },
  emergencyContactPhone: { type: String, default: null },
  token: { type: String, default: null },
  isCheckedIn: { type: Boolean, default: false },
  checkInTime: { type: Date, default: null },
  checkOutTime: { type: Date, default: null },
  history: [
    {
      action: { type: String, enum: ["IN", "OUT"] },
      timestamp: { type: Date, default: Date.now },
      scannedBy: { type: String } // Email of Hostel Authority/Admin who scanned
    }
  ],
  qrCodeId: { type: String, required: true, unique: true } // Unique ID for their QR code
}, { timestamps: true });

if (mongoose.models.Accommodation) {
  delete mongoose.models.Accommodation;
}

export default mongoose.model("Accommodation", AccommodationSchema);
