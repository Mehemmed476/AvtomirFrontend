import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- ADMIN PANEL TƏHLÜKƏSİZLİYİ ---
  
  // URL-in '/admin' hissəsini yoxlayırıq
  // Amma '/admin/login' səhifəsini istisna edirik (yoxsa sonsuz dövrə düşər)
  const isAdminRoute = pathname.includes('/admin');
  const isLoginPage = pathname.includes('/admin/login');

  if (isAdminRoute && !isLoginPage) {
    // 1. Tokeni Cookie-dən oxuyuruq (Adətən 'token' və ya 'accessToken' olur)
    const token = request.cookies.get('token')?.value;

    // 2. Əgər token yoxdursa, Login səhifəsinə yönləndiririk
    if (!token) {
      // Mövcud dili URL-dən tapırıq (məs: /az/admin -> az)
      const locale = pathname.split('/')[1] || 'az';
      
      // Redirect URL yaradın
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Digər bütün hallarda next-intl öz işini görsün
  return intlMiddleware(request);
}

export const config = {
  // Bütün lazımi routeları matcher-ə əlavə edirik
  matcher: ['/', '/(az|en|ru)/:path*']
};