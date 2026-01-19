import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getProducts, getImageUrl, getShortVideos } from '@/lib/api';
import { ArrowRight, CheckCircle, Truck, ShieldCheck, Clock, ShoppingCart, Eye, Phone, Users, Box, Star, MessageCircle } from 'lucide-react';
import { Metadata } from 'next';
import ShortVideoCarousel from '@/components/ShortVideoCarousel';
import { WhatsAppBrandIcon } from '@/components/icons/WhatsAppIcon';

export const metadata: Metadata = {
  title: "Avtomir - Bakıda Ən Ucuz Ehtiyat Hissələri və Online Zapçast",
  description: "Avtomobiliniz üçün lazım olan bütün ehtiyat hissələri və aksesuarlar Avtomir-də. Maşın bazarına getmədən, Opel, Mercedes, Kia və digər modellər üçün orijinal zapçastları online sifariş edin. Sürətli çatdırılma!",
  keywords: "avtomobil ehtiyat hisseleri, maşın bazarı bakı, zapçast baku, online zapcast satisi, masin aksesuarlari, opel astra zapcast, mercedes ehtiyat hisseleri, bmw zapcast, hyundai ehtiyat hisseleri, kia zapcast, toyota ehtiyat hisseleri, motor yaglari, akumulyatorlar baku, tekerler satisi, masin ucun videoqeydiyyatci, nakladkalar, amortizatorlar, ford ehtiyat hisseleri, chevrolet cruze zapcast, avtomir"
};

