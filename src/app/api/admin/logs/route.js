import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Log from '@/models/Log';

export async function GET(req) {
  try {
    await connectToDatabase();
    // Only Super Admins and Admins should see logs
    const role = req.headers.get('x-admin-role');
    if (role === 'VOLUNTEER') {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }
    
    // Fetch latest 100 logs
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Fetch logs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch logs' }, { status: 500 });
  }
}
