import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { hashPassword } from '@/lib/auth';

export async function GET(req) {
  try {
    // 1. In production, require SETUP_SECRET
    const setupSecret = process.env.SETUP_SECRET;
    const providedSecret = req.headers.get('x-setup-secret');
    if (process.env.NODE_ENV === 'production' && (!setupSecret || providedSecret !== setupSecret)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Endpoint is locked.' }, { status: 403 });
    }

    await connectToDatabase();
    
    // Check if any SUPER_ADMIN already exists
    const existingAdmin = await AdminUser.findOne({ role: 'SUPER_ADMIN' });
    
    if (existingAdmin) {
      return NextResponse.json({ success: false, error: 'Endpoint decommissioned. Administrative structure is already established.' }, { status: 404 });
    }
    
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Pranshu@671';
    const hashedPassword = await hashPassword(adminPassword);
    
    await AdminUser.create({
      name: 'Pranshu',
      email: 'pranshu@graviton.in',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    });
    
    return NextResponse.json({ success: true, message: 'Super Admin initialized successfully.' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ success: false, error: 'Setup failure' }, { status: 500 });
  }
}
