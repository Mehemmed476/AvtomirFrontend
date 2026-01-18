import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getProducts, getImageUrl } from '@/lib/api';
import { ArrowRight, CheckCircle, Truck, ShieldCheck, Clock, ShoppingCart, Eye, Phone, Users, Box, Star, MessageCircle } from 'lucide-react';
import { Metadata } from 'next';

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

  const newProducts = newProductsRes?.data || [];

  return (
    <main className="min-h-screen bg-dark-900 text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[600px] w-full overflow-hidden flex items-center justify-center">
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
          <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/50 text-primary text-sm font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            🚀 {t('heroBadge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {t('heroTitle')} <br />
            <span className="text-primary">{t('heroHighlight')}</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            {t('heroSubtitle')}
          </p>

          {/* BUTONLAR ALANI - GÜNCELLENDİ */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            {/* Mağaza Butonu */}
            <Link 
              href="/shop" 
              className="bg-primary hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              {t('shopNow')} <ArrowRight size={20} />
            </Link>

            {/* Yeni WhatsApp/Telefon Butonu */}
            <a 
              href="https://wa.me/994703223066" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-green-500/50 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-3"
            >
              <div className="bg-green-600/20 p-1.5 rounded-full group-hover:bg-green-600 group-hover:text-white text-green-500 transition-colors">
                 <Phone size={18} />
              </div>
              <span>070 322 30 66</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. AVANTAJLAR (FEATURES - Olduğu kimi qaldı) */}
      <section className="py-12 border-b border-dark-800 bg-dark-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: t('features.delivery.title'), desc: t('features.delivery.desc') },
              { icon: ShieldCheck, title: t('features.warranty.title'), desc: t('features.warranty.desc') },
              { icon: CheckCircle, title: t('features.original.title'), desc: t('features.original.desc') },
              { icon: Clock, title: t('features.support.title'), desc: t('features.support.desc') },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-dark-700 transition-colors group cursor-default">
                <div className="w-12 h-12 rounded-full bg-dark-700 group-hover:bg-primary/20 group-hover:text-primary flex items-center justify-center text-gray-400 transition-colors">
                  <feature.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ƏN YENİ MƏHSULLAR (REAL DATA) */}
      <section className="py-20 bg-dark-800/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t('newArrivalsTitle')}</h2>
              <p className="text-gray-400">{t('newArrivalsSubtitle')}</p>
            </div>
            <Link href="/shop" className="text-primary hover:text-white transition-colors flex items-center gap-1 font-medium">
              {t('viewAllProducts')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((item) => (
              <div key={item.id} className="group bg-dark-800 rounded-2xl p-4 border border-dark-700 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 relative flex flex-col">
                <div className="absolute top-4 left-4 z-10">
                   <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                      YENİ
                   </span>
                </div>
                <div className="aspect-[4/3] bg-white rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-4">
                  <img 
                    src={getImageUrl(item.mainImageUrl)} 
                    alt={item.name}
                    className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Link 
                      href={`/product/${item.slug}`}
                      className="bg-white text-black flex items-center gap-2 px-6 py-2 rounded-full font-bold hover:bg-primary hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl"
                    >
                      <Eye size={18} /> {t('viewProduct')}
                    </Link>
                  </div>
                </div>
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                      {item.brandName || "Avtomir"}
                    </p>
                    <Link href={`/product/${item.slug}`}>
                        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 h-12">
                         {item.name}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex items-end justify-between pt-3 border-t border-dark-600 mt-auto">
                    <span className="text-xl font-bold text-primary tracking-tight">{item.price} <span className="text-sm">₼</span></span>
                    <button className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110 active:scale-95 border border-dark-600">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. YENİ BÖLMƏ: STATİSTİKA (GÜVƏN GÖSTƏRİCİLƏRİ) */}
      <section className="py-20 bg-dark-900 border-t border-dark-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <Box size={40} className="mx-auto text-primary mb-4" />
              <h3 className="text-4xl font-extrabold text-white">10k+</h3>
              <p className="text-gray-400 font-medium uppercase text-sm tracking-wider">{t('stats.products')}</p>
            </div>
            <div className="space-y-2">
              <Users size={40} className="mx-auto text-primary mb-4" />
              <h3 className="text-4xl font-extrabold text-white">5000+</h3>
              <p className="text-gray-400 font-medium uppercase text-sm tracking-wider">{t('stats.clients')}</p>
            </div>
            <div className="space-y-2">
              <Star size={40} className="mx-auto text-primary mb-4" />
              <h3 className="text-4xl font-extrabold text-white">99%</h3>
              <p className="text-gray-400 font-medium uppercase text-sm tracking-wider">{t('stats.satisfaction')}</p>
            </div>
            <div className="space-y-2">
              <Clock size={40} className="mx-auto text-primary mb-4" />
              <h3 className="text-4xl font-extrabold text-white">5 {t('stats.years')}</h3>
              <p className="text-gray-400 font-medium uppercase text-sm tracking-wider">{t('stats.experience')}</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}