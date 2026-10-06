import nodemailer from "nodemailer";

const cleanEmailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/^["']|["']$/g, "") : "";
const cleanEmailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/^["']|["']$/g, "") : "";
const cleanEmailHost = process.env.EMAIL_HOST ? process.env.EMAIL_HOST.replace(/^["']|["']$/g, "") : "smtp.gmail.com";
const cleanEmailPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT.replace(/^["']|["']$/g, ""), 10) : 587;
const cleanSenderEmail = process.env.SENDER_EMAIL ? process.env.SENDER_EMAIL.replace(/^["']|["']$/g, "") : cleanEmailUser;

console.log("Loaded SMTP Settings:");
console.log("- Host:", cleanEmailHost);
console.log("- Port:", cleanEmailPort);
console.log("- User:", cleanEmailUser ? `${cleanEmailUser.slice(0, 3)}...` : "(not set)");
console.log("- Pass:", cleanEmailPass ? "***" : "(not set)");
console.log("- Sender:", cleanSenderEmail);

async function testConnection() {
  try {
    const transporter = nodemailer.createTransport({
      host: cleanEmailHost,
      port: cleanEmailPort,
      secure: cleanEmailPort === 465,
      auth: {
        user: cleanEmailUser,
        pass: cleanEmailPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log("Verifying transporter connection...");
    await transporter.verify();
    console.log("Success! SMTP Connection verified successfully.");
  } catch (error) {
    console.error("SMTP Verification Failed with error:", error);
  }
}

testConnection();
