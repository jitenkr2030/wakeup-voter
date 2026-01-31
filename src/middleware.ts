import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/navigation';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(hi|en|bn|te|mr|ta|gu|kn|ml|pa|or)/:path*']
};