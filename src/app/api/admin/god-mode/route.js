import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SystemConfig from "@/models/SystemConfig";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Only SUPER_ADMIN can trigger God Mode" }, { status: 403 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const { type, payload } = await req.json();

    // Trigger Pusher Live Event
    try {
      const { pusherServer } = await import("@/lib/pusherServer");
      await pusherServer.trigger('god-mode-channel', 'god-mode-event', {
        type,
        payload,
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn("Pusher trigger failed (missing keys?):", e.message);
    }

    const config = await SystemConfig.findOneAndUpdate(
      { configId: "global" },
      { 
        godModeEvent: {
          type,
          payload,
          timestamp: Date.now()
        }
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, message: "God Mode Event Triggered", event: config.godModeEvent });
  } catch (error) {
    console.error("God Mode Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
