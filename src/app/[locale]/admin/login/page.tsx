"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { loginAdmin } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API-yə "Email" və "Password" göndəririk
      const res = await loginAdmin({
        Email: formData.email,
        Password: formData.password
      });

      if (res.success && res.data && res.data.token) {
        // Uğurlu giriş - Token-i saxlayırıq (auth utility istifadə edərək)
        setAuthToken(res.data.token, res.data.expireDate);

        // Cookie-yə token əlavə et (middleware bunu yoxlayır)
        // CRITICAL: Cookie must be set with correct attributes for middleware to read
        const cookieValue = `admin_token=${res.data.token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = cookieValue;

        console.log('✅ Login successful. Token saved to localStorage and cookie.');
        console.log('🔐 Cookie set:', cookieValue);

        // Dili URL-dən tap
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const currentLocale = ['az', 'en', 'ru'].includes(pathParts[0]) ? pathParts[0] : 'az';

        // Check if there's a return URL
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');

        // Redirect to return URL or admin panel
        const redirectUrl = returnUrl || `/${currentLocale}/admin`;
        console.log('🔄 Redirecting to:', redirectUrl);

        // Use window.location.href for full page reload to ensure cookie is sent
        window.location.href = redirectUrl;
      } else {
        // Backend-dən gələn mesaj (məs: Şifrə yanlışdır)
        throw new Error(res.message || "Email və ya şifrə yanlışdır");
      }
    } catch (err: any) {
      setError(err.message || "Sistem xətası baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* --- SOL TƏRƏF (FORM) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white z-10">
        <div className="w-full max-w-md space-y-8">
          
          {/* Başlıq */}
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} /> Avtomir Admin
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sistemə Giriş</h1>
            <p className="text-gray-500">Davam etmək üçün məlumatlarınızı daxil edin.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">Email</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="admin@avtomir.az"
                  required
                />
              </div>
            </div>

            {/* Password Input ("Unutmusunuz?" silindi) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">Şifrə</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium"
                  placeholder="•••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Daxil Ol <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 pt-4">
            © 2026 Avtomir Panel v2.0
          </p>
        </div>
      </div>

      {/* --- SAĞ TƏRƏF (Görünüş) --- */}
      <div className="hidden lg:flex w-1/2 bg-[#0a192f] relative overflow-hidden items-center justify-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        
        <div className="relative z-10 p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl max-w-lg text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform -rotate-6">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Avtomir İdarəetmə</h2>
          <p className="text-blue-200/80 leading-relaxed text-lg">
            Saytınızı rahat idarə edin. Məhsullar, sifarişlər və tənzimləmələr bir yerdə.
          </p>
        </div>
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>
      </div>

    </div>
  );
}