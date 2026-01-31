import {createNavigation} from 'next-intl/navigation';

export const locales = ['hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or'] as const;
export const defaultLocale = 'hi' as const;

export const {Link, redirect, usePathname, useRouter} = createNavigation({
  locales,
  defaultLocale
});