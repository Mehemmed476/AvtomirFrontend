"use client";

import { useState } from "react";
import { createShortVideo } from "@/lib/api";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";

export default function CreateShortPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // YouTube video ID-ni linkdən çıxar
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(link);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Başlıq daxil edin");
      return;
    }

    if (!link.trim()) {
      setError("YouTube linki daxil edin");
      return;
    }

    if (!youtubeId) {
      setError("Düzgün YouTube linki daxil edin");
      return;
    }

    setLoading(true);

    const res = await createShortVideo({
      title: title.trim(),
      link: link.trim(),
      isActive,
      createdDate: new Date().toISOString(),
    });

    setLoading(false);

    if (res.success) {
      router.push("/admin/shorts");
    } else {
      if (res.statusCode === 401) {
        setError("Sizin sessiya bitib. Zəhmət olmasa yenidən login olun.");
        setTimeout(() => router.push("/admin/login"), 2000);
      } else {
        setError(res.message || "Video yaradılmadı");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/shorts"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Yeni Video Əlavə Et</h1>
          <p className="text-slate-400 text-sm mt-1">YouTube Shorts və ya video linki əlavə edin</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Başlıq <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video başlığı"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/50 transition-all"
          />
        </div>

        {/* Link */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            YouTube Linki <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://youtube.com/shorts/... və ya https://youtu.be/..."
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/50 transition-all"
          />
          <p className="text-xs text-slate-500">
            YouTube Shorts, normal video və ya youtu.be linkləri dəstəklənir
          </p>
        </div>

        {/* Preview */}
        {youtubeId && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Önizləmə</label>
            <div className="aspect-video bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div>
            <p className="font-medium text-white">Aktiv</p>
            <p className="text-sm text-slate-400">Video saytda göstərilsin</p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative w-14 h-7 rounded-full transition-colors ${isActive ? "bg-pink-500" : "bg-slate-600"
              }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${isActive ? "translate-x-7" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/admin/shorts"
            className="flex-1 px-4 py-3 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-700/50 border border-slate-700/50 transition-all text-center font-medium"
          >
            Ləğv et
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Yaradılır...
              </>
            ) : (
              <>
                <Play size={18} />
                Video Yarat
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
