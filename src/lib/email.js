import nodemailer from "nodemailer";
import { Resend } from "resend";

// Resend Setup
let resend = null;
try {
  const cleanResendKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.replace(/^["']|["']$/g, "") : "";
  if (cleanResendKey) {
    resend = new Resend(cleanResendKey);
  }
} catch (e) {
  console.error("Failed to initialize Resend:", e);
}
const fromEmail = process.env.RESEND_FROM_EMAIL ? process.env.RESEND_FROM_EMAIL.replace(/^["']|["']$/g, "") : `"Ranbhoomi HQ" <onboarding@resend.dev>`;

// Nodemailer fallback setup
const cleanEmailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/^["']|["']$/g, "") : "";
const cleanEmailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/^["']|["']$/g, "") : "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: cleanEmailUser,
    pass: cleanEmailPass,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Generic helper function to handle both Resend and Nodemailer (SMTP)
async function sendMail({ to, subject, html, attachments = [] }) {
  if (resend) {
    try {
      // Convert attachments structure to Resend format if necessary
      const resendAttachments = attachments.map(att => {
        let content = att.content;
        // If content is base64 string or Stream, convert to Buffer where possible
        if (typeof content === 'string' && att.encoding === 'base64') {
          content = Buffer.from(content, 'base64');
        }
        return {
          filename: att.filename,
          content: content,
          cid: att.cid
        };
      });

      const result = await resend.emails.send({
        from: fromEmail,
        to: to,
        subject: subject,
        html: html,
        attachments: resendAttachments
      });

      if (result.error) {
        throw new Error(result.error.message || JSON.stringify(result.error));
      }
      console.log(`[EMAIL] Resend Email sent successfully. ID: ${result.data?.id}`);
      return true;
    } catch (err) {
      console.warn("[EMAIL] Resend failed, trying SMTP fallback...", err.message);
    }
  }

  // Fallback to Nodemailer SMTP
  try {
    const fromAddress = cleanEmailUser ? `"Graviton Command Center" <${cleanEmailUser}>` : `"Ranbhoomi HQ" <onboarding@resend.dev>`;
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      attachments
    });
    console.log(`[EMAIL] SMTP Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR] Email delivery failed:", error);
    return false;
  }
}

export const sendAccommodationFormEmail = async (toEmail, teamName, memberName, token) => {
  const formLink = `${APP_URL}/hostel-form?token=${token}`;
  const html = `
    <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 30px; border: 1px solid #66fcf1; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #66fcf1; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">HQ TRANSMISSION: Accommodation Approved</h2>
      <p style="color: #cccccc;">Dear Squad Leader of <strong>${teamName}</strong>,</p>
      <p style="color: #cccccc;">The initial accommodation request for <strong>${memberName}</strong> has been APPROVED by the Super Admin.</p>
      <p style="color: #cccccc;">To proceed with room allocation, you must securely submit the required documentation (ID Proof, Arrival/Departure Details, Emergency Contact) within 24 hours.</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${formLink}" style="background-color: transparent; border: 1px solid #b829ea; color: #b829ea; padding: 12px 24px; text-decoration: none; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">SECURE FORM LINK</a>
      </div>
      
      <p style="color: #ff4444; font-size: 12px; text-transform: uppercase;">WARNING: Do not share this secure link. It contains a unique cryptographic token for ${memberName}.</p>
      <p style="color: #666666; font-size: 10px; margin-top: 40px;">// END OF TRANSMISSION //</p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `ACTION REQUIRED: Accommodation Form for ${memberName} (${teamName})`,
    html
  });
};

export const sendAccommodationQREmail = async (toEmail, teamName, memberName, roomNumber, qrCodeId) => {
  const dashboardLink = `${APP_URL}/dashboard`;
  const html = `
    <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 30px; border: 1px solid #22c55e; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">HQ TRANSMISSION: Room Allocated</h2>
      <p style="color: #cccccc;">Dear Squad Leader of <strong>${teamName}</strong>,</p>
      <p style="color: #cccccc;">Documentation for <strong>${memberName}</strong> has been verified.</p>
      
      <div style="background-color: #111; border: 1px dashed #22c55e; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="color: #888; font-size: 10px; text-transform: uppercase; margin-bottom: 5px;">Allocated Quarters</p>
        <h1 style="color: #22c55e; margin: 0; font-size: 36px;">${roomNumber}</h1>
      </div>

      <p style="color: #cccccc;">The secure QR Code Ticket has been injected into your Team Dashboard. Hostel Authority check-ins will require this QR code upon entry/exit.</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${dashboardLink}" style="background-color: transparent; border: 1px solid #66fcf1; color: #66fcf1; padding: 12px 24px; text-decoration: none; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">ACCESS DASHBOARD</a>
      </div>
      
      <p style="color: #666666; font-size: 10px; margin-top: 40px;">// END OF TRANSMISSION //</p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `FINAL CLEARANCE: Room ${roomNumber} Allocated to ${memberName} (${teamName})`,
    html
  });
};

export const sendMarketingStoryEmail = async (toEmail, teamName, imageBase64) => {
  if (!imageBase64) {
    console.error("[EMAIL ERROR] No imageBase64 provided for marketing story.");
    return false;
  }

  const rawBase64 = imageBase64.includes("base64,") ? imageBase64.split("base64,")[1] : imageBase64;
  const html = `
    <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 30px; border: 1px solid #f97316; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">HQ TRANSMISSION: MARKETING ASSET</h2>
      <p style="color: #cccccc;">Dear Squad Leader of <strong>${teamName}</strong>,</p>
      <p style="color: #cccccc;">Attached below is your official "Access Granted" Instagram Story. Download and share it to let your rivals know you are coming.</p>
      
      <div style="background-color: #111; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;">
        <h3 style="color: #f97316; margin-top: 0; margin-bottom: 10px; font-size: 14px; text-transform: uppercase;">Commandments for the Arena</h3>
        <ul style="color: #aaa; font-size: 12px; padding-left: 20px; margin-bottom: 0;">
          <li style="margin-bottom: 5px;"><strong>Play Safe:</strong> Respect your opponents and the machinery.</li>
          <li style="margin-bottom: 5px;"><strong>Stay Sharp:</strong> Maintain your robots and keep your tools organized.</li>
          <li><strong>Give it your all:</strong> The battlefield forgives no one. Best of luck!</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <img src="cid:story@graviton" alt="Instagram Story" style="max-width: 100%; max-height: 600px; border-radius: 10px; border: 2px solid #f97316;" />
      </div>

      <p style="color: #666666; font-size: 10px; margin-top: 40px;">// END OF TRANSMISSION //</p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `ACCESS GRANTED: Your Official Ranbhoomi Ticket (${teamName})`,
    html,
    attachments: [
      {
        filename: `ranbhoomi_${teamName.replace(/\s+/g, '_')}_story.jpg`,
        content: rawBase64,
        encoding: 'base64',
        cid: 'story@graviton'
      }
    ]
  });
};

export const sendVerificationEmail = async (toEmail, teamName, otp) => {
  const html = `
    <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 30px; border: 1px solid #66fcf1; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #66fcf1; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">HQ TRANSMISSION: EMAIL VERIFICATION</h2>
      <p style="color: #cccccc;">Welcome to the RANBHOOMI 2.0 mainframe, leader of <strong>${teamName}</strong>.</p>
      <p style="color: #cccccc;">To verify your email address and authorize your team dashboard access, you must enter the following 6-digit OTP code:</p>
      
      <div style="background-color: #111; border: 1px dashed #66fcf1; padding: 25px; margin: 25px 0; text-align: center;">
        <h1 style="color: #66fcf1; margin: 0; font-size: 40px; letter-spacing: 10px;">${otp}</h1>
      </div>
      
      <p style="color: #ff4444; font-size: 11px; text-transform: uppercase;">WARNING: Do not share this authentication key. It will expire in 24 hours.</p>
      <p style="color: #666666; font-size: 10px; margin-top: 40px;">// END OF TRANSMISSION //</p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `VERIFICATION REQUIRED: Mainframe Authentication Code ${otp}`,
    html
  });
};

export const sendPasswordResetEmail = async (toEmail, recipientName, resetLink) => {
  const html = `
    <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 30px; border: 1px solid #ff4444; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff4444; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">HQ TRANSMISSION: PASSWORD RESET OVERRIDE</h2>
      <p style="color: #cccccc;">Security override initiated for <strong>${recipientName}</strong>.</p>
      <p style="color: #cccccc;">A request to override and reset your secure passphrase was detected. Click the secure bypass link below to establish a new passphrase:</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetLink}" style="background-color: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 12px 24px; text-decoration: none; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">OVERRIDE PASSPHRASE</a>
      </div>
      
      <p style="color: #ff4444; font-size: 11px; text-transform: uppercase;">WARNING: If you did not request this override, ignore this alert. This link will self-destruct in 1 hour.</p>
      <p style="color: #666666; font-size: 10px; margin-top: 40px;">// END OF TRANSMISSION //</p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `SECURITY ALERT: Passphrase Reset Override Request`,
    html
  });
};

