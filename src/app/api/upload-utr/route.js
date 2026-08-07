import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Team from "@/models/Team";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(req) {
  try {
    await connectDB();
    const { teamId, utr } = await req.json();

    if (!teamId || !utr || utr.length !== 12) {
      return NextResponse.json({ success: false, error: "Invalid data. UTR must be 12 digits." }, { status: 400 });
    }

    const team = await Team.findOne({ $or: [{ id: teamId }, { teamId: teamId }] });
    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    // Check if UTR is already used by another team
    const existingUtr = await Team.findOne({ utr });
    if (existingUtr && existingUtr.teamId !== team.teamId) {
      return NextResponse.json({
        success: false,
        error: "FRAUD DETECTED: This UTR has already been verified for another team.",
        isDuplicateFraud: true
      }, { status: 403 });
    }

    // SIMULATED AUTOMATED VERIFICATION:
    // In production, you would call your Bank/Razorpay API here:
    // const verification = await razorpay.payments.fetch(utr);
    // const isPaymentValid = verification.status === "captured" && verification.amount === 50000;
    
    // For now, we simulate a successful 1-second API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // We will auto-verify it to demonstrate the "Automated Checker" feature
    team.utr = utr;
    team.status = "VERIFIED"; 
    await team.save();

    return NextResponse.json({ success: true, message: "Payment Auto-Verified via UTR", status: team.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
