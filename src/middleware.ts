import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

// 1. next-intl middleware-i yaradiriq
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Əgər istifadəçi ADMIN səhifəsinə girməyə çalışırsa
  // (lakin login səhifəsinin özü deyilsə)
  const isAdminPage = pathname.includes('/admin');
  const isLoginPage = pathname.includes('/login');

  if (isAdminPage && !isLoginPage) {
    // 3. Cookie-də "admin_token" varmı?
    const token = request.cookies.get('admin_token')?.value;

    // 4. Token yoxdursa -> Loginə at (Dili qorumaq şərtilə)
    if (!token) {
      // Mövcud dili URL-dən tapırıq (məs: /az/admin -> az)
      const locale = pathname.split('/')[1] || 'az'; 
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }
  }

  // 5. Əgər hər şey qaydasındadırsa, dil middleware-i işini görsün
  return intlMiddleware(request);
}

export const config = {
  // Bütün path-ləri tut, amma _next, api və statik fayllara dəymə
  matcher: ['/', '/(az|en|ru)/:path*']
};