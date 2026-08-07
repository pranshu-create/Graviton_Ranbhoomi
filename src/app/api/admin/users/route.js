import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import Log from '@/models/Log';
import { hashPassword } from '@/lib/auth';

// GET all admin users (only accessible to SUPER_ADMIN ideally, but handled in UI or middleware)
export async function GET(req) {
  try {
    await connectToDatabase();
    
    // In a real scenario, check req.headers.get('x-admin-role') === 'SUPER_ADMIN'
    const role = req.headers.get('x-admin-role');
    if (role !== 'SUPER_ADMIN') {
        return NextResponse.json({ success: false, error: 'Unauthorized. Only Super Admin can view all users.' }, { status: 403 });
    }

    const users = await AdminUser.find({}, '-password').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST to create a new admin/volunteer
export async function POST(req) {
  try {
    await connectToDatabase();
    
    const role = req.headers.get('x-admin-role');
    const adminEmail = req.headers.get('x-admin-email');
    
    if (role !== 'SUPER_ADMIN') {
        return NextResponse.json({ success: false, error: 'Unauthorized. Only Super Admin can create users.' }, { status: 403 });
    }

    const { name, newRole, assignedEvent } = await req.json();

    if (!name || !newRole) {
      return NextResponse.json({ success: false, error: 'Name and Role are required' }, { status: 400 });
    }

    const email = `${name.toLowerCase().replace(/\s+/g, '')}@graviton.in`;
    const password = `${name.toLowerCase().replace(/\s+/g, '')}123`;

    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await AdminUser.create({
      name,
      email,
      password: hashedPassword,
      role: newRole,
      assignedEvent: newRole === 'ADMIN' ? null : (assignedEvent || null)
    });
    
    // Log action
    await Log.create({
      action: 'CREATE_USER',
      adminEmail: adminEmail || 'SYSTEM',
      targetId: newUser._id.toString(),
      details: `Created new ${newRole}: ${name} (${email})`
    });

    // Don't send password back
    const userToReturn = { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, assignedEvent: newUser.assignedEvent };

    return NextResponse.json({ success: true, user: userToReturn });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(req) {
    try {
        await connectToDatabase();
        
        const role = req.headers.get('x-admin-role');
        const adminEmail = req.headers.get('x-admin-email');
        
        if (role !== 'SUPER_ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized. Only Super Admin can delete users.' }, { status: 403 });
        }
    
        const { id } = await req.json();
    
        if (!id) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }
        
        const userToDelete = await AdminUser.findById(id);
        if (!userToDelete) {
             return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }
        
        if (userToDelete.email === 'pranshu@graviton.in') {
             return NextResponse.json({ success: false, error: 'Cannot delete the primary Super Admin' }, { status: 403 });
        }
    
        await AdminUser.findByIdAndDelete(id);
        
        await Log.create({
          action: 'DELETE_USER',
          adminEmail: adminEmail || 'SYSTEM',
          targetId: id,
          details: `Deleted user: ${userToDelete.name} (${userToDelete.email})`
        });
    
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
      } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
      }
}

export async function PUT(req) {
    try {
        await connectToDatabase();
        
        const roleHeader = req.headers.get('x-admin-role');
        const adminEmail = req.headers.get('x-admin-email');
        
        if (roleHeader !== 'SUPER_ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized. Only Super Admin can update users.' }, { status: 403 });
        }
    
        const { id, newRole, assignedEvent } = await req.json();
    
        if (!id) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }
        
        const userToUpdate = await AdminUser.findById(id);
        if (!userToUpdate) {
             return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }
        
        if (userToUpdate.email === 'pranshu@graviton.in') {
             return NextResponse.json({ success: false, error: 'Cannot modify the primary Super Admin' }, { status: 403 });
        }
    
        if (newRole) userToUpdate.role = newRole;
        if (assignedEvent !== undefined) userToUpdate.assignedEvent = assignedEvent === "none" ? null : assignedEvent;
        
        if (userToUpdate.role === 'ADMIN') {
          userToUpdate.assignedEvent = null;
        }

        await userToUpdate.save();
        
        await Log.create({
          action: 'UPDATE_USER_ROLE',
          adminEmail: adminEmail || 'SYSTEM',
          targetId: id,
          details: `Changed role of ${userToUpdate.name} (${userToUpdate.email}) to ${newRole}`
        });
    
        return NextResponse.json({ success: true, message: 'User role updated successfully' });
      } catch (error) {
        console.error('Update user role error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update user role' }, { status: 500 });
      }
}
