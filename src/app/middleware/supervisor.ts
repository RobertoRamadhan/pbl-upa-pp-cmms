import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function middleware(request: NextRequest) {
  // Get token from cookie
  const session = request.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Find the user based on session
    const user = await prisma.user.findFirst({
      where: {
        id: session,
        isActive: true
      }
    });

    // If no user found or user is not a supervisor
    if (!user || user.role !== "SUPERVISOR") {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/supervisor/:path*',
    '/api/supervisor/:path*'
  ]
}