import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isUserPage = pathname.startsWith('/user');
  const isAdminPage = pathname.startsWith('/admin');

  if (isUserPage || isAdminPage) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode token to check the user's role for admin routes
    if (isAdminPage) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.role !== 'ADMIN') {
            // Redirect unauthorized users to user dashboard
            return NextResponse.redirect(new URL('/user/dashboard', request.url));
          }
        } else {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      } catch {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  // Redirect authenticated users away from auth pages (/login, /register)
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  if (isAuthPage) {
    const token = request.cookies.get('token')?.value;
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const dashboardUrl = payload.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
          return NextResponse.redirect(new URL(dashboardUrl, request.url));
        }
      } catch {
        // Continue if decoding fails
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ],
};
