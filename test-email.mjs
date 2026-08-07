import nodemailer from "nodemailer";

async function test() {
  try {
    console.log("Testing email...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gravitonroboticsidr@gmail.com",
        pass: "vkpq wyma aooc ubhv"
      }
    });

    await transporter.verify();
    console.log("Auth verified successfully!");
    
    await transporter.sendMail({
      from: "gravitonroboticsidr@gmail.com",
      to: "gravitonroboticsidr@gmail.com",
      subject: "Test",
      text: "Hello world"
    });
    console.log("Email sent!");
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
