"use client";

import { useState, useEffect } from "react";
import { Settings } from "@/types";
import { getSettingsClient, updateSettings } from "@/lib/settings";
import {
  Phone, Mail, MapPin, FileText, Globe,
  Facebook, Instagram, Youtube, MessageCircle,
  Save, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    phone: "",
    email: "",
    address: "",
    mapUrl: "",
    facebook: "",
    instagram: "",
    whatsapp: "",
    youtube: "",
    tiktok: "",
    footerDescription: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettingsClient();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Settings yüklənmədi:", error);
      setMessage({ type: "error", text: "Ayarlar yüklənərkən xəta baş verdi" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const result = await updateSettings(settings);
      if (result.success) {
        setMessage({ type: "success", text: "Ayarlar uğurla yeniləndi!" });
      } else {
        setMessage({ type: "error", text: result.message || "Xəta baş verdi" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ayarlar saxlanarkən xəta baş verdi" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Ayarlar yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Sayt Ayarları</h1>
        <p className="text-slate-400">Footer, əlaqə məlumatları və sosial media linklərini idarə edin</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success"
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Əlaqə Məlumatları */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Phone className="text-blue-400" size={20} />
            Əlaqə Məlumatları
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Telefon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={settings.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="070 322 30 66"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="info@avtomir.az"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Ünvan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Ünvan
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
                <textarea
                  value={settings.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Atatürk prospekti 235, Bakı..."
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kontent */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <FileText className="text-purple-400" size={20} />
            Kontent
          </h2>

          {/* Footer Description */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Footer Açıqlaması
            </label>
            <textarea
              value={settings.footerDescription || ""}
              onChange={(e) => handleChange("footerDescription", e.target.value)}
              placeholder="Avtomobiliniz üçün ən keyfiyyətli ehtiyat hissələri..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
            />
          </div>
        </div>

        {/* Xəritə */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Globe className="text-emerald-400" size={20} />
            Xəritə (Google Maps Embed)
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Google Maps Embed URL
            </label>
            <input
              type="url"
              value={settings.mapUrl || ""}
              onChange={(e) => handleChange("mapUrl", e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
            <p className="mt-2 text-xs text-slate-500">
              Google Maps-dan "Share" {"->"} "Embed a map" {"->"} "COPY HTML" edib yalnız "src" içindəki linki kopyalayın. (Məsələn: https://www.google.com/maps/embed?pb=...)
            </p>
          </div>

          {/* Map Preview */}
          {settings.mapUrl && (
            <div className="mt-4 h-48 rounded-xl overflow-hidden border border-slate-700/50">
              <iframe
                src={settings.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>
          )}
        </div>

        {/* Sosial Media */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Instagram className="text-pink-400" size={20} />
            Sosial Media
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Facebook
              </label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input
                  type="url"
                  value={settings.facebook || ""}
                  onChange={(e) => handleChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/avtomir"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Instagram
              </label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" size={18} />
                <input
                  type="url"
                  value={settings.instagram || ""}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/avtomir"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                WhatsApp
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                <input
                  type="url"
                  value={settings.whatsapp || ""}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="https://wa.me/994703223066"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                YouTube
              </label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                <input
                  type="url"
                  value={settings.youtube || ""}
                  onChange={(e) => handleChange("youtube", e.target.value)}
                  placeholder="https://youtube.com/@avtomir"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* TikTok */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                TikTok
              </label>
              <div className="relative">
                <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="url"
                  value={settings.tiktok || ""}
                  onChange={(e) => handleChange("tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@avtomir"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saxlanılır...
              </>
            ) : (
              <>
                <Save size={20} />
                Ayarları Saxla
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
