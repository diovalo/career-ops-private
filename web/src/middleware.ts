import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let the login page and auth API through unconditionally
  if (pathname === '/login' || pathname === '/api/auth') {
    const res = NextResponse.next();
    res.headers.set('x-pathname', pathname);
    return res;
  }

  // If DASHBOARD_SECRET is not set, let everything through (dev with no secret configured)
  const requiredSecret = process.env.DASHBOARD_SECRET;
  if (!requiredSecret) {
    const res = NextResponse.next();
    res.headers.set('x-pathname', pathname);
    return res;
  }

  const authCookie = request.cookies.get('dashboard_auth')?.value;

  if (authCookie !== requiredSecret) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();
  res.headers.set('x-pathname', pathname);
  return res;
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
