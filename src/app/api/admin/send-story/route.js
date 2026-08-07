import { NextResponse } from "next/server";
import { sendMarketingStoryEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { toEmail, teamName, imageBase64 } = await req.json();

    if (!toEmail || !teamName || !imageBase64) {
      console.error("[API ERROR] Missing required fields in send-story:", { toEmail, teamName, hasImage: !!imageBase64 });
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    console.log(`[API] Received request to email story to ${toEmail} for team ${teamName}. Image size: ${imageBase64.length} chars.`);

    const emailSent = await sendMarketingStoryEmail(toEmail, teamName, imageBase64);

    if (emailSent) {
      return NextResponse.json({ success: true, message: "Story successfully sent to team leader!" });
    } else {
      return NextResponse.json({ success: false, error: "Failed to send email. Check server logs." }, { status: 500 });
    }
  } catch (error) {
    console.error("Story Email Route Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
