import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Admin Routing Protection
  if (
    pathname.startsWith('/super-admin') ||
    pathname === '/api/verify' ||
    pathname === '/api/scan' ||
    pathname.startsWith('/api/scan/') ||
    (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login' && pathname !== '/api/admin/setup')
  ) {
    const token = request.cookies.get('admin_token')?.value;
    console.log(`[Middleware] pathname: ${pathname}, token exists: ${!!token}`);

    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
      }
      console.log(`[Middleware] No token, redirecting to /admin-login`);
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    const decoded = await verifyToken(token);
    console.log(`[Middleware] decoded token:`, decoded);
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER', 'HOSTEL_AUTHORITY', 'BOYS_HOSTEL_SECURITY', 'GIRLS_HOSTEL_SECURITY', 'HOSTEL_STAFF'];
    if (!decoded || !validRoles.includes(decoded.role)) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin token' }, { status: 401 });
      }
      console.log(`[Middleware] Token invalid or role invalid, redirecting to /admin-login`);
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-email', decoded.email);
    requestHeaders.set('x-admin-role', decoded.role);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 2. Team/User Routing Protection
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/upload-id') ||
    pathname.startsWith('/api/accommodation') ||
    (pathname.startsWith('/api/teams') && request.method !== 'POST')
  ) {
    const teamToken = request.cookies.get('team_token')?.value;
    const adminToken = request.cookies.get('admin_token')?.value;

    // Admin has override access to dashboard and uploads
    if (adminToken) {
      const decodedAdmin = await verifyToken(adminToken);
      const validRoles = ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER', 'HOSTEL_AUTHORITY', 'BOYS_HOSTEL_SECURITY', 'GIRLS_HOSTEL_SECURITY', 'HOSTEL_STAFF'];
      if (decodedAdmin && validRoles.includes(decodedAdmin.role)) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-admin-email', decodedAdmin.email);
        requestHeaders.set('x-user-role', decodedAdmin.role);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    }

    if (!teamToken) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Team session required' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decodedTeam = await verifyToken(teamToken);
    if (!decodedTeam) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Team session' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Enforce email verification for teams
    if (decodedTeam.isEmailVerified === false) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Forbidden: Email verification required', requiresVerification: true }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/verify-email', request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-team-email', decodedTeam.email);
    requestHeaders.set('x-user-role', 'TEAM');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/verify',
    '/api/scan',
    '/api/scan/:path*',
    '/api/upload',
    '/api/upload/:path*',
    '/api/upload-id',
    '/api/upload-id/:path*',
    '/api/accommodation',
    '/api/accommodation/:path*',
    '/api/teams',
    '/api/teams/:path*'
  ],
};
