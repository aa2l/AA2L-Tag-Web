'use client';

import { ImageRecord } from '../types';
import { MODEL_LABELS } from '../constants';
import ParamRenderer from './ParamRenderers';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  selectedImage: ImageRecord | null;
  isUnlocked: boolean;
  onClose: () => void;
  onUnlockClick: () => void;
  onPrev: () => void;
  onNext: () => void;
  totalCount: number;
}

export default function ImageModal({
  selectedImage,
  isUnlocked,
  onClose,
  onUnlockClick,
  onPrev,
  onNext,
  totalCount,
}: ImageModalProps) {
  if (!selectedImage) return null;

  const img = selectedImage;
  const isNsfw = img.nsfw && !isUnlocked;

  // ========== 核心：根据解锁状态决定用哪张图 ==========
  const imageSrc = isNsfw ? img.blur_image_url : img.image_url;
  const modalImageClass = isNsfw ? 'blur-2xl' : '';

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeIn"
      onClick={onClose}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-pink-300/10 dark:bg-pink-400/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-primary-300/10 dark:bg-primary-400/5 blur-3xl" />
      </div>

      <div
        className="relative bg-card-soft dark:bg-card-soft rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-pink-200/30 dark:shadow-pink-900/30 animate-scaleIn border-2 border-pink-100 dark:border-pink-900/30"
        style={{ backgroundColor: 'var(--color-card-soft, #FFFFFF)' }}
        onClick={handleContentClick}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-300 via-primary-300 to-pink-300" />

        {/* 顶部栏 */}
        <div className="sticky top-0 bg-card-soft/90 dark:bg-card-soft/90 backdrop-blur-sm p-4 border-b border-pink-100 dark:border-pink-900/20 flex justify-between items-center z-10">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold"> 详情</span>
            <span className="text-sm text-secondary"> {img.author}</span>
            <span className="text-xs bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-full border border-pink-100 dark:border-pink-900/30">
              {MODEL_LABELS[img.model]}
            </span>
            {img.nsfw && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                NSFW
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* 图片区域 */}
          <div className="flex flex-col items-center relative">
            {totalCount > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-pink-500/60 text-white hover:bg-pink-600/80 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                  aria-label="上一张"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-pink-500/60 text-white hover:bg-pink-600/80 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                  aria-label="下一张"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="relative w-full bg-pink-50/30 dark:bg-pink-900/10 rounded-2xl overflow-hidden shadow-inner">
              <img
                src={imageSrc}
                alt={img.author}
                className={`w-full h-auto max-h-[70vh] object-contain transition-opacity duration-300 ${modalImageClass}`}
              />
              {isNsfw && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 text-pink-200 px-6 py-3 rounded-full text-center backdrop-blur-sm border border-pink-400/30">
                    <p className="text-lg font-bold"> 内容已模糊 </p>
                  </div>
                </div>
              )}
            </div>
            {img.nsfw && !isUnlocked && (
              <div className="mt-4 w-full flex justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onUnlockClick(); }}
                  className="px-3 py-1.5 text-sm border-2 border-pink-400 dark:border-pink-400/60 text-pink-500 dark:text-pink-300 rounded-full hover:shadow-md hover:shadow-pink-200/50 dark:hover:shadow-pink-800/30 transition-all duration-200"
                >
                  输入密钥查看NSFW
                </button>
              </div>
            )}
            {img.nsfw && isUnlocked && (
              <div className="mt-2 text-pink-500 dark:text-pink-300 text-sm"> 已解锁</div>
            )}
            {totalCount > 1 && (
              <div className="flex lg:hidden gap-4 mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="px-4 py-2 bg-pink-500/60 text-white rounded-full hover:bg-pink-600/80 transition"
                  aria-label="上一张"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="px-4 py-2 bg-pink-500/60 text-white rounded-full hover:bg-pink-600/80 transition"
                  aria-label="下一张"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* 参数区域 */}
          <div className="overflow-y-auto max-h-[70vh]">
            <h3 className="text-lg font-semibold mb-3"> 生成参数 </h3>
            <ParamRenderer model={img.model} params={img.params} />
          </div>
        </div>
      </div>
    </div>
  );
}