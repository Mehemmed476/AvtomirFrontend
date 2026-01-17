"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  mainImage: string;
}

export default function ProductGallery({ images, mainImage }: Props) {
  // Əsas şəkli idarə edən state
  const [selectedImage, setSelectedImage] = useState(mainImage);

  // URL Helper (Eyni məntiq)
  const getImageUrl = (url: string) => {
    if (!url || url === 'no-image.png') return '/assets/no-image.png';
    if (url.startsWith('http')) return url;
    return `http://45.67.203.108:8080/uploads/${url}`;
  };

  // Bütün şəkilləri birləşdiririk (Main + Digərləri)
  const allImages = [mainImage, ...images].filter((v, i, a) => a.indexOf(v) === i && v); // Unikal edirik

  return (
    <div className="flex flex-col gap-4">
      
      {/* ƏSAS BÖYÜK ŞƏKİL */}
      <div className="aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-dark-700 relative group">
        <img 
          src={getImageUrl(selectedImage)} 
          alt="Product" 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* KIÇIK THUMBNAILS */}
      {allImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`
                w-20 h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-white p-2 transition-all
                ${selectedImage === img ? "border-primary ring-2 ring-primary/30" : "border-dark-700 hover:border-gray-500"}
              `}
            >
              <img src={getImageUrl(img)} className="w-full h-full object-contain" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}