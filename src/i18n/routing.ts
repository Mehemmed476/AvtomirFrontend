import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation'; // Dəyişən hissə buradır

export const routing = defineRouting({
  // Dəstəklənən dillər
  locales: ['az', 'en', 'ru'],

  // Varsayılan dil
  defaultLocale: 'az'
});

// "createSharedPathnamesNavigation" yerinə "createNavigation" işlədirik
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);