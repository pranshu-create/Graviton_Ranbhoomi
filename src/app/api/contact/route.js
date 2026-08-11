import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Contact from "@/models/Contact";
import nodemailer from "nodemailer";
import { checkRateLimit } from "@/lib/rate-limiter";
import { contactSchema } from "@/lib/schemas";
import { verifyTurnstileToken } from "@/lib/turnstile";
import mongoSanitize from "mongo-sanitize";

export async function POST(req) {
  try {
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    // 1. Rate Limiting Check (5 attempts / minute per IP)
    const rateCheck = await checkRateLimit(ipAddress, 5, 60000, "contact");
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: "Too many transmission requests. Please wait 1 minute." }, { status: 429 });
    }

    await connectToDatabase();

    // Parse and sanitize payload
    const rawBody = await req.json();
    const sanitizedBody = mongoSanitize(rawBody);

    // 2. Input Validation via Zod Schema
    const validation = contactSchema.safeParse(sanitizedBody);
    if (!validation.success) {
      const errorMsg = validation.error.issues?.[0]?.message || "Invalid data transmission structure";
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { name, email, subject, message, turnstileToken } = validation.data;

    // 3. CAPTCHA Verification
    const isHuman = await verifyTurnstileToken(turnstileToken, ipAddress);
    if (!isHuman) {
      return NextResponse.json({ success: false, error: "Bot verification failed. Please try again." }, { status: 400 });
    }

    // Save to Database
    const newContact = await Contact.create({
      name,
      email,
      subject,
      message,
      ipAddress
    });


    // Send styled Email to Graviton Team
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
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

        const mailOptions = {
          from: `"RANBHOOMI Contact Terminal" <${process.env.EMAIL_USER}>`,
          to: "gravitonroboticsidr@gmail.com",
          replyTo: email,
          subject: `[INQUIRY] ${subject} - ${name}`,
          html: `
            <div style="font-family: 'Courier New', Courier, monospace; background-color: #02050A; color: #ffffff; padding: 0; margin: 0; width: 100%; max-width: 600px; margin: auto; border: 1px solid #66FCF1;">
              <div style="background-color: #102A30; padding: 20px; text-align: center; border-bottom: 2px solid #66FCF1;">
                <p style="color: #66FCF1; font-size: 12px; letter-spacing: 4px; margin: 0;">TERMINAL.INCOMING // SIGNAL INTERCEPTED</p>
                <h1 style="color: #ffffff; letter-spacing: 2px; margin: 10px 0 0 0;">RANBHOOMI 2.0</h1>
              </div>
              
              <div style="padding: 30px;">
                <h2 style="color: #B829EA; text-transform: uppercase; border-bottom: 1px solid rgba(102, 252, 241, 0.2); padding-bottom: 10px;">INCOMING MESSAGE</h2>
                
                <table style="color: #cccccc; font-size: 14px; width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold; color: #66FCF1; width: 120px;">SENDER NAME:</td>
                    <td style="padding: 5px 0;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold; color: #66FCF1;">EMAIL:</td>
                    <td style="padding: 5px 0;"><a href="mailto:${email}" style="color: #B829EA; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold; color: #66FCF1;">SUBJECT:</td>
                    <td style="padding: 5px 0; text-transform: uppercase;">${subject}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold; color: #66FCF1;">IP ADDRESS:</td>
                    <td style="padding: 5px 0; font-family: monospace; font-size: 11px; color: #888;">${ipAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold; color: #66FCF1;">TIMESTAMP:</td>
                    <td style="padding: 5px 0; font-family: monospace; font-size: 11px; color: #888;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>

                <div style="background-color: #050B14; border: 1px solid rgba(102, 252, 241, 0.3); padding: 20px; margin: 20px 0;">
                  <p style="color: #66FCF1; font-size: 11px; letter-spacing: 2px; margin: 0 0 10px 0; font-weight: bold;">[ MESSAGE BODY ]</p>
                  <p style="color: #ffffff; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #333333; text-align: center;">
                  <p style="color: #555555; font-size: 11px;">This is an automated transmission from RANBHOOMI Contact Terminal.<br/>Database Record ID: ${newContact._id}</p>
                </div>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[CONTACT EMAIL] Sent inquiry from ${email} to gravitonroboticsidr@gmail.com`);
      } catch (emailError) {
        console.error("[CONTACT EMAIL ERROR] Failed to send email alert:", emailError);
        // Note: We don't fail the response if email sending fails, since database save succeeded.
      }
    } else {
      console.warn("[CONTACT API] Email credentials missing in environment variables. Skipped sending email alert.");
    }

    return NextResponse.json({ success: true, message: "Signal received and logged to mainframe." });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ success: false, error: "Transmission transmission error.", details: error.message }, { status: 500 });
  }
}
