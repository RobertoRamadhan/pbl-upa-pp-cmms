import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token');
  const isAuthenticated = !!authToken;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isRegisterPage = request.nextUrl.pathname === '/register';
  const isPublicPage = request.nextUrl.pathname === '/';

  // Ambil role dari cookie token jika ada
  const userRole = request.cookies.get('user_role')?.value;

  // Jika user mencoba mengakses halaman login tapi sudah ter-autentikasi
  if (isLoginPage && isAuthenticated) {
    // Redirect ke dashboard sesuai role
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (userRole === 'teknisi') {
      return NextResponse.redirect(new URL('/teknisi/dashboard', request.url));
    }
  }

  // Jika user belum ter-autentikasi dan mencoba mengakses halaman yang dilindungi
  if (!isAuthenticated && !isLoginPage && !isRegisterPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika user mencoba mengakses area yang bukan rolenya
  if (isAuthenticated && userRole) {
    // Proteksi area admin
    if (userRole !== 'admin' && request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}/dashboard`, request.url));
    }
    
    // Proteksi area teknisi
    if (userRole !== 'teknisi' && request.nextUrl.pathname.startsWith('/teknisi')) {
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}/dashboard`, request.url));
    }

    // Proteksi area staff
    if (userRole !== 'staff' && request.nextUrl.pathname.startsWith('/staff')) {
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}