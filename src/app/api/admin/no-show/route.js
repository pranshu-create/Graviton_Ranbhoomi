import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Team from '@/models/Team';
import { transporter, cleanSenderEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const role = req.headers.get('x-admin-role');
    if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    await connectToDatabase();

    // Find verified teams that haven't checked in yet
    const missingTeams = await Team.find({ status: 'VERIFIED', isPresent: false });

    if (missingTeams.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "All verified teams are marked present." });
    }

    if (!cleanSenderEmail || !transporter) {
      return NextResponse.json({ success: false, error: 'Email configuration is missing or invalid' }, { status: 500 });
    }

    let sentCount = 0;
    for (const team of missingTeams) {
      const leaderEmail = team.memberDetails?.find(m => m.role === 'Leader')?.email;
      if (!leaderEmail) continue;

      const htmlContent = `
        <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background-color: #02050A; color: #fff; padding: 20px; border: 1px solid #ffaa00;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ffaa00; padding-bottom: 10px;">
            <h1 style="color: #ffaa00; margin: 0; letter-spacing: 2px;">HQ ALERT: MISSING IN ACTION</h1>
          </div>
          <div style="color: #eee; font-size: 14px; line-height: 1.6;">
            <p>Squad: <strong>${team.name}</strong></p>
            <p>Event: <strong>${team.event}</strong></p>
            <br/>
            <p>Your team is registered and verified, but our scanners indicate you have not yet reported to the Main Gates.</p>
            <p>If you are on campus, please report immediately to the Registration Desk.</p>
            <p>Failure to report will result in disqualification (Walkover).</p>
          </div>
          <div style="margin-top: 30px; border-top: 1px dashed #333; padding-top: 10px; font-size: 10px; color: #666; text-align: center;">
            <p>GRAVITON ROBOTICS | RANBHOOMI 2.0</p>
          </div>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"RANBHOOMI HQ" <${cleanSenderEmail}>`,
          to: leaderEmail,
          subject: "URGENT: Missing In Action - RANBHOOMI 3.0",
          html: htmlContent,
        });
        sentCount++;
        await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        console.error(`Failed to send no-show alert to ${leaderEmail}:`, err);
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (error) {
    console.error('No-show API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process no-show alerts' }, { status: 500 });
  }
}
