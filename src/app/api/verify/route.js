import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Team from "@/models/Team";
import PDFDocument from "pdfkit";
import { transporter, cleanSenderEmail } from "@/lib/email";

import path from "path";
import fs from "fs";

// Helper to generate PDF stream
const generateReceiptStream = (team, receiptNumber) => {
  const doc = new PDFDocument({ margin: 50 });

  // PDF Content - Header
  doc.fontSize(20).text('GRAVITON ROBOTICS', { align: 'center' });
  doc.fontSize(12).text('RANBHOOMI 2.0 - TAX INVOICE / RECEIPT', { align: 'center' });
  doc.moveDown();

  // Left Column - Invoice Info
  doc.fontSize(10).text(`Receipt No: ${receiptNumber}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // GSTIN Details
  doc.fontSize(10).font('Helvetica-Bold').text('SVKM NMIMS INDORE');
  doc.font('Helvetica').text('Off. Super Corridor, Bada Bangarda');
  doc.text('Tehsil - Hatod, District - Indore');
  doc.text('Pin Code - 453112, Madhya Pradesh Landmark - Near Gandhi Nagar');
  doc.font('Helvetica-Bold').text('GST NO. 23AABTS8228H1ZG');
  doc.font('Helvetica').moveDown();

  // Bill To
  doc.text(`Bill To:`);
  doc.text(`Team: ${team.name}`);
  doc.text(`Institution: ${team.institution || 'N/A'}`);
  doc.text(`Leader: ${team.memberDetails[0]?.name || 'Unknown'}`);
  doc.moveDown();

  // Table
  doc.text('----------------------------------------------------');
  doc.text(`Description                 Amount`);
  doc.text('----------------------------------------------------');
  doc.text(`Event Registration: ${team.event || 'N/A'}    Rs. ${team.amountPaid || 0}`);
  doc.text('----------------------------------------------------');
  doc.font('Helvetica-Bold').text(`Total Amount                Rs. ${team.amountPaid || 0}`);
  doc.font('Helvetica');
  doc.moveDown(4);

  // Signature
  const signatureX = 350;
  const signatureWidth = 200;
  const currentY = doc.y;

  try {
    const signaturePath = path.join(process.cwd(), 'public', 'signature.png');
    if (fs.existsSync(signaturePath)) {
      // Draw image
      doc.image(signaturePath, signatureX, currentY, { width: signatureWidth });
      // The signature logo looks tall in the screenshot. Advance Y by 160 points.
      doc.y = currentY + 160;
    }
  } catch (err) {
    console.error("Signature attach error:", err);
  }

  // Center 'Authorized Signatory' precisely under the signature box
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Authorized Signatory', signatureX, doc.y, { width: signatureWidth, align: 'center' });
  doc.font('Helvetica');
  doc.moveDown(2);

  // Center the footer on the entire page (margin 50)
  doc.fontSize(8).text('This is a computer-generated document and does not require a physical signature.', 50, doc.y, { width: 495, align: 'center' });

  doc.end();
  return doc;
};

export async function POST(req) {
  try {
    const role = req.headers.get("x-admin-role");

    if (!role || !["SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json({ success: false, error: "Forbidden: insufficient privileges" }, { status: 403 });
    }

    const { teamId, action } = await req.json(); // action: "VERIFY" or "REJECT"

    if (!teamId || !action) {
      return NextResponse.json({ success: false, error: "Missing teamId or action" }, { status: 400 });
    }

    await connectToDatabase();

    let newStatus = null;
    if (action === "VERIFY") newStatus = "VERIFIED";
    else if (action === "REJECT") newStatus = "FAILED";
    else if (action === "DISQUALIFY") newStatus = "DISQUALIFIED";
    else if (action === "RESEND_RECEIPT") newStatus = null;
    else return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

    const updateQuery = newStatus ? { status: newStatus } : {};

    const team = await Team.findOneAndUpdate(
      { teamId: teamId },
      updateQuery,
      { new: true }
    );

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    // Twilio SMS Integration (Simulated if keys are missing)
    const leaderPhone = team.memberDetails.find(m => m.role === "Leader")?.phone;
    if (leaderPhone && newStatus) {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          let smsBody = `[RANBHOOMI HQ] Update for team ${team.name}: Your status is now ${newStatus}.`;
          if (newStatus === "VERIFIED") smsBody = `[RANBHOOMI HQ] Team ${team.name}: Your payment is VERIFIED. Welcome to the combat registry.`;
          if (newStatus === "DISQUALIFIED") smsBody = `[RANBHOOMI HQ] URGENT: Team ${team.name} has been DISQUALIFIED due to a severe rule violation.`;

          await twilioClient.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: leaderPhone
          });
          console.log(`Twilio SMS sent to ${leaderPhone}`);
        } catch (smsError) {
          console.error("Twilio SMS failed:", smsError.message);
        }
      } else {
        console.log(`[SIMULATION: TWILIO] Would send SMS to ${leaderPhone}: Status updated to ${newStatus}`);
      }
    }

    // Send email
    const leaderEmail = team.memberDetails.find(m => m.role === "Leader")?.email;

    if (leaderEmail && cleanSenderEmail && transporter) {
      let mailOptions;

      if (action === "VERIFY" || action === "RESEND_RECEIPT") {
        let receiptNumber = team.receiptNumber;
        if (!receiptNumber) {
          receiptNumber = `GST-RB2026-${Date.now().toString().slice(-6)}`;
          team.receiptNumber = receiptNumber;
          await team.save();
        }

        let attachment = null;
        let pdfErrorLog = "";
        try {
          const pdfStream = generateReceiptStream(team, receiptNumber);
          attachment = {
            filename: `Receipt_${team.id || 'Unknown'}.pdf`,
            content: pdfStream,
            contentType: 'application/pdf'
          };
        } catch (pdfErr) {
          console.error("PDF Generation Error:", pdfErr);
          pdfErrorLog = pdfErr.message || pdfErr.toString();
        }

        mailOptions = {
          from: `"RANBHOOMI HQ" <${cleanSenderEmail}>`,
          to: leaderEmail,
          subject: "Registration Verified - RANBHOOMI 3.0",
          attachments: attachment ? [attachment] : [],
          html: `
            <div style="font-family: 'Courier New', Courier, monospace; background-color: #02050A; color: #ffffff; padding: 0; margin: 0; width: 100%; max-width: 600px; margin: auto; border: 1px solid #66FCF1;">
              <!-- Header -->
              <div style="background-color: #102A30; padding: 20px; text-align: center; border-bottom: 2px solid #66FCF1;">
                <p style="color: #66FCF1; font-size: 12px; letter-spacing: 4px; margin: 0;">SYSTEM.AUTH // CLEARANCE: GRANTED</p>
                <h1 style="color: #ffffff; letter-spacing: 2px; margin: 10px 0 0 0;">RANBHOOMI '26</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #B829EA; text-transform: uppercase;">CONGRATULATIONS, SQUAD ${team.name}</h2>
                <p style="color: #cccccc; font-size: 14px; line-height: 1.6;">
                  Your payment has been fully verified by HQ. You are officially enlisted for <strong>${team.event}</strong>. Below is your Official Holographic Entry Pass. A GST compliant receipt is attached to this email.
                </p>
                
                ${pdfErrorLog ? `<p style="color: red; font-size: 10px;">SYSTEM DIAGNOSTIC (PDF ERR): ${pdfErrorLog}</p>` : ''}

                <!-- QR Code Section -->
                <div style="background-color: #050B14; border: 1px solid rgba(102, 252, 241, 0.3); padding: 20px; text-align: center; margin: 30px 0;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ teamId: team.teamId, status: 'VERIFIED' }))}" alt="Entry Pass QR" style="border: 2px solid #66FCF1; padding: 5px; background: white;" />
                  <p style="color: #66FCF1; font-size: 10px; letter-spacing: 2px; margin-top: 15px;">SQUAD_ID: ${team.teamId}</p>
                  <p style="color: #888888; font-size: 10px; margin-top: 5px;">Must be scanned at the security checkpoint.</p>
                </div>

                <!-- Instructions -->
                <div style="border-left: 3px solid #B829EA; padding-left: 15px; margin-top: 30px;">
                  <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 10px; text-transform: uppercase;">⚠️ CRITICAL DIRECTIVES</h3>
                  <ul style="color: #aaaaaa; font-size: 13px; line-height: 1.8; padding-left: 20px;">
                    <li><strong style="color:#fff;">Official ID Required:</strong> Every squad member must carry a valid physical College ID or Aadhar Card. No ID = No Entry.</li>
                    <li><strong style="color:#fff;">Resource Vault:</strong> Access the Resource Vault on your dashboard using decryption key: <code style="color:#66FCF1; background:#111; padding:2px 5px;">GRAVITON2026</code>.</li>
                    <li><strong style="color:#fff;">Reporting Time:</strong> Report to the campus Main Gates strictly at 0800 HRS on event day.</li>
                    <li><strong style="color:#fff;">Comms Bridge:</strong> Connect your WhatsApp to the bridge terminal on your dashboard for live HQ broadcast alerts.</li>
                  </ul>
                </div>

                <!-- Footer -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #333333; text-align: center;">
                  <p style="color: #555555; font-size: 11px;">This is an automated transmission from RANBHOOMI HQ.<br/>Do not reply directly to this terminal.</p>
                </div>
              </div>
            </div>
          `,
        };
      } else if (action === "REJECT") {
        mailOptions = {
          from: `"RANBHOOMI HQ" <${cleanSenderEmail}>`,
          to: leaderEmail,
          subject: "Payment Rejected - RANBHOOMI 3.0",
          html: `
            <div style="font-family: monospace; background-color: #050B14; color: #fff; padding: 40px; text-align: center;">
              <h1 style="color: #EF4444; letter-spacing: 2px;">PAYMENT REJECTED</h1>
              <p style="color: #ccc;">Team: <strong>${team.name}</strong></p>
              <br/>
              <p>Your uploaded payment screenshot was marked as invalid by HQ.</p>
              <p>Please contact the admin or re-register with a valid screenshot.</p>
              <br/>
              <p style="color: #EF4444;">> ACTION REQUIRED.</p>
            </div>
          `,
        };
      }

      await transporter.sendMail(mailOptions);
    } else if (!cleanSenderEmail || !transporter) {
      console.warn("Email credentials missing. Email not sent.");
    }

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ success: false, error: "Verification failed", details: error.message }, { status: 500 });
  }
}
