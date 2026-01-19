"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { ShortVideoGetDto } from "@/lib/api";

interface Props {
  videos: ShortVideoGetDto[];
}

export default function ShortVideoCarousel({ videos }: Props) {
  const [selectedVideo, setSelectedVideo] = useState<ShortVideoGetDto | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  // YouTube video ID-ni linkdən çıxar
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <section className="py-16 bg-dark-900">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Qısa Videolar</h2>
              <p className="text-gray-400">YouTube kanalımızdan ən son videolar</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors border border-dark-700"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-3 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors border border-dark-700"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {videos.map((video) => {
              const youtubeId = getYouTubeId(video.link);
              if (!youtubeId) return null;

              return (
                <div
                  key={video.id}
                  className="flex-shrink-0 w-[200px] md:w-[240px] snap-start"
                >
                  <div
                    onClick={() => setSelectedVideo(video)}
                    className="relative aspect-[9/16] bg-dark-800 rounded-2xl overflow-hidden cursor-pointer group border border-dark-700 hover:border-primary/50 transition-all"
                  >
                    {/* Thumbnail */}
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback to mqdefault if maxresdefault doesn't exist
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-primary/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                        <Play size={24} className="text-white ml-1" fill="white" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {video.title}
                      </h3>
                    </div>

                    {/* YouTube Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        SHORTS
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-md aspect-[9/16] bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.link)}?autoplay=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
