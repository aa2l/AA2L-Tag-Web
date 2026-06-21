// app/gallery/_components/ComicCard.tsx
'use client';

import { useState, useEffect } from 'react';
import type { ComicSeries } from '@/types/comic';
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

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // ===== 封面图片 URL =====
  const coverSrc = comic.coverNsfw && !isUnlocked
    ? comic.coverBlurImage || comic.coverImage
    : comic.coverThumbUrl || comic.coverImage;

  const coverUrl = BASE_PATH + coverSrc;
  const isCoverNsfw = comic.coverNsfw && !isUnlocked;

  // ===== 小预览图逻辑（返回完整信息） =====
  const getPreviewPages = (): {
    chapterId: string;
    pageUrl: string;
    thumbUrl: string;
    blurUrl: string;
    nsfw: boolean;
  }[] => {
    const previews: {
      chapterId: string;
      pageUrl: string;
      thumbUrl: string;
      blurUrl: string;
      nsfw: boolean;
    }[] = [];

    if (comic.chapters.length === 0) return previews;

    if (comic.chapters.length === 1) {
      const chapter = comic.chapters[0];
      for (let i = 0; i < Math.min(6, chapter.pages.length); i++) {
        const page = chapter.pages[i];
        previews.push({
          chapterId: chapter.id,
          pageUrl: page.url,
          thumbUrl: page.thumbUrl || page.url,
          blurUrl: page.blurUrl || '',
          nsfw: page.nsfw,
        });
      }
    } else {
      for (let i = 0; i < Math.min(6, comic.chapters.length); i++) {
        const chapter = comic.chapters[i];
        if (chapter.pages.length > 0) {
          const page = chapter.pages[0];
          previews.push({
            chapterId: chapter.id,
            pageUrl: page.url,
            thumbUrl: page.thumbUrl || page.url,
            blurUrl: page.blurUrl || '',
            nsfw: page.nsfw,
          });
        }
      }
    }

    return previews;
  };

  const previewPages = getPreviewPages();

  const totalPreviewCount = comic.chapters.length === 1
    ? comic.chapters[0]?.pages.length || 0
    : comic.chapters.length;

  const displayCount = Math.min(previewPages.length, 6);
  const hasMore = totalPreviewCount > displayCount;
  const extraCount = totalPreviewCount - displayCount;

  const cardStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(1.5rem)',
    transition: 'opacity 700ms cubic-bezier(0, 0, 0.2, 1), transform 700ms cubic-bezier(0, 0, 0.2, 1)',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ===== 点击封面 =====
  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      className="relative w-full bg-card-soft rounded-2xl overflow-hidden border border-pink-100 dark:border-pink-900/30 shadow-sm hover:shadow-lg hover:shadow-pink-200/30 dark:hover:shadow-pink-900/20 hover:-translate-y-1.5 transition-all duration-111700 ease-in-out cursor-pointer group h-full"
    >
      <div className="flex gap-4 p-4 h-full">
        {/* ===== 封面图 ===== */}
        <div
          className="flex-shrink-0 w-[50%] aspect-[2/3] rounded-lg overflow-hidden bg-pink-50/50 dark:bg-pink-900/10 relative cursor-pointer border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-400 transition-colors duration-200"
          onClick={handleCoverClick}
        >
          <img
            src={coverUrl}
            alt={comic.title}
            className={`w-full h-full object-cover ${isCoverNsfw ? 'blur-2xl' : ''}`}
            loading="lazy"
          />
          {isCoverNsfw && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-black/60 text-pink-200 px-2 py-0.5 rounded-full text-[9px] font-medium backdrop-blur-sm border border-pink-400/30 flex items-center gap-1">
                <Lock className="w-2 h-2" />
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
              className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-xs font-medium ${COMIC_STATUS_COLORS[comic.status]}`}
            >
              {COMIC_STATUS_LABELS[comic.status]}
            </span>
          </div>

          {/* 作者 */}
          <p className="text-sm text-secondary truncate">{comic.author}</p>

          {/* 简介 */}
          <p className="text-sm text-secondary/80 line-clamp-2 mt-1 leading-relaxed flex-1">
            {comic.description || '暂无简介'}
          </p>

          {/* 元数据 */}
          <div className="flex items-center gap-2 mt-1 text-xs text-secondary/70">
            <span>共 {comic.chapters.length} 话</span>
            <span>·</span>
            <span className="truncate">更新于 {formatDate(comic.updatedAt)}</span>
          </div>

          {/* 分割线 */}
          {previewPages.length > 0 && (
            <div className="w-full border-t border-pink-100/60 dark:border-pink-900/20 my-2" />
          )}

          {/* ===== 小预览图 ===== */}
          {previewPages.length > 0 && (
            <div className="grid grid-cols-6 gap-1.5">
              {previewPages.slice(0, 6).map((preview, idx) => {
                // ===== NSFW 保护：未解锁时显示模糊图 =====
                const isPreviewNsfw = preview.nsfw && !isUnlocked;
                const previewSrc = isPreviewNsfw
                  ? (preview.blurUrl || preview.thumbUrl || preview.pageUrl)
                  : (preview.thumbUrl || preview.pageUrl);

                return (
                  <div
                    key={`${preview.chapterId}-${idx}`}
                    className="relative aspect-[2/3] rounded-md overflow-hidden bg-pink-50/50 dark:bg-pink-900/10 border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-400 transition-colors duration-200 cursor-pointer"
                    onClick={(e) => handlePreviewClick(preview.chapterId, e)}
                  >
                    <img
                      src={BASE_PATH + previewSrc}
                      alt={`预览 ${idx + 1}`}
                      className={`w-full h-full object-cover ${isPreviewNsfw ? 'blur-xl' : ''}`}
                      loading="lazy"
                    />
                    {isPreviewNsfw && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-black/60 text-pink-200 text-[7px] px-1 py-0.5 rounded-full font-medium backdrop-blur-sm border border-pink-400/30 flex items-center gap-0.5">
                          <Lock className="w-2 h-2" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {hasMore && (
                <div className="relative aspect-[2/3] rounded-md bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100/50 dark:border-pink-900/20 flex items-center justify-center text-xs text-secondary font-medium">
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