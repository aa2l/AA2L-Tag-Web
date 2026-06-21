// app/types/comic.ts

export type ComicStatus = 'ongoing' | 'completed';

/**
 * 阅读方向
 */
export type ReadingDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom';

/**
 * 漫画页面（单页）
 */
export interface ComicPage {
  /** 原图路径 */
  url: string;
  /** 模糊图路径（用于 NSFW 保护） */
  blurUrl: string;
  thumbUrl: string;  // ← 新增：缩略图 URL
  /** 是否标记为 NSFW */
  nsfw: boolean;
}

/**
 * 漫画章节
 */
export interface ComicChapter {
  id: string;
  title: string;
  /** 页面列表（按顺序） */
  pages: ComicPage[];
  createdAt: string;
}

/**
 * 漫画系列
 */
export interface ComicSeries {
  id: string;
  title: string;
  author: string;
  description: string;
  /** 封面原图路径 */
  coverImage: string;
  /** 封面模糊图路径（用于 NSFW 保护） */
  coverBlurImage: string;
  /** 封面是否标记为 NSFW */
  coverNsfw: boolean;
  /** 阅读方向 */
  readingDirection: ReadingDirection;
  coverThumbUrl: string;
  status: ComicStatus;
  createdAt: string;
  updatedAt: string;
  chapters: ComicChapter[];
}

/**
 * 漫画状态标签映射
 */
export const COMIC_STATUS_LABELS: Record<ComicStatus, string> = {
  ongoing: '制作中',
  completed: '已完结',
};

/**
 * 漫画状态颜色映射（用于徽章）
 */
export const COMIC_STATUS_COLORS: Record<ComicStatus, string> = {
  ongoing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

/**
 * 阅读方向标签映射
 */
export const READING_DIRECTION_LABELS: Record<ReadingDirection, string> = {
  'left-to-right': '从左往右',
  'right-to-left': '从右往左',
  'top-to-bottom': '条漫',
};

/**
 * 阅读方向选项（用于下拉选择）
 */
export const READING_DIRECTION_OPTIONS: { value: ReadingDirection; label: string }[] = [
  { value: 'left-to-right', label: '从左往右 ➜' },
  { value: 'right-to-left', label: '从右往左 ➜' },
  { value: 'top-to-bottom', label: '条漫（从上往下）↓' },
];