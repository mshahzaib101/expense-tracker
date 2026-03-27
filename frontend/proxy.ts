import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/expenses', '/overview', '/settings'];

const isCrossDomain =
  process.env.NEXT_PUBLIC_API_URL?.startsWith('http') &&
  !process.env.NEXT_PUBLIC_API_URL?.includes('localhost');

export function proxy(request: NextRequest) {
  if (isCrossDomain) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/expenses/:path*', '/overview/:path*', '/settings/:path*'],
};
