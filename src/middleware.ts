import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

// 1. next-intl middleware-i yaradiriq
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // CRITICAL: Admin authentication check - RUNS FIRST before anything else
  // Check if accessing admin routes (but not login page)
  const isAdminRoute = pathname.includes('/admin');
  const isLoginPage = pathname.includes('/admin/login');

  console.log('🔍 Middleware Auth Check:', {
    pathname,
    isAdminRoute,
    isLoginPage,
    timestamp: new Date().toISOString()
  });

  // STRICT ADMIN PROTECTION - Block ALL admin routes without valid token
  if (isAdminRoute && !isLoginPage) {
    // Get token from cookies
    const token = request.cookies.get('admin_token')?.value;

    console.log('🔐 Admin Token Verification:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      allCookies: request.cookies.getAll().map(c => c.name)
    });

    // NO TOKEN or EMPTY TOKEN = IMMEDIATE REDIRECT
    if (!token || token.trim() === '') {
      // Extract locale from path
      const pathSegments = pathname.split('/').filter(Boolean);
      const locale = ['az', 'en', 'ru'].includes(pathSegments[0]) ? pathSegments[0] : 'az';

      console.error('🚨 UNAUTHORIZED ACCESS BLOCKED:', {
        attemptedPath: pathname,
        reason: 'No valid authentication token'
      });

      // Build login URL with return path
      const loginUrl = new URL(`/${locale}/admin/login`, origin);
      loginUrl.searchParams.set('returnUrl', pathname);
      loginUrl.searchParams.set('reason', 'unauthorized');

      // REDIRECT IMMEDIATELY - No admin content should be rendered
      return NextResponse.redirect(loginUrl);
    }

    console.log('✅ Admin token verified. Access granted to:', pathname);
  }

  // Continue to i18n middleware for other routes
  return intlMiddleware(request);
}

export const config = {
  // Bütün path-ləri tut, amma _next, api və statik fayllara dəymə
  matcher: ['/', '/(az|en|ru)/:path*']
};