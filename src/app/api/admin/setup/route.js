import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { hashPassword } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Check if Pranshu already exists
    const existingAdmin = await AdminUser.findOne({ email: 'pranshu@graviton.in' });
    
    if (existingAdmin) {
      return NextResponse.json({ success: true, message: 'Super Admin already exists.' });
    }
    
    const hashedPassword = await hashPassword('Pranshu@671'); // Default initial password
    
    await AdminUser.create({
      name: 'Pranshu',
      email: 'pranshu@graviton.in',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    });
    
    return NextResponse.json({ success: true, message: 'Super Admin Pranshu created successfully!' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to run setup', details: error.message }, { status: 500 });
  }
}