export const send2FAEmail = async (toEmail, recipientName, code) => {
  const html = `
    <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 30px; border: 1px solid #b829ea; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b829ea; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">HQ TRANSMISSION: TWO-FACTOR SECURITY KEY</h2>
      <p style="color: #cccccc;">Hello <strong>${recipientName}</strong>,</p>
      <p style="color: #cccccc;">Two-Factor Authentication is active on your credentials. Input the following one-time security code to authorize your login:</p>
      
      <div style="background-color: #111; border: 1px dashed #b829ea; padding: 25px; margin: 25px 0; text-align: center;">
        <h1 style="color: #b829ea; margin: 0; font-size: 40px; letter-spacing: 10px;">${code}</h1>
      </div>
      
      <p style="color: #ff4444; font-size: 11px; text-transform: uppercase;">WARNING: This security key will expire in 10 minutes.</p>
      <p style="color: #666666; font-size: 10px; margin-top: 40px;">// END OF TRANSMISSION //</p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `SECURITY ALERT: Two-Factor Passcode ${code}`,
    html
  });
};

export const sendRegistrationAcknowledgementEmail = async (toEmail, teamName, eventName) => {
  const html = `
    <div style="font-family: monospace; background-color: #050505; color: #ffffff; padding: 30px; border: 1px solid #66fcf1; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #66fcf1; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 10px;">HQ TRANSMISSION: REGISTRATION RECEIVED</h2>
      <p style="color: #cccccc;">Congratulations, leader of <strong>${teamName}</strong>!</p>
      <p style="color: #cccccc;">Your registration for <strong>${eventName}</strong> has been received successfully.</p>
      <p style="color: #cccccc;">You can now access your dashboard to finalize your payment and secure your slot.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${APP_URL}/dashboard" style="background-color: transparent; border: 1px solid #66fcf1; color: #66fcf1; padding: 12px 24px; text-decoration: none; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">ACCESS DASHBOARD</a>
      </div>
      <p style="color: #666666; font-size: 10px; margin-top: 40px;">// END OF TRANSMISSION //</p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `CONFIRMATION: Registration Received for ${teamName} (${eventName})`,
    html
  });
};

