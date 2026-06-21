// app/gallery/_components/ComicCard.tsx
'use client';

import { useState, useEffect } from 'react';
import type { ComicSeries, ComicChapter } from '@/types/comic';
import { COMIC_STATUS_LABELS, COMIC_STATUS_COLORS } from '@/types/comic';
import { Lock } from 'lucide-react';

// ===== 获取 basePath =====
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/AA2L-Tag-Web' : '';

interface ComicCardProps {
  comic: ComicSeries;
  isUnlocked: boolean;
  onOpenReader: (comic: ComicSeries, startChapterId?: string) => void;
  delay?: number;
}

export default function ComicCard({
  comic,
  isUnlocked,
  onOpenReader,
  delay = 0,
}: ComicCardProps) {
  const [visible, setVisible] = useState(false);

  // ===== 入场动画 =====
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // ===== 封面图片 URL（NSFW 保护） =====
  const coverSrc = comic.coverNsfw && !isUnlocked
    ? comic.coverBlurImage || comic.coverImage
    : comic.coverImage;
  const coverUrl = BASE_PATH + coverSrc;
  const isCoverNsfw = comic.coverNsfw && !isUnlocked;

  // ===== 小预览图逻辑 =====
  const getPreviewPages = (): { chapterId: string; pageUrl: string }[] => {
    const previews: { chapterId: string; pageUrl: string }[] = [];

    if (comic.chapters.length === 0) return previews;

    if (comic.chapters.length === 1) {
      // 只有 1 话 → 取该话前 6 张
      const chapter = comic.chapters[0];
      for (let i = 0; i < Math.min(6, chapter.pages.length); i++) {
        previews.push({
          chapterId: chapter.id,
          pageUrl: chapter.pages[i].url,
        });
      }
    } else {
      // 多话（≥ 2 话）→ 取前 6 话的第一页
      for (let i = 0; i < Math.min(6, comic.chapters.length); i++) {
        const chapter = comic.chapters[i];
        if (chapter.pages.length > 0) {
          previews.push({
            chapterId: chapter.id,
            pageUrl: chapter.pages[0].url,
          });
        }
      }
    }

    return previews;
  };

  const previewPages = getPreviewPages();
  const hasMorePreviews = comic.chapters.length > 6 || (comic.chapters.length === 1 && comic.chapters[0]?.pages.length > 6);
  const extraCount = comic.chapters.length === 1
    ? (comic.chapters[0]?.pages.length || 0) - 6
    : comic.chapters.length - 6;

  // ===== 卡片样式（入场动画） =====
  const cardStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(1.5rem)',
    transition: 'opacity 700ms cubic-bezier(0, 0, 0.2, 1), transform 700ms cubic-bezier(0, 0, 0.2, 1)',
  };

  // ===== 格式化时间 =====
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ===== 点击卡片 =====
  const handleCardClick = () => {
    onOpenReader(comic);
  };

  // ===== 点击小预览图 =====
  const handlePreviewClick = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenReader(comic, chapterId);
  };

  return (
    <div
      style={cardStyle}
      className="relative w-full bg-card-soft rounded-2xl overflow-hidden border border-pink-100 dark:border-pink-900/30 shadow-sm hover:shadow-lg hover:shadow-pink-200/30 dark:hover:shadow-pink-900/20 transition-all duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
        {/* ===== 封面图 ===== */}
        <div className="flex-shrink-0 w-32 sm:w-40 md:w-48 aspect-[2/3] rounded-xl overflow-hidden bg-pink-50/50 dark:bg-pink-900/10 relative">
          <img
            src={coverUrl}
            alt={comic.title}
            className={`w-full h-full object-cover ${isCoverNsfw ? 'blur-2xl' : ''}`}
          />
          {isCoverNsfw && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/60 text-pink-200 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-pink-400/30 flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                NSFW
              </span>
            </div>
          )}
        </div>

        {/* ===== 信息区 ===== */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 标题 + 状态徽章 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
              {comic.title}
            </h3>
            <span
              className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${COMIC_STATUS_COLORS[comic.status]}`}
            >
              {COMIC_STATUS_LABELS[comic.status]}
            </span>
          </div>

          {/* 作者 */}
          <p className="text-sm text-secondary mt-0.5">{comic.author}</p>

          {/* 简介 */}
          <p className="text-sm text-secondary/80 mt-2 line-clamp-2 flex-1">
            {comic.description || '暂无简介'}
          </p>

          {/* 元数据 */}
          <div className="flex items-center gap-3 mt-2 text-xs text-secondary/70">
            <span>共 {comic.chapters.length} 话</span>
            <span>·</span>
            <span>更新于 {formatDate(comic.updatedAt)}</span>
          </div>

          {/* ===== 小预览图 ===== */}
          {previewPages.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
              {previewPages.map((preview, idx) => (
                <div
                  key={`${preview.chapterId}-${idx}`}
                  className="relative w-10 h-14 sm:w-12 sm:h-16 flex-shrink-0 rounded-md overflow-hidden bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100/50 dark:border-pink-900/20 hover:border-pink-300 dark:hover:border-pink-700 transition cursor-pointer"
                  onClick={(e) => handlePreviewClick(preview.chapterId, e)}
                >
                  <img
                    src={BASE_PATH + preview.pageUrl}
                    alt={`预览 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {hasMorePreviews && extraCount > 0 && (
                <div className="w-10 h-14 sm:w-12 sm:h-16 flex-shrink-0 rounded-md bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100/50 dark:border-pink-900/20 flex items-center justify-center text-xs text-secondary font-medium">
                  +{extraCount}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}