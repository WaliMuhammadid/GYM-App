import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Public routes
  const publicPaths = ['/login', '/register', '/api/auth', '/api/seed'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // If already logged in and trying to access login/register, redirect
    if (token && (pathname === '/login' || pathname === '/register')) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === '/') {
    if (token) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected routes - must be logged in
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin routes - must be admin
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*', '/admin/:path*', '/workouts/:path*', '/coach/:path*', '/nutrition/:path*', '/profile/:path*'],
};
