// app/gallery/_components/ComicReader.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, ChevronDown, Lock } from 'lucide-react';
import type { ComicSeries, ComicPage, ReadingDirection } from '@/types/comic';

// ===== 获取 basePath =====
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/AA2L-Tag-Web' : '';

interface ComicReaderProps {
  comic: ComicSeries;
  startChapterId?: string;
  isUnlocked: boolean;
  onClose: () => void;
  onUnlockClick: () => void;
}

// ===== 缩放步进配置 =====
const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5];

type ReaderPage =
  | { type: 'cover'; url: string; blurUrl: string; nsfw: boolean }
  | { type: 'page'; chapterId: string; page: ComicPage };

export default function ComicReader({
  comic,
  startChapterId,
  isUnlocked,
  onClose,
  onUnlockClick,
}: ComicReaderProps) {
  // ===== 状态 =====
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [readerWidth, setReaderWidth] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(() => {
  // 条漫默认 50%，左右模式默认 100%
  return comic.readingDirection === 'top-to-bottom' ? 0.5 : 1;
});
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chapterDropdownRef = useRef<HTMLDivElement>(null);

  const readingDirection = comic.readingDirection || 'left-to-right';

  // ===== 构建完整的页面列表：封面 + 所有章节的所有页面 =====
  const allPages = useMemo(() => {
    const pages: ReaderPage[] = [];

    // 1. 封面
    const coverNsfw = comic.coverNsfw && !isUnlocked;
    pages.push({
      type: 'cover',
      url: coverNsfw ? comic.coverBlurImage || comic.coverImage : comic.coverImage,
      blurUrl: comic.coverBlurImage || comic.coverImage,
      nsfw: comic.coverNsfw && !isUnlocked,
    });

    // 2. 所有章节的页面
    for (const chapter of comic.chapters) {
      for (const page of chapter.pages) {
        pages.push({
          type: 'page',
          chapterId: chapter.id,
          page,
        });
      }
    }

    return pages;
  }, [comic, isUnlocked]);

  // ===== 构建章节映射 =====
  const chapterStartIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 1; // 封面占索引 0
    for (const chapter of comic.chapters) {
      map.set(chapter.id, idx);
      idx += chapter.pages.length;
    }
    return map;
  }, [comic.chapters]);

  // ===== 初始化：确定起始页 =====
  useEffect(() => {
    if (startChapterId && chapterStartIndexMap.has(startChapterId)) {
      const startIndex = chapterStartIndexMap.get(startChapterId)!;
      setCurrentPageIndex(startIndex);
    } else {
      setCurrentPageIndex(0);
    }
  }, [startChapterId, chapterStartIndexMap]);

  // ===== 获取当前页 =====
  const currentPage = allPages[currentPageIndex] || null;
  const totalPages = allPages.length;

  // ===== 获取当前章节 =====
  const getCurrentChapter = useCallback(() => {
    if (!currentPage) return null;
    if (currentPage.type === 'cover') return null;
    return comic.chapters.find((ch) => ch.id === currentPage.chapterId) || null;
  }, [currentPage, comic.chapters]);

  const currentChapter = getCurrentChapter();

  // ===== 判断当前页是否 NSFW =====
  const isCurrentPageNsfw = useCallback(() => {
    if (!currentPage) return false;
    if (currentPage.type === 'cover') return currentPage.nsfw;
    return currentPage.page.nsfw && !isUnlocked;
  }, [currentPage, isUnlocked]);

  // ===== 获取当前页图片 URL =====
  const getCurrentPageSrc = useCallback(() => {
    if (!currentPage) return '';
    if (currentPage.type === 'cover') {
      return BASE_PATH + currentPage.url;
    }
    const page = currentPage.page;
    const isNsfw = page.nsfw && !isUnlocked;
    const url = isNsfw ? page.blurUrl || page.url : page.url;
    return BASE_PATH + url;
  }, [currentPage, isUnlocked]);

  // ===== 获取任意页的图片 URL（条漫模式使用） =====
  const getPageSrc = useCallback((readerPage: ReaderPage) => {
    if (readerPage.type === 'cover') {
      const isNsfw = readerPage.nsfw;
      return BASE_PATH + (isNsfw ? readerPage.blurUrl : readerPage.url);
    }
    const page = readerPage.page;
    const isNsfw = page.nsfw && !isUnlocked;
    const url = isNsfw ? page.blurUrl || page.url : page.url;
    return BASE_PATH + url;
  }, [isUnlocked]);

  const isPageNsfw = useCallback((readerPage: ReaderPage) => {
    if (readerPage.type === 'cover') return readerPage.nsfw;
    return readerPage.page.nsfw && !isUnlocked;
  }, [isUnlocked]);

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
    if (readingDirection !== 'top-to-bottom' || allPages.length === 0) return;

    let isMounted = true;

    const loadDimensions = async () => {
      setIsPreloading(true);
      try {
        const dims = await Promise.all(
          allPages.map((p) => getImageDimensions(getPageSrc(p)))
        );
        if (!isMounted) return;
        setPageDimensions(dims);

        const widths = dims.map((d) => d.width).filter((w) => w > 0);
        if (widths.length === 0) return;

        const freq: Record<number, number> = {};
        for (const w of widths) {
          freq[w] = (freq[w] || 0) + 1;
        }

        let maxCount = 0;
        let baseWidth = widths[0];
        for (const [w, count] of Object.entries(freq)) {
          if (count > maxCount) {
            maxCount = count;
            baseWidth = Number(w);
          }
        }

        const maxDisplayWidth = window.innerWidth * 0.85;
        if (isMounted) {
          setReaderWidth(Math.min(baseWidth, maxDisplayWidth));
        }
      } catch (error) {
        console.error('加载图片尺寸失败:', error);
      } finally {
        if (isMounted) {
          setIsPreloading(false);
          setIsLoading(false);
        }
      }
    };

    loadDimensions();

    return () => {
      isMounted = false;
    };
  }, [allPages, readingDirection, getImageDimensions, getPageSrc]);

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

  // ===== 缩放控制函数 =====
  const zoomIn = useCallback(() => {
    const next = ZOOM_STEPS.find((z) => z > zoomLevel + 0.01);
    if (next) setZoomLevel(next);
  }, [zoomLevel]);

  const zoomOut = useCallback(() => {
    const prev = [...ZOOM_STEPS].reverse().find((z) => z < zoomLevel - 0.01);
    if (prev) setZoomLevel(prev);
  }, [zoomLevel]);

  const resetZoom = useCallback(() => setZoomLevel(1), []);

  // ===== 翻页函数 =====
  const goNext = useCallback(() => {
    if (readingDirection === 'top-to-bottom') return;
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  }, [currentPageIndex, totalPages, readingDirection]);

  const goPrev = useCallback(() => {
    if (readingDirection === 'top-to-bottom') return;
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  }, [currentPageIndex, readingDirection]);

  // ===== 跳转到指定章节 =====
  const switchChapter = useCallback((chapterId: string) => {
    const startIndex = chapterStartIndexMap.get(chapterId);
    if (startIndex !== undefined) {
      setCurrentPageIndex(startIndex);
      setShowChapterDropdown(false);
    }
  }, [chapterStartIndexMap]);

  // ===== 格式化进度 =====
  const getPageLabel = useCallback(() => {
    const isNsfw = isCurrentPageNsfw();
    const label = `${currentPageIndex + 1} / ${totalPages}`;
    if (currentPage?.type === 'cover') {
      return isNsfw ? `🔒 封面` : `封面`;
    }
    return isNsfw ? `🔒 ${label}` : label;
  }, [currentPage, currentPageIndex, totalPages, isCurrentPageNsfw]);

  // ===== 条漫滚动进度监听 =====
  useEffect(() => {
    if (readingDirection !== 'top-to-bottom') return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [readingDirection]);

  // ===== 键盘事件 =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
        return;
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
      }
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        resetZoom();
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
  }, [onClose, readingDirection, goNext, goPrev, zoomIn, zoomOut, resetZoom]);

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

  // ===== 没有内容 =====
  if (allPages.length === 0) {
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
    const displayWidth = readerWidth > 0 ? readerWidth : '85%';

    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* 顶部栏 */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-black/70 backdrop-blur-sm px-3 py-2 flex items-center justify-between border-b border-white/5">
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition p-1"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="truncate max-w-[120px]">{comic.title}</span>
            <span className="text-white/30">·</span>
            <span className="truncate max-w-[80px]">
              {currentPage?.type === 'cover' ? '封面' : currentChapter?.title || '加载中...'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= ZOOM_STEPS[0]}
              className="text-white/50 hover:text-white transition disabled:opacity-30 text-sm px-1.5"
              aria-label="缩小"
            >
              −
            </button>
            <span className="text-white/50 text-[10px] min-w-[32px] text-center font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoomLevel >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              className="text-white/50 hover:text-white transition disabled:opacity-30 text-sm px-1.5"
              aria-label="放大"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="text-white/30 hover:text-white/60 transition text-[10px] px-1"
              aria-label="重置缩放"
            >
              ⟲
            </button>
          </div>

          <div className="relative" ref={chapterDropdownRef}>
            <button
              onClick={() => setShowChapterDropdown(!showChapterDropdown)}
              className="text-white/50 hover:text-white transition text-xs flex items-center gap-1 p-1"
            >
              章节 <ChevronDown className="w-3 h-3" />
            </button>
            {showChapterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg py-1 min-w-[100px] max-h-48 overflow-y-auto z-20">
                <button
                  onClick={() => { setCurrentPageIndex(0); setShowChapterDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition ${
                    currentPageIndex === 0
                      ? 'text-pink-400 bg-white/5'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  封面
                </button>
                {comic.chapters.map((ch) => {
                  const startIdx = chapterStartIndexMap.get(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => switchChapter(ch.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs transition ${
                        currentPageIndex >= startIdx! && currentPageIndex < startIdx! + ch.pages.length
                          ? 'text-pink-400 bg-white/5'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {ch.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div
            className="mx-auto transition-transform duration-200 ease-out origin-top"
            style={{
              width: typeof displayWidth === 'number' ? displayWidth : displayWidth,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
            }}
          >
            {allPages.map((readerPage, idx) => {
              const isNsfw = isPageNsfw(readerPage);
              const src = getPageSrc(readerPage);
              const label = readerPage.type === 'cover' ? '封面' : `Page ${idx}`;
              return (
                <div key={idx} className="relative w-full">
                  <img
                    src={src}
                    alt={label}
                    className={`w-full h-auto block ${isNsfw ? 'blur-2xl' : ''}`}
                    loading="lazy"
                  />
                  {isNsfw && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-black/60 text-pink-200 px-2 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm border border-pink-400/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
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

        <div className="flex-shrink-0 bg-black/50 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2 border-t border-white/5">
          <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full transition-all duration-150"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="text-white/30 text-[9px] font-mono whitespace-nowrap">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // 左右模式
  // ============================================================
  const isNsfw = currentPage ? isPageNsfw(currentPage) : false;
  const pageSrc = currentPage ? getPageSrc(currentPage) : '';

  const isRTL = readingDirection === 'right-to-left';
  const nextLabel = isRTL ? '上一页' : '下一页';
  const prevLabel = isRTL ? '下一页' : '上一页';

  const imageScaleStyle: React.CSSProperties = {
    transform: `scale(${zoomLevel})`,
    transition: 'transform 200ms ease-out',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* 顶部栏 */}
      <div className="flex-shrink-0 bg-black/50 backdrop-blur-sm px-3 py-2 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition p-1"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-[10px] text-white/40">
          <span className="truncate max-w-[80px]">{comic.title}</span>
          <span className="text-white/20">·</span>
          <span className="truncate max-w-[60px]">
            {currentPage?.type === 'cover' ? '封面' : currentChapter?.title || '加载中...'}
          </span>
          <span className="text-white/20">·</span>
          <span>{getPageLabel()}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={zoomLevel <= ZOOM_STEPS[0]}
            className="text-white/50 hover:text-white transition disabled:opacity-30 text-sm px-1.5"
            aria-label="缩小"
          >
            −
          </button>
          <span className="text-white/50 text-[10px] min-w-[32px] text-center font-mono">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={zoomLevel >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
            className="text-white/50 hover:text-white transition disabled:opacity-30 text-sm px-1.5"
            aria-label="放大"
          >
            +
          </button>
          <button
            onClick={resetZoom}
            className="text-white/30 hover:text-white/60 transition text-[10px] px-1"
            aria-label="重置缩放"
          >
            ⟲
          </button>
        </div>

        <div className="relative" ref={chapterDropdownRef}>
          <button
            onClick={() => setShowChapterDropdown(!showChapterDropdown)}
            className="text-white/50 hover:text-white transition text-[10px] flex items-center gap-1 p-1"
          >
            章节 <ChevronDown className="w-2.5 h-2.5" />
          </button>
          {showChapterDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg py-1 min-w-[100px] max-h-48 overflow-y-auto z-20">
              <button
                onClick={() => { setCurrentPageIndex(0); setShowChapterDropdown(false); }}
                className={`w-full text-left px-3 py-1.5 text-[11px] transition ${
                  currentPageIndex === 0
                    ? 'text-pink-400 bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                封面
              </button>
              {comic.chapters.map((ch) => {
                const startIdx = chapterStartIndexMap.get(ch.id);
                return (
                  <button
                    key={ch.id}
                    onClick={() => switchChapter(ch.id)}
                    className={`w-full text-left px-3 py-1.5 text-[11px] transition ${
                      currentPageIndex >= startIdx! && currentPageIndex < startIdx! + ch.pages.length
                        ? 'text-pink-400 bg-white/5'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {ch.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 图片区域 */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
        onClick={(e) => {
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
          <div className="relative flex items-center justify-center w-full h-full">
            <img
              src={pageSrc}
              alt={currentPage.type === 'cover' ? '封面' : `Page ${currentPageIndex}`}
              className={`max-h-[85vh] max-w-[85vw] object-contain ${isNsfw ? 'blur-2xl' : ''}`}
              style={imageScaleStyle}
            />
            {isNsfw && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={imageScaleStyle}
              >
                <span className="bg-black/60 text-pink-200 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-pink-400/30 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  NSFW
                </span>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/5 text-[10px] pointer-events-none">
              {prevLabel}
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/5 text-[10px] pointer-events-none">
              {nextLabel}
            </div>
          </>
        )}
      </div>

      {/* 底部进度条 */}
      <div className="flex-shrink-0 bg-black/30 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2 border-t border-white/5">
        <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 rounded-full transition-all duration-300"
            style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
          />
        </div>
        <span className="text-white/25 text-[9px] font-mono whitespace-nowrap">
          {currentPageIndex + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
}