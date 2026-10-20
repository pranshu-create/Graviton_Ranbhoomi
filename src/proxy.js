import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// In-memory rate limiting map for Edge Middleware fallback
const rateLimitMap = new Map();

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Block sensitive files & probing attempts (Checklist Section 1 & 5)
  const lowerPath = pathname.toLowerCase();
  if (
    lowerPath.includes('/.env') ||
    lowerPath.includes('/.git') ||
    lowerPath.includes('/.vscode') ||
    lowerPath.includes('/.ds_store') ||
    lowerPath.endsWith('.bak') ||
    lowerPath.endsWith('.sql') ||
    lowerPath.endsWith('.zip') ||
    lowerPath.includes('phpinfo')
  ) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 2. Strip spoofable internal headers from external requests
  const sanitizedHeaders = new Headers(request.headers);
  sanitizedHeaders.delete('x-admin-email');
  sanitizedHeaders.delete('x-admin-role');
  sanitizedHeaders.delete('x-user-role');
  sanitizedHeaders.delete('x-team-email');

  // 3. Strict rate limiting on registration endpoints to prevent traffic spikes/crashes
  if (pathname === '/api/teams' && request.method === 'POST') {
    const windowMs = 60 * 1000;
    const maxRequests = 10;

    const now = Date.now();
    const windowStart = now - windowMs;

    const requestLog = rateLimitMap.get(ip) || [];
    const requestsInWindow = requestLog.filter(time => time > windowStart);

    if (requestsInWindow.length >= maxRequests) {
      return NextResponse.json(
        { error: 'High traffic detected. Registration queue is busy. Please try again in 1 minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    requestsInWindow.push(now);
    rateLimitMap.set(ip, requestsInWindow);
  }

  // 4. Admin Routing Protection (Strict Server-Side Authorization)
  // /api/admin/files is handled in section 5 to allow both Admin and Team owners
  if (
    pathname.startsWith('/super-admin') ||
    pathname === '/api/verify' ||
    pathname === '/api/scan' ||
    pathname.startsWith('/api/scan/') ||
    (pathname.startsWith('/api/admin') && 
     pathname !== '/api/admin/login' && 
     pathname !== '/api/admin/setup' && 
     pathname !== '/api/admin/files')
  ) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    const decoded = await verifyToken(token);
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER', 'HOSTEL_AUTHORITY', 'BOYS_HOSTEL_SECURITY', 'GIRLS_HOSTEL_SECURITY', 'HOSTEL_STAFF'];
    if (!decoded || !validRoles.includes(decoded.role)) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    sanitizedHeaders.set('x-admin-email', decoded.email);
    sanitizedHeaders.set('x-admin-role', decoded.role);
    sanitizedHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: sanitizedHeaders,
      },
    });
  }

  // 5. Team / Dual-Role Routing Protection
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/upload-id') ||
    pathname.startsWith('/api/accommodation') ||
    pathname === '/api/admin/files' ||
    (pathname.startsWith('/api/teams') && request.method !== 'POST')
  ) {
    const teamToken = request.cookies.get('team_token')?.value;
    const adminToken = request.cookies.get('admin_token')?.value;

    // Admin has override access to API endpoints (accommodation, teams, files)
    // If accessing the participant dashboard page directly, redirect admin to /super-admin
    if (adminToken) {
      const decodedAdmin = await verifyToken(adminToken);
      const validRoles = ['SUPER_ADMIN', 'ADMIN', 'VOLUNTEER', 'HOSTEL_AUTHORITY', 'BOYS_HOSTEL_SECURITY', 'GIRLS_HOSTEL_SECURITY', 'HOSTEL_STAFF'];
      if (decodedAdmin && validRoles.includes(decodedAdmin.role)) {
        if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
          return NextResponse.redirect(new URL('/super-admin', request.url));
        }
        sanitizedHeaders.set('x-admin-email', decodedAdmin.email);
        sanitizedHeaders.set('x-admin-role', decodedAdmin.role);
        sanitizedHeaders.set('x-user-role', decodedAdmin.role);
        return NextResponse.next({
          request: {
            headers: sanitizedHeaders,
          },
        });
      }
    }

    if (!teamToken) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decodedTeam = await verifyToken(teamToken);
    if (!decodedTeam) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid session' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Enforce email verification for teams (except on verify-email itself)
    if (decodedTeam.isEmailVerified === false) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Forbidden: Email verification required', requiresVerification: true }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/verify-email', request.url));
    }

    sanitizedHeaders.set('x-team-email', decodedTeam.email);
    sanitizedHeaders.set('x-user-role', 'TEAM');

    return NextResponse.next({
      request: {
        headers: sanitizedHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: sanitizedHeaders,
    },
  });
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
    '/api/teams/:path*',
    '/:path*\\.(env|git|bak|sql|zip|DS_Store)'
  ],
};
