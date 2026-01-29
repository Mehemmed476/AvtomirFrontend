"use client";

import { useEffect, useState, useCallback } from "react";
import { getShortVideos, deleteShortVideo, bulkDeleteShortVideos, ShortVideoGetDto } from "@/lib/api";
import { Edit, Trash2, Plus, Play, ExternalLink, CheckSquare, Square } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useConfirm } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

export default function AdminShortsPage() {
  const [videos, setVideos] = useState<ShortVideoGetDto[]>([]);
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const res = await getShortVideos();
    if (res?.success && res.data) {
      setVideos(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = async (id: number, title: string) => {
    const confirmed = await confirm({
      title: "Videonu sil",
      message: `"${title}" videosunu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz!`,
      confirmText: "Sil",
      cancelText: "Ləğv et",
      type: "danger"
    });

    if (!confirmed) return;

    setDeleteLoading(id);
    const res = await deleteShortVideo(id);
    setDeleteLoading(null);

    if (res?.success) {
      toast.success("Video uğurla silindi");
      await fetchVideos();
    } else {
      if (res?.statusCode === 401) {
        toast.error("Sizin sessiya bitib. Zəhmət olmasa yenidən login olun.");
        router.push("/admin/login");
      } else {
        toast.error("Xəta baş verdi: " + (res?.message || "Video silinmədi"));
      }
    }
  };

  // Bulk delete handlers
  const toggleSelectVideo = (id: number) => {
    setSelectedVideos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map(v => v.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.size === 0) return;

    const confirmed = await confirm({
      title: "Çoxlu silmə",
      message: `${selectedVideos.size} videonu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz!`,
      confirmText: `${selectedVideos.size} videonu sil`,
      cancelText: "Ləğv et",
      type: "danger"
    });

    if (!confirmed) return;

    setBulkDeleteLoading(true);
    const res = await bulkDeleteShortVideos(Array.from(selectedVideos));
    setBulkDeleteLoading(false);

    if (res?.success) {
      toast.success(`${res.data} video uğurla silindi`);
      setSelectedVideos(new Set());
      await fetchVideos();
    } else {
      if (res?.statusCode === 401) {
        toast.error("Sizin sessiya bitib. Zəhmət olmasa yenidən login olun.");
        router.push("/admin/login");
      } else {
        toast.error("Xəta baş verdi: " + (res?.message || "Videolar silinmədi"));
      }
    }
  };

  // YouTube video ID-ni linkdən çıxar
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Qısa Videolar</h1>
          <p className="text-slate-400 text-sm mt-1">
            {videos.length} video göstərilir
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedVideos.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-500/25 font-medium disabled:opacity-50"
            >
              {bulkDeleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Silinir...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  {selectedVideos.size} videonu sil
                </>
              )}
            </button>
          )}
          <Link
            href="/admin/shorts/create"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-pink-500/25 font-medium"
          >
            <Plus size={20} /> Yeni Video
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-4 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title={selectedVideos.size === videos.length ? "Hamısını seçmə" : "Hamısını seç"}
                  >
                    {videos.length > 0 && selectedVideos.size === videos.length ? (
                      <CheckSquare size={20} className="text-pink-400" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Video</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Başlıq</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tarix</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                      <span className="text-slate-400">Yüklənir...</span>
                    </div>
                  </td>
                </tr>
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                        <Play size={24} className="text-slate-600" />
                      </div>
                      <p className="text-slate-400">Video tapılmadı</p>
                    </div>
                  </td>
                </tr>
              ) : (
                videos.map((video) => {
                  const youtubeId = getYouTubeId(video.link);
                  return (
                    <tr key={video.id} className={`hover:bg-slate-800/30 transition-colors group ${selectedVideos.has(video.id) ? 'bg-pink-500/10' : ''}`}>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelectVideo(video.id)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          {selectedVideos.has(video.id) ? (
                            <CheckSquare size={20} className="text-pink-400" />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-20 h-12 rounded-lg bg-slate-800/50 flex-shrink-0 relative overflow-hidden border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
                          {youtubeId ? (
                            <img
                              src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Play className="text-slate-600" size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white line-clamp-1">{video.title}</span>
                          <a
                            href={video.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-pink-400 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${video.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          }`}>
                          {video.isActive ? "Aktiv" : "Deaktiv"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(video.createdDate).toLocaleDateString("az-AZ")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/shorts/edit/${video.id}`}
                            className="p-2.5 text-slate-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-all"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(video.id, video.title)}
                            disabled={deleteLoading === video.id}
                            className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
