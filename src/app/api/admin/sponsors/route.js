import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';
import Log from '@/models/Log';

export async function GET(req) {
  try {
    await connectToDatabase();
    const sponsors = await Sponsor.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, sponsors });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch sponsors' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const adminEmail = req.headers.get('x-admin-email');
    
    // Check if role is SUPER_ADMIN or ADMIN (volunteers cannot add sponsors)
    const role = req.headers.get('x-admin-role');
    if (role === 'VOLUNTEER') {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const { name, tier, logoUrl, websiteUrl } = await req.json();

    if (!name || !logoUrl) {
      return NextResponse.json({ success: false, error: 'Name and Logo URL are required' }, { status: 400 });
    }

    const newSponsor = await Sponsor.create({ name, tier, logoUrl, websiteUrl });
    
    await Log.create({
      action: 'CREATE_SPONSOR',
      adminEmail: adminEmail || 'SYSTEM',
      targetId: newSponsor._id.toString(),
      details: `Added new sponsor: ${name} (${tier})`
    });

    return NextResponse.json({ success: true, sponsor: newSponsor });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create sponsor' }, { status: 500 });
  }
}

export async function DELETE(req) {
    try {
      await connectToDatabase();
      const adminEmail = req.headers.get('x-admin-email');
      const role = req.headers.get('x-admin-role');
      if (role === 'VOLUNTEER') {
          return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
      }
  
      const { id } = await req.json();
  
      const deletedSponsor = await Sponsor.findByIdAndDelete(id);
      if (deletedSponsor) {
          await Log.create({
            action: 'DELETE_SPONSOR',
            adminEmail: adminEmail || 'SYSTEM',
            targetId: id,
            details: `Deleted sponsor: ${deletedSponsor.name}`
          });
      }
  
      return NextResponse.json({ success: true, message: 'Sponsor deleted successfully' });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed to delete sponsor' }, { status: 500 });
    }
}
