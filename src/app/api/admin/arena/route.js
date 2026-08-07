import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ArenaStatus from '@/models/ArenaStatus';
import { verifyToken } from '@/lib/auth';
import { cookies } from "next/headers";
import { eventsData } from '@/data/events';

const DEFAULT_CHECKLIST = [
  { item: "Power & Electronics Setup", isReady: false },
  { item: "Safety Barriers Secured", isReady: false },
  { item: "Scoring System Online", isReady: false },
  { item: "Judges Panel Ready", isReady: false },
  { item: "Emergency Protocols Verified", isReady: false }
];

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Ensure all events exist in the database
    for (let event of eventsData) {
      const exists = await ArenaStatus.findOne({ eventId: event.id });
      if (!exists) {
        await ArenaStatus.create({
          eventId: event.id,
          status: 'RED',
          checklist: DEFAULT_CHECKLIST
        });
      }
    }

    const arenas = await ArenaStatus.find({});
    return NextResponse.json({ success: true, arenas });
  } catch (error) {
    console.error('Fetch arenas error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch arenas' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 });

    await connectToDatabase();
    
    const { eventId, itemId, isReady } = await req.json();

    if (!eventId || !itemId) {
      return NextResponse.json({ success: false, error: 'Event ID and Item ID are required' }, { status: 400 });
    }

    const arena = await ArenaStatus.findOne({ eventId });
    if (!arena) {
      return NextResponse.json({ success: false, error: 'Arena not found' }, { status: 404 });
    }

    const itemIndex = arena.checklist.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return NextResponse.json({ success: false, error: 'Checklist item not found' }, { status: 404 });
    }

    arena.checklist[itemIndex].isReady = isReady;

    // Recalculate status
    const readyCount = arena.checklist.filter(i => i.isReady).length;
    const totalCount = arena.checklist.length;
    
    if (readyCount === 0) arena.status = 'RED';
    else if (readyCount === totalCount) arena.status = 'GREEN';
    else arena.status = 'AMBER';

    await arena.save();

    // Broadcast to War Room via Pusher
    try {
      const { pusherServer } = await import("@/lib/pusherServer");
      await pusherServer.trigger('god-mode-channel', 'arena-update', {
        eventId: arena.eventId,
        status: arena.status,
        checklist: arena.checklist
      });
    } catch (e) {
      console.warn("Pusher arena trigger failed:", e.message);
    }

    return NextResponse.json({ success: true, arena });
  } catch (error) {
    console.error('Update arena error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update arena' }, { status: 500 });
  }
}
