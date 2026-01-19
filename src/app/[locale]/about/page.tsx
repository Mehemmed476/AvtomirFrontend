import { getTranslations } from 'next-intl/server';
import {
  Clock, Truck, Wrench, Calendar,
  CreditCard, Banknote, Car, CheckCircle
} from 'lucide-react';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/TikTokIcon';

export default async function AboutPage() {
  const t = await getTranslations('About');

  return (
    <main className="min-h-screen bg-dark-900 text-white pt-10 pb-20">

      {/* 1. HERO HEADER */}
      <section className="container mx-auto px-4 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </section>

      <div className="container mx-auto px-4">

        {/* 2. HISTORY (TARİXÇƏ) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-primary" size={28} />
              <h2 className="text-3xl font-bold">{t('historyTitle')}</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg border-l-4 border-primary pl-6">
              {t('historyText')}
            </p>

            <div className="flex gap-4 pt-4">
              <a href="https://www.instagram.com/avtomir.az_0553223066/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-lg hover:bg-primary transition-colors">
                <Instagram size={20} /> Instagram
              </a>
              <a href="https://www.facebook.com/Avtomirazerbaijan#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-lg hover:bg-primary transition-colors">
                <Facebook size={20} /> Facebook
              </a>
              <a href="https://www.youtube.com/@avtomiraz814" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                <Youtube size={20} /> YouTube
              </a>
              <a href="https://www.tiktok.com/@avtomir.az_official?_r=1&_t=ZS-93CJzjgNN6f" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-lg hover:bg-black transition-colors hover:text-white border border-transparent hover:border-gray-700">
                <TikTokIcon size={20} /> TikTok
              </a>
            </div>
          </div>

          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-dark-700 group">
            <img
              src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1000&auto=format&fit=crop"
              alt="Avtomir Store"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-6 left-6">
              <span className="bg-primary text-white px-3 py-1 rounded text-sm font-bold">est. 2000</span>
            </div>
          </div>
        </div>

        {/* 3. BASIC SERVICES (XİDMƏTLƏR) */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">{t('servicesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Çatdırılma */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 hover:border-primary/50 transition-all group">
              <div className="w-14 h-14 bg-dark-700 rounded-full flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('services.delivery.title')}</h3>
              <p className="text-gray-400">{t('services.delivery.desc')}</p>
            </div>
            {/* Quraşdırma */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 hover:border-primary/50 transition-all group">
              <div className="w-14 h-14 bg-dark-700 rounded-full flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <Wrench size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('services.install.title')}</h3>
              <p className="text-gray-400">{t('services.install.desc')}</p>
            </div>
            {/* İş Rejimi */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 hover:border-primary/50 transition-all group">
              <div className="w-14 h-14 bg-dark-700 rounded-full flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('services.hours.title')}</h3>
              <p className="text-gray-400">{t('services.hours.desc')}</p>
            </div>
          </div>
        </div>

        {/* 4. YENİ BÖLMƏ: ÖDƏNİŞ VƏ ÇATDIRILMA ŞƏRTLƏRİ */}
        <div className="bg-gradient-to-br from-dark-800 to-black rounded-3xl p-8 md:p-12 border border-dark-700 relative overflow-hidden">
          {/* Arxa plan dekorasiyası */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <h2 className="text-3xl font-bold mb-10 text-center relative z-10">{t('deliveryTerms.title')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

            {/* Addım 1: Ödəniş */}
            <div className="bg-dark-900/50 p-6 rounded-2xl border border-dark-700 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <CreditCard size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">{t('deliveryTerms.paymentTitle')}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('deliveryTerms.paymentDesc')}
              </p>
              <div className="mt-4 flex gap-2 text-xs font-bold text-gray-500 uppercase">
                <span className="bg-dark-800 px-2 py-1 rounded border border-dark-700">MilliÖn</span>
                <span className="bg-dark-800 px-2 py-1 rounded border border-dark-700">E-Manat</span>
                <span className="bg-dark-800 px-2 py-1 rounded border border-dark-700">Card</span>
              </div>
            </div>

            {/* Addım 2: Taksi Çatdırılma */}
            <div className="bg-dark-900/50 p-6 rounded-2xl border border-dark-700 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center mb-4">
                <Car size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">{t('deliveryTerms.shippingTitle')}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('deliveryTerms.shippingDesc')}
              </p>
            </div>

            {/* Addım 3: Faydası */}
            <div className="bg-dark-900/50 p-6 rounded-2xl border border-primary/20 flex flex-col items-center text-center shadow-lg shadow-primary/5">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">{t('deliveryTerms.benefitTitle')}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t('deliveryTerms.benefitDesc')}
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}