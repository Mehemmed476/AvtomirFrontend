"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Facebook, Instagram, MessageCircle, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/api';
import { SiteSettings } from '@/types';

export default function Footer() {
  const t = useTranslations('Footer');
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Admin Paneldən gələn dataları saxlamaq üçün State
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Komponent açılanda API-dən datanı çəkirik
  useEffect(() => {
    const fetchData = async () => {
      const data = await getSettings();
      if (data) setSettings(data);
    };
    fetchData();
  }, []);

  // Admin paneldə Footer görünməsin
  if (pathname.includes("/admin")) return null;

  // --- DİNAMİK DATALAR (Varsa API-dən, yoxdursa Sənin Verdiyin Defaultlar) ---
  
  const phone = settings?.Phone || "055 322 30 66";
  const email = settings?.Email || "jamal_damirov@mail.ru";
  const address = settings?.Address || "Atatürk prospekti 65a, Bakı (Gənclik m., Ayna Sultanova heykəli istiqaməti)";
  
  // Real işlək Google Map Embed Linki (Default olaraq qoydum)
  const defaultMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.7676694864385!2d49.84650637656976!3d40.41702895713467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4030878995903235%3A0xe9a9292a99c2a9ee!2sAvtomir.az!5e0!3m2!1sen!2saz!4v1705500000000!5m2!1sen!2saz";
  const mapUrl = settings?.MapUrl || defaultMapUrl;

  const socialLinks = [
    { icon: Facebook, href: settings?.Facebook || "https://www.facebook.com/Avtomirazerbaijan#" },
    { icon: Instagram, href: settings?.Instagram || "https://www.instagram.com/avtomir.az_0553223066/" },
    { icon: MessageCircle, href: settings?.Whatsapp || "https://wa.me/994553223066" },
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
              {t('description')}
            </p>
            
            {/* Sosial İkonlar */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map((item, i) => (
                <a 
                  key={i} 
                  href={item.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                >
                  <item.icon size={18} />
                </a>
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
                <a 
                  href="https://goo.gl/maps/XYZ" 
                  target="_blank" 
                  className="absolute inset-0 z-10"
                  aria-label="View on Google Maps"
                ></a>
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