import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SystemConfig from "@/models/SystemConfig";
import { pusherServer } from "@/lib/pusherServer";

export async function GET() {
  try {
    await connectToDatabase();
    
    let config = await SystemConfig.findOne({ configId: "global" });
    if (!config) {
      config = await SystemConfig.create({ configId: "global", isLockdown: false });
    }
    
    return NextResponse.json({ success: true, messages: config.commsMessages || [] });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch comms messages", details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const payload = await req.json();

    if (!payload.text) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const newMessage = {
      id: Date.now().toString(),
      text: payload.text,
      sender: payload.sender || "HQ",
      timestamp: new Date().toISOString()
    };

    const config = await SystemConfig.findOneAndUpdate(
      { configId: "global" },
      { $push: { commsMessages: newMessage } },
      { new: true, upsert: true }
    );

    try {
      await pusherServer.trigger("god-mode-channel", "comms-broadcast", newMessage);
    } catch (e) {
      console.error("Pusher trigger failed:", e);
    }

    return NextResponse.json({ success: true, messages: config.commsMessages });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to send comms message", details: error.message }, { status: 500 });
  }
}
