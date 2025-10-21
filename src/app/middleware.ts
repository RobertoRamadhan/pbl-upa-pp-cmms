import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function middleware(request: NextRequest) {
  // Skip untuk route publik
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session');
  const userId = session?.value;

  console.log('Middleware - Session:', session);
  console.log('Middleware - User ID:', userId);

  if (!userId) {
    console.log('Middleware - No session found');
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('Middleware - User found:', { id: user.id, role: user.role });

    // Role check
    if (
      (request.nextUrl.pathname.startsWith('/supervisor') ||
        request.nextUrl.pathname.startsWith('/api/supervisor')) &&
      user.role !== 'SUPERVISOR'
    ) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // ✅ Tambahkan header langsung ke response
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);

    console.log('Middleware - Headers set:', {
      'x-user-id': user.id,
      'x-user-role': user.role
    });

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
