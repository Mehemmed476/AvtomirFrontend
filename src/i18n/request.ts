import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
 
  // Dəstəklənən dillər
  if (!locale || !['az', 'en', 'ru'].includes(locale)) {
    locale = 'az';
  }
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});