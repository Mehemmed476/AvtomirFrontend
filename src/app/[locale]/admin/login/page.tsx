"use client";

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://45.67.203.108:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const token = data.data?.token || data.token;

        if (token) {
          // Cookie - middleware oxuya bilsin deyə
          Cookies.set('token', token, { expires: 1 });

          toast.success('Xoş gəldiniz!');
          router.refresh();
          router.push('/admin');
        } else {
          toast.error('Token tapılmadı!');
        }
      } else {
        toast.error(data.message || 'Giriş uğursuz oldu');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Sistem xətası baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Login Card */}
      <div className="relative w-full max-w-md">

        {/* Card Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-primary/20 to-primary/50 rounded-3xl blur-lg opacity-30" />

        <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">

          {/* Top Accent Line */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="p-8 sm:p-10">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 border border-primary/20">
                <ShieldCheck size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-400 text-sm">
                Davam etmək üçün hesabınıza daxil olun
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email Ünvanı
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="admin@avtomir.az"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Şifrə
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full mt-6 group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary-dark rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                <div className="relative w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Giriş edilir...</span>
                    </>
                  ) : (
                    <span>Daxil Ol</span>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-xs">
                Bu panel yalnız səlahiyyətli şəxslər üçün nəzərdə tutulub.
              </p>
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm font-medium">
            AVTO<span className="text-primary">MIR</span>
          </p>
        </div>
      </div>
    </div>
  );
}
