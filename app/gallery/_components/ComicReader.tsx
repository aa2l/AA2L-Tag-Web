// app/gallery/_components/ComicReader.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown, Lock } from 'lucide-react';
import type { ComicSeries, ComicChapter, ComicPage, ReadingDirection } from '@/types/comic';
import { READING_DIRECTION_LABELS } from '@/types/comic';

// ===== 获取 basePath =====
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/AA2L-Tag-Web' : '';

interface ComicReaderProps {
  comic: ComicSeries;
  startChapterId?: string;
  isUnlocked: boolean;
  onClose: () => void;
  onUnlockClick: () => void;
}

export default function ComicReader({
  comic,
  startChapterId,
  isUnlocked,
  onClose,
  onUnlockClick,
}: ComicReaderProps) {
  // ===== 状态 =====
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [readerWidth, setReaderWidth] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);

  // ===== 条漫滚动进度 =====
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chapterDropdownRef = useRef<HTMLDivElement>(null);

  // ===== 获取当前章节 =====
  const chapters = comic.chapters;
  const currentChapter = chapters[currentChapterIndex] || null;
  const pages = currentChapter?.pages || [];
  const totalPages = pages.length;
  const readingDirection = comic.readingDirection || 'left-to-right';

  // ===== 初始化：确定起始章节 =====
  useEffect(() => {
    if (startChapterId) {
      const idx = chapters.findIndex((ch) => ch.id === startChapterId);
      if (idx !== -1) {
        setCurrentChapterIndex(idx);
        setCurrentPageIndex(0);
      }
    }
  }, [startChapterId, chapters]);

  // ===== 预加载图片获取尺寸（条漫模式需要） =====
  const getImageDimensions = useCallback((url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  }, []);

  // ===== 条漫模式：计算基准宽度 =====
  useEffect(() => {
    if (readingDirection !== 'top-to-bottom' || pages.length === 0) return;

    const loadDimensions = async () => {
      setIsPreloading(true);
      try {
        const dims = await Promise.all(
          pages.map((p) => getImageDimensions(BASE_PATH + p.url))
        );
        setPageDimensions(dims);

        // 计算众数宽度
        const widths = dims.map((d) => d.width).filter((w) => w > 0);
        if (widths.length === 0) return;

        // 统计频率
        const freq: Record<number, number> = {};
        for (const w of widths) {
          freq[w] = (freq[w] || 0) + 1;
        }

        // 找众数
        let maxCount = 0;
        let baseWidth = widths[0];
        for (const [w, count] of Object.entries(freq)) {
          if (count > maxCount) {
            maxCount = count;
            baseWidth = Number(w);
          }
        }

        // 限制最大宽度
        const maxDisplayWidth = window.innerWidth * 0.85;
        setReaderWidth(Math.min(baseWidth, maxDisplayWidth));
      } catch (error) {
        console.error('加载图片尺寸失败:', error);
      } finally {
        setIsPreloading(false);
        setIsLoading(false);
      }
    };

    loadDimensions();
  }, [pages, readingDirection, getImageDimensions]);

  // ===== 左右模式：直接显示 =====
  useEffect(() => {
    if (readingDirection !== 'top-to-bottom') {
      setIsLoading(false);
    }
  }, [readingDirection]);

  // ===== 点击外部关闭下拉 =====
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chapterDropdownRef.current && !chapterDropdownRef.current.contains(e.target as Node)) {
        setShowChapterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== 键盘事件 =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (readingDirection === 'top-to-bottom') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (readingDirection === 'left-to-right') goNext();
        else goPrev();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (readingDirection === 'left-to-right') goPrev();
        else goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, currentPageIndex, pages, readingDirection]);

  // ===== 翻页函数 =====
  const goNext = useCallback(() => {
    if (readingDirection === 'top-to-bottom') return;

    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentPageIndex(0);
    }
  }, [currentPageIndex, totalPages, currentChapterIndex, chapters.length, readingDirection]);

  const goPrev = useCallback(() => {
    if (readingDirection === 'top-to-bottom') return;

    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      const prevChapter = chapters[currentChapterIndex - 1];
      setCurrentPageIndex(prevChapter ? prevChapter.pages.length - 1 : 0);
    }
  }, [currentPageIndex, currentChapterIndex, chapters, readingDirection]);

  // ===== 切换章节 =====
  const switchChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setCurrentPageIndex(0);
    setShowChapterDropdown(false);
  };

  // ===== 获取当前页面的图片 URL（NSFW 保护） =====
  const getPageSrc = (page: ComicPage) => {
    const isNsfw = page.nsfw && !isUnlocked;
    const url = isNsfw ? page.blurUrl || page.url : page.url;
    return BASE_PATH + url;
  };

  const getPageNsfw = (page: ComicPage) => page.nsfw && !isUnlocked;

  // ===== 格式化进度 =====
  const getPageLabel = () => {
    if (!currentChapter) return '';
    const isNsfw = pages[currentPageIndex]?.nsfw && !isUnlocked;
    const label = `${currentPageIndex + 1} / ${totalPages}`;
    return isNsfw ? `🔒 ${label}` : label;
  };

  // ===== 条漫滚动进度监听 =====
  useEffect(() => {
    if (readingDirection !== 'top-to-bottom') return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = scrollHeight > clientHeight
        ? scrollTop / (scrollHeight - clientHeight)
        : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [readingDirection]);

  // ===== 加载完成 =====
  if (isLoading || isPreloading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-pink-300 border-t-pink-500 rounded-full animate-spin mb-4" />
          <p className="text-white/60 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // ===== 没有章节 =====
  if (!currentChapter || pages.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center text-white/60">
          <p className="text-lg mb-4">该漫画暂无内容</p>
          <button onClick={onClose} className="px-4 py-2 border border-white/20 rounded hover:bg-white/10 transition">
            返回
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 条漫模式
  // ============================================================
  if (readingDirection === 'top-to-bottom') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* ===== 顶部栏（极简） ===== */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-black/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-white/5">
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition p-1"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span>{comic.title}</span>
            <span className="text-white/40">·</span>
            <span>{currentChapter.title}</span>
          </div>
          {/* 章节切换（极简按钮） */}
          <div className="relative" ref={chapterDropdownRef}>
            <button
              onClick={() => setShowChapterDropdown(!showChapterDropdown)}
              className="text-white/60 hover:text-white transition text-sm flex items-center gap-1 p-1"
            >
              章节 <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showChapterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg py-1 min-w-[120px] max-h-48 overflow-y-auto z-20">
                {chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => switchChapter(idx)}
                    className={`w-full text-left px-3 py-1.5 text-sm transition ${
                      idx === currentChapterIndex
                        ? 'text-pink-400 bg-white/5'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {ch.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== 条漫内容（垂直滚动） ===== */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div
            className="mx-auto"
            style={{ width: readerWidth > 0 ? readerWidth : '85%' }}
          >
            {pages.map((page, idx) => {
              const isNsfw = getPageNsfw(page);
              const src = getPageSrc(page);
              return (
                <div key={idx} className="relative w-full">
                  <img
                    src={src}
                    alt={`${currentChapter.title} - ${idx + 1}`}
                    className={`w-full h-auto block ${isNsfw ? 'blur-2xl' : ''}`}
                    loading="lazy"
                  />
                  {isNsfw && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-black/60 text-pink-200 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-pink-400/30 flex items-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        NSFW
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-8" />
        </div>

        {/* ===== 底部进度条（极细） ===== */}
        <div className="flex-shrink-0 bg-black/50 backdrop-blur-sm px-4 py-2 flex items-center gap-3 border-t border-white/5">
          <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full transition-all duration-150"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="text-white/40 text-[10px] font-mono whitespace-nowrap">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // 左右模式（从左往右 / 从右往左）
  // ============================================================
  const currentPage = pages[currentPageIndex];
  const isNsfw = currentPage ? getPageNsfw(currentPage) : false;
  const pageSrc = currentPage ? getPageSrc(currentPage) : '';

  // 翻页方向
  const isRTL = readingDirection === 'right-to-left';
  const nextLabel = isRTL ? '上一页' : '下一页';
  const prevLabel = isRTL ? '下一页' : '上一页';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* ===== 顶部栏（极简） ===== */}
      <div className="flex-shrink-0 bg-black/50 backdrop-blur-sm px-3 py-2 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition p-1"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span>{comic.title}</span>
          <span className="text-white/30">·</span>
          <span>{currentChapter.title}</span>
          <span className="text-white/30">·</span>
          <span>{getPageLabel()}</span>
        </div>
        <div className="relative" ref={chapterDropdownRef}>
          <button
            onClick={() => setShowChapterDropdown(!showChapterDropdown)}
            className="text-white/50 hover:text-white transition text-xs flex items-center gap-1 p-1"
          >
            章节 <ChevronDown className="w-3 h-3" />
          </button>
          {showChapterDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg py-1 min-w-[120px] max-h-48 overflow-y-auto z-20">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => switchChapter(idx)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition ${
                    idx === currentChapterIndex
                      ? 'text-pink-400 bg-white/5'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== 图片区域 ===== */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
        onClick={(e) => {
          // 根据阅读方向决定点击区域
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const threshold = rect.width / 2;
          if (isRTL) {
            if (x < threshold) goNext();
            else goPrev();
          } else {
            if (x > threshold) goNext();
            else goPrev();
          }
        }}
      >
        {currentPage && (
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={pageSrc}
              alt={`${currentChapter.title} - ${currentPageIndex + 1}`}
              className={`max-h-[85vh] max-w-[85vw] object-contain ${isNsfw ? 'blur-2xl' : ''}`}
            />
            {isNsfw && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-black/60 text-pink-200 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-pink-400/30 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  NSFW
                </span>
              </div>
            )}
          </div>
        )}

        {/* ===== 左右翻页提示（极淡） ===== */}
        {totalPages > 1 && (
          <>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/10 text-xs pointer-events-none">
              {prevLabel}
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/10 text-xs pointer-events-none">
              {nextLabel}
            </div>
          </>
        )}
      </div>

      {/* ===== 底部进度条（极细） ===== */}
      <div className="flex-shrink-0 bg-black/30 backdrop-blur-sm px-4 py-2 flex items-center gap-3 border-t border-white/5">
        <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 rounded-full transition-all duration-300"
            style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
          />
        </div>
        <span className="text-white/30 text-[10px] font-mono whitespace-nowrap">
          {currentPageIndex + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
}