import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Team from '@/models/Team';

export async function GET(req) {
  try {
    const teamToken = req.cookies.get('team_token')?.value;
    const adminToken = req.cookies.get('admin_token')?.value;

    // 1. Check Team session first if teamToken is present
    if (teamToken) {
      const decodedTeam = await verifyToken(teamToken);
      if (decodedTeam && (decodedTeam.role === 'TEAM' || decodedTeam.email)) {
        await connectToDatabase();
        const teamExists = await Team.exists({ "memberDetails.0.email": decodedTeam.email });
        if (!teamExists) {
          // Team was eradicated by administration! Expire cookie and reject session
          const response = NextResponse.json(
            { authenticated: false, eradicated: true },
            {
              headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
              }
            }
          );
          response.cookies.set('team_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
            maxAge: 0,
            path: '/'
          });
          return response;
        }

        return NextResponse.json(
          {
            authenticated: true,
            role: 'TEAM',
            email: decodedTeam.email,
            isEmailVerified: !!decodedTeam.isEmailVerified,
            isAdmin: false
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
          }
        );
      }
    }

    // 2. Check Admin session
    if (adminToken) {
      const decodedAdmin = await verifyToken(adminToken);
      const validRoles = [
        'SUPER_ADMIN',
        'ADMIN',
        'VOLUNTEER',
        'HOSTEL_AUTHORITY',
        'BOYS_HOSTEL_SECURITY',
        'GIRLS_HOSTEL_SECURITY',
        'HOSTEL_STAFF'
      ];
      if (decodedAdmin && validRoles.includes(decodedAdmin.role)) {
        return NextResponse.json(
          {
            authenticated: true,
            role: decodedAdmin.role,
            email: decodedAdmin.email,
            adminEmail: decodedAdmin.email,
            isAdmin: true
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
          }
        );
      }
    }

    // 3. Unauthenticated
    return NextResponse.json(
      { authenticated: false },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  }
}
