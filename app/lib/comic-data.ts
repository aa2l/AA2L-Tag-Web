// app/lib/comic-data.ts

import fs from 'fs-extra';
import path from 'path';
import type { ComicSeries, ComicChapter, ComicPage } from '@/types/comic';

const DATA_FILE_PATH = path.join(process.cwd(), 'data/comics.json');

// ===== 基础读写 =====

export async function getComics(): Promise<ComicSeries[]> {
  if (!(await fs.pathExists(DATA_FILE_PATH))) {
    return [];
  }
  const data = await fs.readJson(DATA_FILE_PATH);
  return data as ComicSeries[];
}

export async function getComicById(id: string): Promise<ComicSeries | null> {
  const comics = await getComics();
  return comics.find((c) => c.id === id) || null;
}

export async function saveComics(comics: ComicSeries[]): Promise<void> {
  await fs.ensureDir(path.dirname(DATA_FILE_PATH));
  await fs.writeJson(DATA_FILE_PATH, comics, { spaces: 2 });
}

// ===== 漫画 CRUD =====

export async function addComic(comic: ComicSeries): Promise<ComicSeries> {
  const comics = await getComics();
  comics.unshift(comic);
  await saveComics(comics);
  return comic;
}

export async function updateComic(
  id: string,
  updates: Partial<Omit<ComicSeries, 'id' | 'createdAt'>>
): Promise<ComicSeries | null> {
  const comics = await getComics();
  const index = comics.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updated = {
    ...comics[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  comics[index] = updated;
  await saveComics(comics);
  return updated;
}

export async function deleteComic(id: string): Promise<boolean> {
  const comics = await getComics();
  const index = comics.findIndex((c) => c.id === id);
  if (index === -1) return false;

  const comic = comics[index];
  comics.splice(index, 1);
  await saveComics(comics);

  // 删除封面主图
  if (comic.coverImage && comic.coverImage.startsWith('/comics/covers/')) {
    const coverPath = path.join(process.cwd(), 'public', comic.coverImage);
    if (await fs.pathExists(coverPath)) {
      await fs.remove(coverPath);
    }
  }
  // 删除封面模糊图
  if (comic.coverBlurImage && comic.coverBlurImage.startsWith('/comics/covers/')) {
    const blurPath = path.join(process.cwd(), 'public', comic.coverBlurImage);
    if (await fs.pathExists(blurPath)) {
      await fs.remove(blurPath);
    }
  }

  // 删除漫画图片文件夹（章节图片）
  const comicDir = path.join(process.cwd(), 'public/comics', id);
  if (await fs.pathExists(comicDir)) {
    await fs.remove(comicDir);
  }

  return true;
}

// ===== 章节管理 =====

export async function addChapter(
  comicId: string,
  chapter: { id: string; title: string; pages: ComicPage[] } 
): Promise<ComicSeries | null> {
  const comics = await getComics();
  const index = comics.findIndex((c) => c.id === comicId);
  if (index === -1) return null;

  const newChapter: ComicChapter = {
    ...chapter,
    createdAt: new Date().toISOString(),
  };

  comics[index].chapters.push(newChapter);
  comics[index].updatedAt = new Date().toISOString();
  await saveComics(comics);
  return comics[index];
}

export async function deleteChapter(
  comicId: string,
  chapterId: string
): Promise<ComicSeries | null> {
  const comics = await getComics();
  const index = comics.findIndex((c) => c.id === comicId);
  if (index === -1) return null;

  const chapterIndex = comics[index].chapters.findIndex((ch) => ch.id === chapterId);
  if (chapterIndex === -1) return null;

  // 删除该章节的图片文件夹
  const comicDir = path.join(process.cwd(), 'public/comics', comicId, chapterId);
  if (await fs.pathExists(comicDir)) {
    await fs.remove(comicDir);
  }

  comics[index].chapters.splice(chapterIndex, 1);
  comics[index].updatedAt = new Date().toISOString();
  await saveComics(comics);
  return comics[index];
}

export async function reorderChapterPages(
  comicId: string,
  chapterId: string,
  newPageOrder: ComicPage[]  // ← 改为 ComicPage[]
): Promise<ComicSeries | null> {
  const comics = await getComics();
  const index = comics.findIndex((c) => c.id === comicId);
  if (index === -1) return null;

  const chapter = comics[index].chapters.find((ch) => ch.id === chapterId);
  if (!chapter) return null;

  chapter.pages = newPageOrder;
  comics[index].updatedAt = new Date().toISOString();
  await saveComics(comics);
  return comics[index];
}