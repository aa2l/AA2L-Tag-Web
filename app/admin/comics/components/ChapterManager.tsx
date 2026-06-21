// app/admin/comics/components/ChapterManager.tsx
'use client';

import { useState, useRef } from 'react';
import { Plus, X, Upload, Trash2 } from 'lucide-react';
import type { ComicSeries, ComicPage } from '@/types/comic';

interface ChapterManagerProps {
  comic: ComicSeries;
  onRefresh: () => void;
  onBack: () => void;
}

export default function ChapterManager({ comic, onRefresh, onBack }: ChapterManagerProps) {
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ===== 待上传的页面（内存中保存 File 对象和预览） =====
  const [pendingPages, setPendingPages] = useState<{ file: File; preview: string; nsfw: boolean }[]>([]);
  const [pageNsfw, setPageNsfw] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== 添加章节（先创建章节，再上传图片） =====
  const handleAddChapter = async () => {
    if (!chapterTitle.trim()) {
      setMessage({ type: 'error', text: '请输入章节标题' });
      return;
    }
    if (pendingPages.length === 0) {
      setMessage({ type: 'error', text: '请至少选择一张页面图片' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // ===== 第一步：创建空章节 =====
      const createRes = await fetch(`/api/comics/${comic.id}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: chapterTitle.trim(),
          pages: [], // 空数组
        }),
      });

      const createResult = await createRes.json();
      if (!createRes.ok) {
        setMessage({ type: 'error', text: createResult.error || '创建章节失败' });
        setUploading(false);
        return;
      }

      // 获取正式章节 ID
      const updatedComic = createResult.data;
      const newChapter = updatedComic.chapters[updatedComic.chapters.length - 1];
      const realChapterId = newChapter.id;

      // ===== 第二步：逐张上传图片 =====
      const uploadedPages: ComicPage[] = [];

      for (const pending of pendingPages) {
        const formData = new FormData();
        formData.append('file', pending.file);
        formData.append('comicId', comic.id);
        formData.append('chapterId', realChapterId);
        formData.append('nsfw', pending.nsfw ? 'true' : 'false');

        const uploadRes = await fetch('/api/upload-comic-pages', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadRes.json();
        if (uploadRes.ok) {
          uploadedPages.push({
            url: uploadResult.url,
            blurUrl: uploadResult.blurUrl || '',
            thumbUrl: uploadResult.thumbUrl || '',  // ← 新增：保存缩略图
            nsfw: uploadResult.nsfw,
          });
        } else {
          console.warn('图片上传失败:', uploadResult.error);
        }
      }

      if (uploadedPages.length === 0) {
        setMessage({ type: 'error', text: '所有图片上传失败，请重试' });
        setUploading(false);
        return;
      }

      // ===== 第三步：更新章节的 pages =====
      const updateRes = await fetch(`/api/comics/${comic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapters: updatedComic.chapters.map((ch: any) =>
            ch.id === realChapterId
              ? { ...ch, pages: uploadedPages }
              : ch
          ),
        }),
      });

      if (!updateRes.ok) {
        setMessage({ type: 'error', text: '章节已创建，但更新页面列表失败' });
        setUploading(false);
        return;
      }

      // ===== 成功 =====
      setMessage({ type: 'success', text: `章节 "${chapterTitle}" 已添加（${uploadedPages.length} 页）` });
      setChapterTitle('');
      setPendingPages([]);
      setIsAddingChapter(false);
      onRefresh();

    } catch (err: any) {
      setMessage({ type: 'error', text: '网络错误: ' + err.message });
    } finally {
      setUploading(false);
    }
  };

  // ===== 选择图片 =====
  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPages: { file: File; preview: string; nsfw: boolean }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: `${file.name} 超过 10MB 限制` });
        continue;
      }
      newPages.push({
        file,
        preview: URL.createObjectURL(file),
        nsfw: pageNsfw,
      });
    }

    setPendingPages([...pendingPages, ...newPages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ===== 移除待上传的页面 =====
  const removePendingPage = (index: number) => {
    const newPages = [...pendingPages];
    URL.revokeObjectURL(newPages[index].preview);
    newPages.splice(index, 1);
    setPendingPages(newPages);
  };

  // ===== 清空所有待上传 =====
  const clearAllPending = () => {
    for (const p of pendingPages) {
      URL.revokeObjectURL(p.preview);
    }
    setPendingPages([]);
  };

  // ===== 删除章节 =====
  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    if (!confirm(`确定要删除章节 "${chapterTitle}" 吗？所有页面图片将被删除！`)) return;

    try {
      const res = await fetch(`/api/comics/${comic.id}/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `章节 "${chapterTitle}" 已删除` });
        onRefresh();
      } else {
        const result = await res.json();
        setMessage({ type: 'error', text: result.error || '删除失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '网络错误: ' + err.message });
    }
  };

  return (
    <div>
      {/* 顶部栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">📖 {comic.title} - 章节管理</h2>
          <span className="text-sm text-secondary">共 {comic.chapters.length} 话</span>
        </div>
        <div className="flex items-center gap-3">
          {!isAddingChapter && (
            <button
              onClick={() => setIsAddingChapter(true)}
              className="px-3 py-1.5 bg-primary-dark text-white rounded text-sm hover:bg-primary-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> 添加章节
            </button>
          )}
          <button onClick={onBack} className="text-sm text-secondary hover:text-foreground">
            ← 返回列表
          </button>
        </div>
      </div>

      {/* 消息 */}
      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 添加章节表单 */}
      {isAddingChapter && (
        <div className="mb-6 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-medium mb-3">新建章节</h3>

          {/* 章节标题 */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">章节标题 *</label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="例如：第一话：相遇"
              className="w-full max-w-md border rounded p-2 dark:bg-card"
            />
          </div>

          {/* 选择图片 */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">页面图片 *</label>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="px-4 py-2 border-2 border-dashed rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <span className="flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  选择图片
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectFiles}
                  className="hidden"
                />
              </label>

              {/* NSFW 复选框 */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={pageNsfw}
                  onChange={(e) => setPageNsfw(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-red-600">标记为 NSFW</span>
              </label>

              <span className="text-xs text-secondary">
                已选 {pendingPages.length} 张
              </span>

              {pendingPages.length > 0 && (
                <button
                  onClick={clearAllPending}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  清空
                </button>
              )}
            </div>

            {/* 已选图片预览 */}
            {pendingPages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {pendingPages.map((page, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-20 border rounded overflow-hidden group bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                  >
                    <img
                      src={page.preview}
                      alt={`页面 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {page.nsfw && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded-bl">
                        NSFW
                      </span>
                    )}
                    <button
                      onClick={() => removePendingPage(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-0.5">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 pt-2 border-t dark:border-gray-700">
            <button
              onClick={handleAddChapter}
              disabled={uploading || pendingPages.length === 0}
              className="px-4 py-2 bg-primary-dark text-white rounded hover:bg-primary-700 disabled:opacity-50 text-sm"
            >
              {uploading ? '处理中...' : '保存章节'}
            </button>
            <button
              onClick={() => {
                setIsAddingChapter(false);
                setChapterTitle('');
                clearAllPending();
                setMessage(null);
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 章节列表 */}
      {comic.chapters.length === 0 ? (
        <p className="text-secondary text-sm text-center py-8">
          {isAddingChapter ? '选择图片后点击「保存章节」' : '暂无章节，点击「添加章节」开始创建'}
        </p>
      ) : (
        <div className="space-y-3">
          {comic.chapters.map((ch, idx) => (
            <div
              key={ch.id}
              className="p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-lg">{idx + 1}.</span>
                  <span className="font-medium">{ch.title}</span>
                  <span className="text-secondary text-sm">
                    {ch.pages.length} 页
                  </span>
                  {ch.pages.some((p) => p.nsfw) && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                      含 NSFW
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteChapter(ch.id, ch.title)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> 删除
                </button>
              </div>

              {/* 页面缩略图 */}
              {ch.pages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ch.pages.slice(0, 8).map((page, pIdx) => (
                    <div
                      key={pIdx}
                      className="relative w-12 h-16 border rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                    >
                      <img
                        src={page.thumbUrl || page.url}
                        alt={`${ch.title} - ${pIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {page.nsfw && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[6px] px-0.5 py-0.5 rounded-bl">
                          NSFW
                        </span>
                      )}
                    </div>
                  ))}
                  {ch.pages.length > 8 && (
                    <div className="w-12 h-16 border rounded flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-secondary text-xs">
                      +{ch.pages.length - 8}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}