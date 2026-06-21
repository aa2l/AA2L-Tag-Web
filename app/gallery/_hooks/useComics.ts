// app/gallery/_hooks/useComics.ts

import { useState, useEffect, useMemo } from 'react';
import comicsData from '../../../data/comics.json';
import type { ComicSeries } from '@/types/comic';

export type ComicSortType = 'newest' | 'oldest' | 'title';

export function useComics() {
  const [comics, setComics] = useState<ComicSeries[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<ComicSortType>('newest');

  // ---------- 加载数据 ----------
  useEffect(() => {
    const data = comicsData as unknown as ComicSeries[];
    setComics(data);
  }, []);

  // ---------- 搜索 + 排序 ----------
  const filteredAndSortedComics = useMemo(() => {
    let result = [...comics];

    // 1. 搜索（标题 / 作者 模糊匹配）
    if (searchTerm.trim()) {
      const keyword = searchTerm.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(keyword) ||
          c.author.toLowerCase().includes(keyword)
      );
    }

    // 2. 排序
    switch (sortType) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [comics, searchTerm, sortType]);

  return {
    comics,
    filteredAndSortedComics,
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
  };
}