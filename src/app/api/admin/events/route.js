import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Event from '@/models/Event';
import Log from '@/models/Log';

export async function GET(req) {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, events });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const adminEmail = req.headers.get('x-admin-email');
    const role = req.headers.get('x-admin-role');
    
    if (role === 'VOLUNTEER') {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const body = await req.json();
    const newEvent = await Event.create(body);
    
    await Log.create({
      action: 'CREATE_EVENT',
      adminEmail: adminEmail || 'SYSTEM',
      targetId: newEvent._id.toString(),
      details: `Created new event: ${newEvent.name}`
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(req) {
    try {
      await connectToDatabase();
      const adminEmail = req.headers.get('x-admin-email');
      const role = req.headers.get('x-admin-role');
      
      if (role === 'VOLUNTEER') {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
      }
  
      const { id, ...updateData } = await req.json();
      
      const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });
      
      await Log.create({
        action: 'UPDATE_EVENT',
        adminEmail: adminEmail || 'SYSTEM',
        targetId: id,
        details: `Updated event: ${updatedEvent.name}`
      });
  
      return NextResponse.json({ success: true, event: updatedEvent });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectToDatabase();
        const adminEmail = req.headers.get('x-admin-email');
        const role = req.headers.get('x-admin-role');
        
        if (role === 'VOLUNTEER') {
            return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
        }
        
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
        }

        const deletedEvent = await Event.findByIdAndDelete(id);
        
        if (deletedEvent) {
            await Log.create({
                action: 'DELETE_EVENT',
                adminEmail: adminEmail || 'SYSTEM',
                targetId: id,
                details: `Deleted event: ${deletedEvent.name}`
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
    }
}

