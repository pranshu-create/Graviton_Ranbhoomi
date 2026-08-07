import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
    }

    // 1. File size validation (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Executable / Malware check: inspect magic bytes
    if (buffer.length >= 2) {
      const isPE = buffer[0] === 0x4D && buffer[1] === 0x5A; // MZ header
      const isELF = buffer.length >= 4 && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46; // ELF header
      if (isPE || isELF) {
        return NextResponse.json({ success: false, error: "Malicious file detected. Upload rejected." }, { status: 400 });
      }
    }

    // 3. MIME type validation
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Allowed: JPG, JPEG, PNG, PDF" }, { status: 400 });
    }

    // 4. File extension validation
    const ext = path.extname(file.name).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ success: false, error: "Invalid file extension. Allowed: .jpg, .jpeg, .png, .pdf" }, { status: 400 });
    }

    // Save to private-uploads directory
    const uploadDir = path.join(process.cwd(), "private-uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const teamId = data.get("teamId") || "generic";
    // Generate random UUID name to prevent direct file enumeration
    const fileName = `${teamId}_id_${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ success: true, filePath: `/api/admin/files?path=${fileName}` });
  } catch (error) {
    console.error("ID Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}

