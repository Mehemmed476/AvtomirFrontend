import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css"; // Bir üst qovluğa çıxırıq
import { Geist, Geist_Mono } from "next/font/google"; // Fontlar
import Header from "@/components/Header";
import Footer from '@/components/Footer';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // params promise kimi gəlir, onu gözləməliyik (Next.js 15+ tələbi)
  const { locale } = await params;

  // Əgər olmayan dil yazılsa 404 ver
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Mesajları serverdən yüklə
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark-900 text-dark-text`}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          
          {/* Səhifənin məzmunu Header-in altında qalmasın deyə padding-top (pt-24) veririk */}
          <div className="pt-24">
            {children}
          </div>

          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}