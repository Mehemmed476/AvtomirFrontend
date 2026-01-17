import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import BaseLayout from "@/components/BaseLayout";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params; // Next.js 15 üçün await vacibdir

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      {/* DIQQƏT: body-də heç bir 'bg-...' klassı YOXDUR! */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          
          {/* Bütün rəng və struktur məsələsini bu həll edir */}
          <BaseLayout>
            {children}
          </BaseLayout>

        </NextIntlClientProvider>
      </body>
    </html>
  );
}