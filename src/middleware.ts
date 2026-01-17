import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Bura toxunma, olduğu kimi qalsın
  matcher: ['/', '/(az|en|ru)/:path*']
};