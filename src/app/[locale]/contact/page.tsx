import { getTranslations } from 'next-intl/server';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle, Youtube } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bizimlə Əlaqə | Avtomir - Ehtiyat Hissələri Mağazası Bakı",
  description: "Avtomir mağazasının ünvanı və əlaqə nömrələri. Ehtiyat hissələri və zapçast sifarişi üçün bizə zəng edin və ya WhatsApp-la yazın. Bakı şəhəri üzrə çatdırılma və yerində xidmət.",
};

export default async function ContactPage() {
  const t = await getTranslations('Contact');

  // Hardcoded contact information
  const phone = "070 322 30 66";
  const email = "jamal_damirov@mail.ru";
  const address = "Atatürk prospekti 235, Bakı (Gənclik m., Ayna Sultanova heykəli istiqaməti)";
  const workHours = "09:00 - 20:30";
  const instagramUrl = "https://www.instagram.com/avtomir.az_0703223066/";
  const facebookUrl = "https://www.facebook.com/Avtomirazerbaijan#";
  const whatsappUrl = "https://wa.me/994703223066";
  const youtubeUrl = "https://www.youtube.com/@avtomiraz814";
  const tiktokUrl = "https://www.tiktok.com/@avtomir.az_official?_r=1&_t=ZS-93CJzjgNN6f";
  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.661364195639!2d49.84344557574591!3d40.41635205566267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4030878995103235%3A0x5d1a2965c2a9ee!2sAvtomir.az!5e0!3m2!1str!2saz!4v1768807606342!5m2!1str!2saz";

  return (
    <main className="min-h-screen bg-dark-900 text-white pt-10 pb-20">

      {/* HEADER */}
      <section className="container mx-auto px-4 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </section>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* 1. INFO KARTLARI (GRID) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Ünvan */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 flex items-start gap-4 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-200">{t('info.address')}</h4>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  {address}
                </p>
              </div>
            </div>

            {/* Telefon */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 flex items-start gap-4 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-200">{t('info.phone')}</h4>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-2xl font-bold text-white mt-1 hover:text-primary transition-colors block">
                  {phone}
                </a>
                <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
                  <MessageCircle size={12} /> WhatsApp Aktivdir
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 flex items-start gap-4 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-200">{t('info.email')}</h4>
                <a href={`mailto:${email}`} className="text-gray-400 text-sm mt-2 hover:text-white transition-colors block">
                  {email}
                </a>
              </div>
            </div>

            {/* İş Saatları */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 flex items-start gap-4 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-200">{t('info.workingHours')}</h4>
                <p className="text-gray-400 text-sm mt-2">
                  <span className="text-white font-medium">{workHours}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2. SOSİAL MEDİA */}
          <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 text-center">
            <h4 className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-4">{t('info.socials')}</h4>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-900 px-6 py-3 rounded-xl border border-dark-700 hover:border-primary hover:text-primary transition-all">
                <Instagram size={20} /> <span className="font-medium">Instagram</span>
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-900 px-6 py-3 rounded-xl border border-dark-700 hover:border-primary hover:text-primary transition-all">
                <Facebook size={20} /> <span className="font-medium">Facebook</span>
              </a>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-900 px-6 py-3 rounded-xl border border-dark-700 hover:border-red-600 hover:text-red-600 transition-all">
                <Youtube size={20} /> <span className="font-medium">YouTube</span>
              </a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-900 px-6 py-3 rounded-xl border border-dark-700 hover:border-gray-500 hover:text-white transition-all">
                <TikTokIcon size={20} /> <span className="font-medium">TikTok</span>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-900 px-6 py-3 rounded-xl border border-dark-700 hover:border-green-500 hover:text-green-500 transition-all">
                <MessageCircle size={20} /> <span className="font-medium">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* 3. BÖYÜK XƏRİTƏ */}
          <div className="h-[400px] w-full bg-dark-800 rounded-3xl overflow-hidden border border-dark-700 relative shadow-2xl shadow-black/50">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-700"
            ></iframe>
          </div>

        </div>
      </div>
    </main>
  );
}