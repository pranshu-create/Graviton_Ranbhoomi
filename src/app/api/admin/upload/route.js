import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req) {
  try {
    const role = req.headers.get('x-admin-role');
    if (role === 'VOLUNTEER') {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const data = await req.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Make filename unique
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);
    
    // Attempt to write the file. Note: The uploads directory must exist.
    // In a real prod environment (like Vercel), local filesystem is read-only.
    // For local hosting/VMs, this works fine.
    await writeFile(filepath, buffer);
    
    const logoUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, logoUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
