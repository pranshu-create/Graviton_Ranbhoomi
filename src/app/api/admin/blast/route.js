import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Team from '@/models/Team';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const role = req.headers.get('x-admin-role');
    
    // Only allow SUPER_ADMIN and ADMIN
    if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const { subject, message, target, event } = await req.json();

    if (!subject || !message || !target) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Query teams based on target
    let query = {};
    if (target === 'ALL_VERIFIED') {
      query.status = 'VERIFIED';
    } else if (target === 'ALL_REGISTERED') {
      // no filter on status
    } else if (target === 'SPECIFIC_EVENT') {
      if (!event) return NextResponse.json({ success: false, error: 'Event name required for SPECIFIC_EVENT target' }, { status: 400 });
      query.event = { $regex: new RegExp(`^${event}$`, 'i') };
      query.status = 'VERIFIED';
    }

    const teams = await Team.find(query);
    
    // Extract unique leader emails
    const leaderEmails = new Set();
    teams.forEach(team => {
      const leader = team.memberDetails?.find(m => m.role === 'Leader');
      if (leader && leader.email) {
        leaderEmails.add(leader.email);
      }
    });

    const emails = Array.from(leaderEmails);
    if (emails.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No operatives found matching criteria." });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const htmlContent = `
      <div style="font-family: 'Courier New', Courier, monospace; background-color: #02050A; color: #ffffff; padding: 0; margin: 0; width: 100%; max-width: 600px; margin: auto; border: 1px solid #66FCF1;">
        <div style="background-color: #102A30; padding: 20px; text-align: center; border-bottom: 2px solid #66FCF1;">
          <p style="color: #66FCF1; font-size: 12px; letter-spacing: 4px; margin: 0;">SYSTEM.AUTH // CLEARANCE: GRANTED</p>
          <h1 style="color: #ffffff; letter-spacing: 2px; margin: 10px 0 0 0;">RANBHOOMI '26</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #B829EA; text-transform: uppercase;">TRANSMISSION: ${subject}</h2>
          <div style="color: #cccccc; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-top: 20px;">
${message}
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #333333; text-align: center;">
            <p style="color: #555555; font-size: 11px;">This is an automated transmission from RANBHOOMI HQ.<br/>Do not reply directly to this terminal.</p>
          </div>
        </div>
      </div>
    `;

    // Send emails sequentially with a small delay to avoid rate limits
    let sentCount = 0;
    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: `"RANBHOOMI HQ" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: subject,
          html: htmlContent,
        });
        sentCount++;
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err);
      }
    }

    return NextResponse.json({ success: true, sent: sentCount, total: emails.length });
  } catch (error) {
    console.error('Blast API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to dispatch blast' }, { status: 500 });
  }
}
