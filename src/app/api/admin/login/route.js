import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import Log from '@/models/Log';
import { verifyPassword, signToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req) {
  try {
    // Basic IP tracking for Rate Limit (fallback to x-forwarded-for if behind proxy)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = await checkRateLimit(ip);
    
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const admin = await AdminUser.findOne({ email });
    
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.password);
    
    if (!isValid) {
      // Optional: log failed attempt
      await Log.create({
        action: 'FAILED_LOGIN',
        adminEmail: email,
        details: `Failed login attempt from IP: ${ip}`,
        ipAddress: ip
      });
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if Two-Factor Authentication is active for Admin
    if (admin.twoFactorEnabled) {
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      const twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      admin.twoFactorCode = twoFactorCode;
      admin.twoFactorExpires = twoFactorExpires;
      await admin.save();

      // Dispatch 2FA code
      const { send2FAEmail } = await import("@/lib/email");
      try {
        await send2FAEmail(admin.email, admin.name, twoFactorCode);
      } catch (err) {
        console.error("Admin 2FA Email sending failed:", err);
      }

      await Log.create({
        action: 'PENDING_2FA',
        adminEmail: email,
        details: 'Admin login pending Two-Factor Verification',
        ipAddress: ip
      });

      return NextResponse.json({ 
        success: true, 
        requires2FA: true, 
        userEmail: admin.email 
      });
    }

    // Sign JWT
    const token = await signToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      name: admin.name
    });

    // Set cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { name: admin.name, email: admin.email, role: admin.role } 
    });
    
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    await Log.create({
      action: 'LOGIN',
      adminEmail: email,
      details: 'Admin logged in',
      ipAddress: ip
    });

    return response;
  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
