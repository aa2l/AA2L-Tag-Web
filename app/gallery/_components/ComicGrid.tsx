// app/gallery/_components/ComicGrid.tsx
'use client';

import { useEffect, useRef } from 'react';
import type { ComicSeries } from '@/types/comic';
import ComicCard from './ComicCard';
import { BookOpen } from 'lucide-react';

const BATCH_SIZE = 6;

interface ComicGridProps {
  comics: ComicSeries[];
  isUnlocked: boolean;
  onOpenReader: (comic: ComicSeries, startChapterId?: string) => void;
  visibleCount: number;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

export default function ComicGrid({
  comics,
  isUnlocked,
  onOpenReader,
  visibleCount,
  onLoadMore,
  isLoadingMore,
  hasMore,
}: ComicGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // ===== 无限滚动触发 =====
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  const displayedComics = comics.slice(0, visibleCount);

  if (comics.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-card-soft/80 dark:bg-card-soft/60 backdrop-blur-sm rounded-3xl border-2 border-pink-100 dark:border-pink-900/30">
        <div className="flex justify-center mb-4">
          <BookOpen className="w-16 h-16 text-pink-200/50 dark:text-pink-500/20" />
        </div>
        <p className="text-lg font-medium text-foreground">暂无漫画</p>
        <p className="text-sm text-secondary mt-1">还没有上传任何漫画作品</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== 两栏网格布局 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedComics.map((comic, index) => (
          <ComicCard
            key={comic.id}
            comic={comic}
            isUnlocked={isUnlocked}
            onOpenReader={onOpenReader}
            delay={Math.min(index % 12, 8) * 60}
          />
        ))}
      </div>

      {/* 加载更多触发器 */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center items-center py-6 text-secondary text-sm"
        >
          {isLoadingMore ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-pink-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              加载中...
            </span>
          ) : (
            <span className="text-secondary/50 flex items-center gap-1.5">
              <span>✦</span>
              滚动加载更多
              <span>✦</span>
            </span>
          )}
        </div>
      )}

      {/* 全部加载完成 */}
      {!hasMore && comics.length > BATCH_SIZE && (
        <div className="text-center py-6 text-secondary/50 text-sm">
          — ✦ 已加载全部 {comics.length} 部漫画 ✦ —
        </div>
      )}
    </div>
  );
}