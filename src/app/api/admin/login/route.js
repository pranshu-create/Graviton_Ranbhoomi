import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import Log from '@/models/Log';
import { verifyPassword, signToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import fs from 'fs';
import path from 'path';

// Helper to write system log to mock DB
async function writeMockLog(action, adminEmail, details, ip) {
  try {
    const dbPath = path.resolve(process.cwd(), 'db_mock.json');
    let dbData = {};
    if (fs.existsSync(dbPath)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        dbData = {};
      }
    }
    if (!dbData.logs) dbData.logs = [];
    dbData.logs.push({
      _id: Math.random().toString(36).substring(2, 9),
      action,
      adminEmail,
      details,
      ipAddress: ip,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write mock log:", err);
  }
}

export async function POST(req) {
  try {
    // Basic IP tracking for Rate Limit
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    let rateCheck = { success: true };
    if (!global.isDbMocked) {
      rateCheck = await checkRateLimit(ip);
    }
    
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    let admin = null;
    let isMock = false;

    try {
      await connectToDatabase();
      if (global.isDbMocked) {
        throw new Error("DB is mocked");
      }
      admin = await AdminUser.findOne({ email });
    } catch (dbError) {
      console.warn("Using local JSON database fallback for Admin login lookup.");
      isMock = true;
      const dbPath = path.resolve(process.cwd(), 'db_mock.json');
      let dbData = {};
      if (fs.existsSync(dbPath)) {
        try {
          dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (e) {}
      }
      const mockAdmins = dbData.adminusers || [];
      const matched = mockAdmins.find(u => u.email === email);
      if (matched) {
        // Clone object and add a mock .save() method
        admin = {
          ...matched,
          save: async function() {
            const idx = dbData.adminusers.findIndex(u => u.email === email);
            if (idx !== -1) {
              dbData.adminusers[idx] = {
                _id: this._id,
                name: this.name,
                email: this.email,
                password: this.password,
                role: this.role,
                twoFactorEnabled: this.twoFactorEnabled,
                twoFactorCode: this.twoFactorCode,
                twoFactorExpires: this.twoFactorExpires
              };
              fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
            }
            return this;
          }
        };
      }
    }
    
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.password);
    
    if (!isValid) {
      if (isMock) {
        await writeMockLog('FAILED_LOGIN', email, `Failed login attempt from IP: ${ip}`, ip);
      } else {
        await Log.create({
          action: 'FAILED_LOGIN',
          adminEmail: email,
          details: `Failed login attempt from IP: ${ip}`,
          ipAddress: ip
        });
      }
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

      if (isMock) {
        await writeMockLog('PENDING_2FA', email, 'Admin login pending Two-Factor Verification', ip);
      } else {
        await Log.create({
          action: 'PENDING_2FA',
          adminEmail: email,
          details: 'Admin login pending Two-Factor Verification',
          ipAddress: ip
        });
      }

      return NextResponse.json({ 
        success: true, 
        requires2FA: true, 
        userEmail: admin.email 
      });
    }

    // Sign JWT
    const token = await signToken({
      id: admin._id ? admin._id.toString() : 'mock-id',
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
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });
    
    if (isMock) {
      await writeMockLog('LOGIN', email, 'Admin logged in', ip);
    } else {
      await Log.create({
        action: 'LOGIN',
        adminEmail: email,
        details: 'Admin logged in',
        ipAddress: ip
      });
    }

    return response;
  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
