import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Accommodation from "@/models/Accommodation";
import { pusherServer } from "@/lib/pusherServer";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { qrCodeId, scannedByEmail, actionType } = body; // actionType: "IN" or "OUT"

    if (!qrCodeId || !scannedByEmail || !actionType) {
      return NextResponse.json({ success: false, error: "Missing scanner data" }, { status: 400 });
    }

    const accommodation = await Accommodation.findOne({ qrCodeId });

    if (!accommodation) {
      return NextResponse.json({ success: false, error: "Invalid QR Code" }, { status: 404 });
    }

    if (accommodation.status !== "APPROVED") {
      return NextResponse.json({ success: false, error: "Accommodation not approved for this participant." }, { status: 403 });
    }

    if (accommodation.isCheckedIn) {
      return NextResponse.json({ 
        success: true, 
        message: "ALREADY EQUIPPED", 
        data: accommodation, 
        rules: [] 
      });
    }

    // Determine state change
    const isCheckedIn = actionType === "IN";
    
    const historyEntry = {
      action: actionType,
      timestamp: new Date(),
      scannedBy: scannedByEmail
    };

    const updateData = {
      isCheckedIn,
      $push: { history: historyEntry }
    };

    if (actionType === "IN") {
      updateData.checkInTime = new Date();
    } else {
      updateData.checkOutTime = new Date();
    }

    const updated = await Accommodation.findOneAndUpdate(
      { qrCodeId },
      updateData,
      { new: true }
    );

    // Broadcast allocation to all active dashboards
    try {
      await pusherServer.trigger("god-mode-channel", "hostel-allocation", updated);
    } catch (e) {
      console.error("Pusher trigger failed:", e);
    }

    const rules = actionType === "IN" ? [
      "1. Strict Entry before 9:00 PM.",
      "2. Do not touch any cupboard or unauthorized belongings.",
      "3. Maintain silence in the corridors.",
      "4. Outsiders are strictly prohibited in the rooms."
    ] : [];

    return NextResponse.json({ 
      success: true, 
      message: "ROOM ALLOCATED & EQUIPPED",
      data: updated,
      rules: rules
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
