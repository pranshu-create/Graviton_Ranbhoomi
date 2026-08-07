import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

export async function GET(req) {
  // Middleware already verifies the token and sets headers
  const email = req.headers.get('x-admin-email');
  const role = req.headers.get('x-admin-role');
  
  if (!email || !role) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  await connectToDatabase();
  const user = await AdminUser.findOne({ email });
  
  return NextResponse.json({ 
    success: true, 
    user: { email, role, name: user?.name || email.split('@')[0], assignedEvent: user?.assignedEvent } 
  });
}
