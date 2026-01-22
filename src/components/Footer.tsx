"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Facebook, Instagram, MessageCircle, MapPin, Phone, Mail, ArrowRight, Youtube } from 'lucide-react';
import { TikTokIcon } from './icons/TikTokIcon';
import { Settings } from '@/types';

interface FooterProps {
  settings?: Settings | null;
}

export default function Footer({ settings }: FooterProps) {
  const t = useTranslations('Footer');
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Admin paneldə Footer görünməsin
  if (pathname.includes("/admin")) return null;

  // --- DINAMIK DATALAR ---
  const phone = settings?.phone || "070 322 30 66";
  const email = settings?.email || "jamal_damirov@mail.ru";
  const address = settings?.address || "Atatürk prospekti 235, Bakı (Gənclik m., Ayna Sultanova heykəli istiqaməti)";
  const mapUrl = settings?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.661364195639!2d49.84344557574591!3d40.41635205566267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4030878995103235%3A0x5d1a2965c2a9ee!2sAvtomir.az!5e0!3m2!1str!2saz!4v1768807606342!5m2!1str!2saz";
  const description = settings?.footerDescription || t('description');

  const socialLinks = [
    { icon: Facebook, href: settings?.facebook || "https://www.facebook.com/Avtomirazerbaijan" },
    { icon: Instagram, href: settings?.instagram || "https://www.instagram.com/avtomir.az_0553223066/" },
    { icon: Youtube, href: settings?.youtube || "https://www.youtube.com/@avtomiraz814" },
    { icon: TikTokIcon, href: settings?.tiktok || "https://www.tiktok.com/@avtomir.az_official?_r=1&_t=ZS-93CJzjgNN6f" },
    { icon: MessageCircle, href: settings?.whatsapp || "https://wa.me/994703223066" },
  ];

  return (
    <footer className="bg-black border-t border-dark-800 pt-16 pb-8 text-gray-400 font-sans">
      <div className="container mx-auto px-4">

        {/* YUXARI HİSSƏ (GRID 4 Sütun) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* 1. LOGO & HAQQINDA */}
          <div className="space-y-4">
            <Link href="/" className="text-3xl font-bold text-white tracking-tighter inline-block hover:scale-105 transition-transform">
              AVTO<span className="text-primary">MIR</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              {description}
            </p>

            {/* Sosial İkonlar */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map((item, i) => (
                item.href && (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <item.icon size={18} />
                  </a>
                )
              ))}
            </div>
          </div>

          {/* 2. KEÇİDLƏR */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">{t('quickLinks')}</h4>
            <ul className="space-y-3">
              {['home', 'shop', 'about', 'contact'].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link === 'home' ? '' : link}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors text-sm group"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                    {t(`links.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. ƏLAQƏ MƏLUMATLARI (Dinamik) */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">{t('contactInfo')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-primary shrink-0 mt-1" />
                <span className="text-sm">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-primary shrink-0" />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-sm hover:text-white transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-primary shrink-0" />
                <a href={`mailto:${email}`} className="text-sm hover:text-white transition-colors">{email}</a>
              </li>
            </ul>
          </div>

          {/* 4. XƏRİTƏ (Dinamik & Real) */}
          <div className="flex flex-col h-full">
            <h4 className="text-white font-bold text-lg mb-6">{t('locationTitle')}</h4>
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-dark-700 shadow-lg relative group">
              {/* Google Map Iframe */}
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale group-hover:grayscale-0 transition-all duration-500"
              ></iframe>

              {/* Üzərinə basanda böyük xəritəyə keçid (Google Maps saytına) */}

            </div>
          </div>

        </div>

        {/* AŞAĞI HİSSƏ */}
        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {currentYear} Avtomir. {t('copyright')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t('terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('privacy')}</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
