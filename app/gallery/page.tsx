// app/gallery/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import {
  Image as ImageIcon,
  Lock,
  Sparkles,
  Settings,
  ChevronUp,
  Eye,
  Search,
  BookOpen,
} from 'lucide-react';
import { useGallery } from './_hooks/useGallery';
import { useComics } from './_hooks/useComics';
import {
  ModelTabs,
  SearchBar,
  ImageCard,
  ImageModal,
  KeyDialog,
} from './_components';
import ComicGrid from './_components/ComicGrid';
import ComicReader from './_components/ComicReader';
import type { ComicSeries } from '@/types/comic';

const BATCH_SIZE = 6;

type ContentType = 'gallery' | 'comics';

// ===== 排序选项定义（使用 as const 确保类型字面量） =====
const IMAGE_SORT_OPTIONS = [
  { value: 'newest' as const, label: '最新' },
  { value: 'oldest' as const, label: '最旧' },
  { value: 'random' as const, label: '随机' },
];

const COMIC_SORT_OPTIONS = [
  { value: 'newest' as const, label: '最新更新' },
  { value: 'oldest' as const, label: '最早更新' },
  { value: 'title' as const, label: '按作品名' },
];

export default function Gallery() {
  // ============================================================
  // 图片画廊状态（原有）
  // ============================================================
  const {
    images,
    searchedAndSortedImages,
    currentModel,
    setCurrentModel,
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    selectedImage,
    openModal,
    closeModal,
    isUnlocked,
    showKeyDialog,
    setShowKeyDialog,
    keyInput,
    setKeyInput,
    keyError,
    handleUnlock,
    handleLock,
  } = useGallery();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [version, setVersion] = useState(0);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);

  // ============================================================
  // 漫画状态（新增）
  // ============================================================
  const {
    filteredAndSortedComics,
    searchTerm: comicSearchTerm,
    setSearchTerm: setComicSearchTerm,
    sortType: comicSortType,
    setSortType: setComicSortType,
  } = useComics();

  const [comicVisibleCount, setComicVisibleCount] = useState(BATCH_SIZE);
  const [isComicLoadingMore, setIsComicLoadingMore] = useState(false);
  const comicLoadMoreRef = useRef<HTMLDivElement>(null);
  const [comicVersion, setComicVersion] = useState(0);

  // 阅读器状态
  const [readerComic, setReaderComic] = useState<ComicSeries | null>(null);
  const [readerStartChapterId, setReaderStartChapterId] = useState<string | undefined>(undefined);

  // ============================================================
  // 内容类型切换（一级导航）
  // ============================================================
  const [contentType, setContentType] = useState<ContentType>('gallery');

  // 切换内容时重置分页
  useEffect(() => {
    if (contentType === 'gallery') {
      setVisibleCount(BATCH_SIZE);
      setVersion((v) => v + 1);
    } else {
      setComicVisibleCount(BATCH_SIZE);
      setComicVersion((v) => v + 1);
    }
  }, [contentType]);

  // ============================================================
  // 图片画廊逻辑（原有，保持不变）
  // ============================================================
  const breakpointColumns = {
    default: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  const prevSearchState = useRef({ searchTerm, sortType, currentModel });

  useEffect(() => {
    const hasChanged =
      prevSearchState.current.searchTerm !== searchTerm ||
      prevSearchState.current.sortType !== sortType ||
      prevSearchState.current.currentModel !== currentModel;

    if (hasChanged) {
      setVisibleCount(0);
      setVersion((v) => v + 1);
      setTimeout(() => {
        setVisibleCount(BATCH_SIZE);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
      prevSearchState.current = { searchTerm, sortType, currentModel };
    }
  }, [searchTerm, sortType, currentModel]);

  useEffect(() => {
    if (visibleCount > searchedAndSortedImages.length) {
      setVisibleCount(Math.min(searchedAndSortedImages.length, BATCH_SIZE));
    }
  }, [searchedAndSortedImages.length, visibleCount]);

  const displayedImages = searchedAndSortedImages.slice(0, visibleCount);
  const hasMore = visibleCount < searchedAndSortedImages.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, searchedAndSortedImages.length));
      setIsLoadingMore(false);
    }, 200);
  }, [hasMore, isLoadingMore, searchedAndSortedImages.length]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
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
  }, [hasMore, isLoadingMore, loadMore]);

  // ============================================================
  // 漫画滚动加载逻辑（新增）
  // ============================================================
  const displayedComics = filteredAndSortedComics.slice(0, comicVisibleCount);
  const hasComicMore = comicVisibleCount < filteredAndSortedComics.length;

  const loadComicMore = useCallback(() => {
    if (!hasComicMore || isComicLoadingMore) return;
    setIsComicLoadingMore(true);
    setTimeout(() => {
      setComicVisibleCount((prev) =>
        Math.min(prev + BATCH_SIZE, filteredAndSortedComics.length)
      );
      setIsComicLoadingMore(false);
    }, 200);
  }, [hasComicMore, isComicLoadingMore, filteredAndSortedComics.length]);

  useEffect(() => {
    if (!comicLoadMoreRef.current || !hasComicMore || isComicLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadComicMore();
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1,
      }
    );
    observer.observe(comicLoadMoreRef.current);
    return () => observer.disconnect();
  }, [hasComicMore, isComicLoadingMore, loadComicMore]);

  // ============================================================
  // 主题切换
  // ============================================================
  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
  };

  // ============================================================
  // 滚动回到顶部
  // ============================================================
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ============================================================
  // 键盘快捷键（图片弹窗）
  // ============================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        closeModal();
      }
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && selectedImage) {
        const currentIndex = searchedAndSortedImages.findIndex(
          (img) => img.id === selectedImage.id
        );
        if (currentIndex === -1) return;
        let newIndex: number;
        if (e.key === 'ArrowLeft') {
          newIndex = currentIndex - 1 < 0 ? searchedAndSortedImages.length - 1 : currentIndex - 1;
        } else {
          newIndex = currentIndex + 1 >= searchedAndSortedImages.length ? 0 : currentIndex + 1;
        }
        openModal(searchedAndSortedImages[newIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, searchedAndSortedImages, openModal, closeModal]);

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = searchedAndSortedImages.findIndex(
      (img) => img.id === selectedImage.id
    );
    if (currentIndex === -1) return;
    const newIndex = currentIndex - 1 < 0 ? searchedAndSortedImages.length - 1 : currentIndex - 1;
    openModal(searchedAndSortedImages[newIndex]);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = searchedAndSortedImages.findIndex(
      (img) => img.id === selectedImage.id
    );
    if (currentIndex === -1) return;
    const newIndex = currentIndex + 1 >= searchedAndSortedImages.length ? 0 : currentIndex + 1;
    openModal(searchedAndSortedImages[newIndex]);
  };

  // ============================================================
  // 漫画阅读器操作（新增）
  // ============================================================
  const handleOpenReader = (comic: ComicSeries, startChapterId?: string) => {
    setReaderComic(comic);
    setReaderStartChapterId(startChapterId);
  };

  const handleCloseReader = () => {
    setReaderComic(null);
    setReaderStartChapterId(undefined);
  };

  // ============================================================
  // 筛选清除
  // ============================================================
  const hasFilters = searchTerm.trim() !== '' || currentModel !== 'all';
  const hasComicFilters = comicSearchTerm.trim() !== '';

  const clearAllFilters = () => {
    setSearchTerm('');
    setCurrentModel('all');
  };

  const clearComicFilters = () => {
    setComicSearchTerm('');
  };

  const toggleToolbar = () => {
    setIsToolbarExpanded((prev) => !prev);
  };

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <div className="min-h-screen bg-soft-noise">
      {/* 题头 */}
      <div
        className="header-gradient py-8 text-center relative overflow-hidden"
        onClick={toggleTheme}
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            「 AA2l图书馆 」
          </h2>
          <p className="header-sub">点击切换主题</p>
          <p className="text-sm text-secondary dark:text-secondary mt-1">"为学，为作，为突破"</p>
        </div>
      </div>

      {/* ============================================================
      工具栏
      ============================================================ */}
      <div className="sticky top-0 z-40 toolbar-glass">
        <div className="max-w-7xl mx-auto px-4 py-2">
          {/* 一级导航 + 操作按钮 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* 一级导航：内容类型切换 */}
              <div className="flex items-center gap-1 bg-pink-50/50 dark:bg-pink-900/10 rounded-full p-0.5 border border-pink-100/50 dark:border-pink-900/20">
                <button
                  onClick={() => setContentType('gallery')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5 ${
                    contentType === 'gallery'
                      ? 'bg-pink-200 dark:bg-pink-700/40 text-pink-700 dark:text-pink-200 shadow-sm'
                      : 'text-secondary hover:text-foreground hover:bg-pink-100/50 dark:hover:bg-pink-900/20'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  图片画廊
                </button>
                <button
                  onClick={() => setContentType('comics')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5 ${
                    contentType === 'comics'
                      ? 'bg-pink-200 dark:bg-pink-700/40 text-pink-700 dark:text-pink-200 shadow-sm'
                      : 'text-secondary hover:text-foreground hover:bg-pink-100/50 dark:hover:bg-pink-900/20'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  漫画
                </button>
              </div>

              {/* 工具栏折叠按钮 */}
              <button
                onClick={toggleToolbar}
                className="p-1 text-secondary hover:text-foreground transition-transform duration-300"
                aria-label={isToolbarExpanded ? '收起工具栏' : '展开工具栏'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform duration-300 ${
                    isToolbarExpanded ? 'rotate-0' : 'rotate-180'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {isUnlocked ? (
                <button
                  onClick={handleLock}
                  className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-800/30 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  关闭NSFW
                </button>
              ) : (
                <button
                  onClick={() => setShowKeyDialog(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 rounded-full text-sm hover:bg-pink-200 dark:hover:bg-pink-800/30 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  阅览NSFW
                </button>
              )}
              <Link
                href="/admin"
                className="text-sm text-pink-500 dark:text-pink-400 hover:underline whitespace-nowrap flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                管理
              </Link>
            </div>
          </div>

          {/* 二级工具栏 */}
          <div
            className={`transition-all duration-300 ease-out ${
              isToolbarExpanded ? 'max-h-[120px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 pb-1">
              {/* ===== 图片模式：ModelTabs ===== */}
              {contentType === 'gallery' && (
                <div className="flex-shrink-0">
                  <ModelTabs currentModel={currentModel} setCurrentModel={setCurrentModel} />
                </div>
              )}

              {/* ===== 搜索栏（共用组件，不同状态） ===== */}
<div className="flex-1 min-w-[200px]">
  {contentType === 'gallery' ? (
    <SearchBar<'newest' | 'oldest' | 'random'>
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      sortType={sortType}
      setSortType={setSortType}
      sortOptions={IMAGE_SORT_OPTIONS}
      placeholder="搜索作者、模型或提示词..."
    />
  ) : (
    <SearchBar<'newest' | 'oldest' | 'title'>
      searchTerm={comicSearchTerm}
      setSearchTerm={setComicSearchTerm}
      sortType={comicSortType}
      setSortType={setComicSortType}
      sortOptions={COMIC_SORT_OPTIONS}
      placeholder="搜索漫画名称或作者..."
    />
  )}
</div>

            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
      内容区域
      ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {contentType === 'gallery' ? (
          // ===== 图片画廊 =====
          searchedAndSortedImages.length === 0 ? (
            <div className="text-center py-16 px-4 bg-card-soft/80 dark:bg-card-soft/60 backdrop-blur-sm rounded-3xl border-2 border-pink-100 dark:border-pink-900/30 shadow-pink-100/30 dark:shadow-pink-900/20">
              <div className="text-6xl mb-4 flex justify-center">
                {images.length === 0 ? (
                  <Sparkles className="w-16 h-16 text-pink-300" />
                ) : (
                  <Search className="w-16 h-16 text-secondary" />
                )}
              </div>
              <p className="text-lg font-medium text-foreground flex items-center justify-center gap-2">
                {images.length === 0 ? (
                  <>
                    <Sparkles className="w-5 h-5 text-pink-300" />
                    暂无图片
                    <Sparkles className="w-5 h-5 text-pink-300" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-pink-300" />
                    没有匹配的图片
                    <Sparkles className="w-5 h-5 text-pink-300" />
                  </>
                )}
              </p>
              {hasFilters && images.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 text-sm text-pink-500 hover:text-pink-700 border-2 border-pink-200 rounded-full hover:bg-pink-50 transition flex items-center gap-1.5 mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  清除所有筛选条件
                </button>
              )}
            </div>
          ) : (
            <>
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {displayedImages.map((img, index) => (
                  <div key={`${img.id}-${version}`} className="mb-4">
                    <ImageCard
                      img={img}
                      isUnlocked={isUnlocked}
                      onClick={() => openModal(img)}
                      delay={Math.min(index % 12, 8) * 60}
                    />
                  </div>
                ))}
              </Masonry>

              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center items-center py-8 text-secondary text-sm"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      加载中...
                    </span>
                  ) : (
                    <span className="text-secondary/50 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      滚动加载更多 ✦
                    </span>
                  )}
                </div>
              )}

              {!hasMore && searchedAndSortedImages.length > BATCH_SIZE && (
                <div className="text-center py-6 text-secondary/50 text-sm">
                  — ✦ 已加载全部 {searchedAndSortedImages.length} 张图片 ✦ —
                </div>
              )}
            </>
          )
        ) : (
          // ===== 漫画列表 =====
          <ComicGrid
            comics={displayedComics}
            isUnlocked={isUnlocked}
            onOpenReader={handleOpenReader}
            visibleCount={comicVisibleCount}
            onLoadMore={loadComicMore}
            isLoadingMore={isComicLoadingMore}
            hasMore={hasComicMore}
          />
        )}
      </div>

      {/* ============================================================
      回到顶部
      ============================================================ */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-pink-400 text-white rounded-full shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30 hover:bg-pink-500 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
          aria-label="回到顶部"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      {/* ============================================================
      图片弹窗（原有）
      ============================================================ */}
      <ImageModal
        selectedImage={selectedImage}
        isUnlocked={isUnlocked}
        onClose={closeModal}
        onUnlockClick={() => setShowKeyDialog(true)}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
        totalCount={searchedAndSortedImages.length}
      />

      {/* ============================================================
      NSFW 密钥弹窗（原有）
      ============================================================ */}
      <KeyDialog
        isOpen={showKeyDialog}
        keyInput={keyInput}
        setKeyInput={setKeyInput}
        keyError={keyError}
        onConfirm={handleUnlock}
        onCancel={() => setShowKeyDialog(false)}
      />

      {/* ============================================================
      漫画阅读器（新增）
      ============================================================ */}
      {readerComic && (
        <ComicReader
          comic={readerComic}
          startChapterId={readerStartChapterId}
          isUnlocked={isUnlocked}
          onClose={handleCloseReader}
          onUnlockClick={() => setShowKeyDialog(true)}
        />
      )}
    </div>
  );
}