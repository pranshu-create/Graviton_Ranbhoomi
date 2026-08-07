import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req) {
  try {
    const role = req.headers.get('x-admin-role');
    
    if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const { team } = await req.json();

    if (!team) {
      return NextResponse.json({ success: false, error: 'Team data is required' }, { status: 400 });
    }

    // Determine fraud flags
    let fraudFlags = "None";
    if (team.screenshotHash) {
      // It's hard to get global counts without querying DB, but we can report if it has a hash
      fraudFlags = "Screenshot Hash Present";
    }

    const prompt = `You are OVERWATCH, the AI administrator of a robotics competition. 
Summarize this team's status in one sentence. Be direct and use military tone. 
Name: ${team.name}
Event: ${team.event || 'UNKNOWN'}
Status: ${team.status}
UTR: ${team.utr || 'N/A'}
Members Count: ${team.members || 0}
Institution: ${team.institution || 'UNKNOWN'}
Fraud flags: ${fraudFlags}`;

    try {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: prompt,
      });

      return NextResponse.json({ success: true, summary: text.trim() });
    } catch (aiError) {
      console.error("AI Generation failed:", aiError);
      // Fallback rule-based summary
      const summary = `OPERATIVE UNIT [${team.name}] ACTIVE FOR [${team.event}]. STATUS: ${team.status}.`;
      return NextResponse.json({ success: true, summary: summary });
    }

  } catch (error) {
    console.error('AI Summary error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate summary' }, { status: 500 });
  }
}