export default async function HomePage() {
  const t = await getTranslations('Home');

  // Backend-dən ən yeni 4 məhsulu çəkirik
  const newProductsRes = await getProducts(1, 4, {
    sort: 'newest'
  });

  // Short videoları çəkirik
  const shortVideosRes = await getShortVideos();

  const newProducts = newProductsRes?.data?.items || [];
  const shortVideos = shortVideosRes?.data || [];

  return (
    <main className="min-h-screen bg-dark-900 text-white">

      {/* 1. HERO SECTION */}
      <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 container mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/50 text-primary text-xs md:text-sm font-bold mb-3 md:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            🚀 {t('heroBadge')}
          </span>
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {t('heroTitle')} <br />
            <span className="text-primary">{t('heroHighlight')}</span>
          </h1>
          <p className="text-gray-300 text-base md:text-xl max-w-2xl mx-auto mb-6 md:mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 px-2">
            {t('heroSubtitle')}
          </p>

          {/* BUTONLAR ALANI - GÜNCELLENDİ */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 px-2">
            {/* Mağaza Butonu */}
            <Link
              href="/shop"
              className="w-full sm:w-auto bg-primary hover:bg-red-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              {t('shopNow')} <ArrowRight size={20} />
            </Link>

            {/* Yeni WhatsApp/Telefon Butonu */}
            <a
              href="https://wa.me/994703223066"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-green-500/50 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <div className="bg-green-600/20 p-1.5 rounded-full group-hover:bg-green-600 group-hover:text-white text-green-500 transition-colors">
                <WhatsAppBrandIcon size={18} />
              </div>
              <span>070 322 30 66</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. AVANTAJLAR (FEATURES - Olduğu kimi qaldı) */}
      <section className="py-12 border-b border-dark-800 bg-dark-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Truck, title: t('features.delivery.title'), desc: t('features.delivery.desc') },
              { icon: ShieldCheck, title: t('features.warranty.title'), desc: t('features.warranty.desc') },
              { icon: CheckCircle, title: t('features.original.title'), desc: t('features.original.desc') },
              { icon: Clock, title: t('features.support.title'), desc: t('features.support.desc') },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 p-3 md:p-4 rounded-2xl hover:bg-dark-700 transition-colors group cursor-default text-center md:text-left">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-dark-700 group-hover:bg-primary/20 group-hover:text-primary flex items-center justify-center text-gray-400 transition-colors flex-shrink-0">
                  <feature.icon size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm md:text-base">{feature.title}</h4>
                  <p className="text-xs md:text-sm text-gray-400 hidden md:block">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. QISA VIDEOLAR (YouTube Shorts) */}
      {shortVideos.length > 0 && (
        <ShortVideoCarousel videos={shortVideos} />
      )}

      {/* 4. ƏN YENİ MƏHSULLAR (REAL DATA) */}
      <section className="py-12 md:py-20 bg-dark-800/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{t('newArrivalsTitle')}</h2>
              <p className="text-gray-400 text-sm md:text-base">{t('newArrivalsSubtitle')}</p>
            </div>
            <Link href="/shop" className="text-primary hover:text-white transition-colors flex items-center gap-1 font-medium text-sm md:text-base">
              {t('viewAllProducts')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {newProducts.map((item) => (
              <div key={item.id} className="group bg-dark-800 rounded-xl md:rounded-2xl p-3 md:p-4 border border-dark-700 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 relative flex flex-col">
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
                  <span className="bg-green-600 text-white text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-lg uppercase tracking-wider">
                    YENİ
                  </span>
                </div>
                <div className="aspect-[4/3] bg-white rounded-lg md:rounded-xl mb-3 md:mb-4 relative overflow-hidden flex items-center justify-center p-2 md:p-4">
                  <img
                    src={getImageUrl(item.mainImageUrl)}
                    alt={item.name}
                    className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Link
                      href={`/product/${item.slug}`}
                      className="bg-white text-black flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-base hover:bg-primary hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl"
                    >
                      <Eye size={14} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">{t('viewProduct')}</span><span className="sm:hidden">Bax</span>
                    </Link>
                  </div>
                </div>
                <div className="space-y-2 md:space-y-3 flex-1 flex flex-col">
                  <div className="flex-1">
                    <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5 md:mb-1">
                      {item.brandName || "Avtomir"}
                    </p>
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="font-bold text-white text-sm md:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 h-10 md:h-12">
                        {item.name}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex items-end justify-between pt-2 md:pt-3 border-t border-dark-600 mt-auto">
                    <span className="text-base md:text-xl font-bold text-primary tracking-tight">{item.price} <span className="text-xs md:text-sm">₼</span></span>
                    <button className="w-8 h-8 md:w-10 md:h-10 bg-dark-700 rounded-full flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110 active:scale-95 border border-dark-600">
                      <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. YENİ BÖLMƏ: STATİSTİKA (GÜVƏN GÖSTƏRİCİLƏRİ) */}
      <section className="py-12 md:py-20 bg-dark-900 border-t border-dark-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <div className="space-y-1 md:space-y-2">
              <Box size={28} className="mx-auto text-primary mb-2 md:mb-4 md:w-10 md:h-10" />
              <h3 className="text-2xl md:text-4xl font-extrabold text-white">10k+</h3>
              <p className="text-gray-400 font-medium uppercase text-[10px] md:text-sm tracking-wider">{t('stats.products')}</p>
            </div>
            <div className="space-y-1 md:space-y-2">
              <Users size={28} className="mx-auto text-primary mb-2 md:mb-4 md:w-10 md:h-10" />
              <h3 className="text-2xl md:text-4xl font-extrabold text-white">100000+</h3>
              <p className="text-gray-400 font-medium uppercase text-[10px] md:text-sm tracking-wider">{t('stats.clients')}</p>
            </div>
            <div className="space-y-1 md:space-y-2">
              <Star size={28} className="mx-auto text-primary mb-2 md:mb-4 md:w-10 md:h-10" />
              <h3 className="text-2xl md:text-4xl font-extrabold text-white">99%</h3>
              <p className="text-gray-400 font-medium uppercase text-[10px] md:text-sm tracking-wider">{t('stats.satisfaction')}</p>
            </div>
            <div className="space-y-1 md:space-y-2">
              <Clock size={28} className="mx-auto text-primary mb-2 md:mb-4 md:w-10 md:h-10" />
              <h3 className="text-2xl md:text-4xl font-extrabold text-white">26 {t('stats.years')}</h3>
              <p className="text-gray-400 font-medium uppercase text-[10px] md:text-sm tracking-wider">{t('stats.experience')}</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}