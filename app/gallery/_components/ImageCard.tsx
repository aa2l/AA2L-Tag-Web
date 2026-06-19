'use client';

import { useState, useEffect } from 'react';
import { ImageRecord } from '../types';
import { Lock } from 'lucide-react';

// ===== 获取 basePath（与 next.config.ts 保持一致） =====
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/AA2L-Tag-Web' : '';

interface ImageCardProps {
  img: ImageRecord;
  isUnlocked: boolean;
  onClick: () => void;
  delay?: number;
}

export default function ImageCard({ img, isUnlocked, onClick, delay = 0 }: ImageCardProps) {
  const [visible, setVisible] = useState(false);
  const isNsfw = img.nsfw && !isUnlocked;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // ===== 核心：图片 URL 加上 basePath 前缀 =====
  const rawSrc = isNsfw ? img.blur_image_url : img.image_url;
  const imageSrc = BASE_PATH + rawSrc;  // 如 /AA2L-Tag-Web/images/xxx.webp

  return (
    <div
      className="relative cursor-pointer group rounded-3xl overflow-hidden 
        shadow-md shadow-pink-100/30 dark:shadow-pink-900/20 
        hover:shadow-xl hover:shadow-pink-200/50 dark:hover:shadow-pink-800/30 
        transition-all duration-300 hover:-translate-y-1.5 
        border-2 border-pink-100 dark:border-pink-900/30 bg-card-soft
        will-change-transform will-change-opacity
        transition-[opacity,transform] duration-700 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}"
      onClick={onClick}
    >
      <img
        src={imageSrc}
        alt={img.author}
        className={`w-full h-auto object-contain ${isNsfw ? 'blur-2xl' : ''}`}
        loading="lazy"
      />
      {isNsfw && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/60 text-pink-200 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-pink-400/30 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            NSFW
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />
    </div>
  );
}