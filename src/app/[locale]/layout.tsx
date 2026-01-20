import { NextIntlClientProvider } from 'next-intl';
import Script from 'next/script';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import BaseLayout from "@/components/BaseLayout";
import { getSettings } from '@/lib/settings';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // Next.js 15+ üçün await vacibdir

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const settings = await getSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "Avtomir",
    "image": "https://avtomir.az/logo.png",
    "description": settings?.footerDescription || "Bakıda avtomobil ehtiyat hissələri və aksesuarlarının online satışı.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings?.address || "Atatürk prospekti 65a",
      "addressLocality": "Bakı",
      "addressRegion": "Bakı",
      "postalCode": "AZ1000",
      "addressCountry": "AZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.417029",
      "longitude": "49.846506"
    },
    "url": "https://avtomir.az",
    "telephone": settings?.phone || "+994703223066",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "10:00",
        "closes": "22:00"
      }
    ],
    "priceRange": "$$"
  }

  return (
    <html lang={locale}>
      {/* DIQQƏT: body-də heç bir 'bg-...' klassı YOXDUR! */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>

          {/* Bütün rəng və struktur məsələsini bu həll edir */}
          <BaseLayout settings={settings}>
            {children}
          </BaseLayout>

        </NextIntlClientProvider>

        {/* --- GOOGLE ANALYTICS BAŞLANGIÇ --- */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5VEP9GZ219"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-5VEP9GZ219');
          `}
        </Script>
        {/* --- GOOGLE ANALYTICS BİTİŞ --- */}

        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}