'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, BookOpen, Upload, X } from 'lucide-react';
import type { ComicSeries, ComicStatus, ReadingDirection } from '@/types/comic';
import { COMIC_STATUS_LABELS, COMIC_STATUS_COLORS, READING_DIRECTION_OPTIONS } from '@/types/comic';
import ChapterManager from './components/ChapterManager';

// ============================================================
// 子组件：漫画列表
// ============================================================
function ComicList({
  comics,
  onEdit,
  onDelete,
  onManageChapters,
  loading,
}: {
  comics: ComicSeries[];
  onEdit: (comic: ComicSeries) => void;
  onDelete: (id: string) => void;
  onManageChapters: (comic: ComicSeries) => void;
  loading: boolean;
}) {
  if (loading) {
    return <div className="text-center py-8 text-secondary">加载中...</div>;
  }

  if (comics.length === 0) {
    return (
      <div className="text-center py-12 text-secondary">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>暂无漫画，点击右上角「新建漫画」开始添加</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2">封面</th>
            <th className="px-4 py-2">作品名称</th>
            <th className="px-4 py-2">作者</th>
            <th className="px-4 py-2">状态</th>
            <th className="px-4 py-2">章节数</th>
            <th className="px-4 py-2">更新时间</th>
            <th className="px-4 py-2 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {comics.map((comic) => (
            <tr key={comic.id} className="border-b border-border dark:border-border">
              <td className="px-4 py-2">
                <img
                  src={comic.coverThumbUrl || comic.coverImage}
                  alt={comic.title}
                  className="w-12 h-16 object-cover rounded"
                />
              </td>
              <td className="px-4 py-2 font-medium">{comic.title}</td>
              <td className="px-4 py-2">{comic.author}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${COMIC_STATUS_COLORS[comic.status]}`}
                >
                  {COMIC_STATUS_LABELS[comic.status]}
                </span>
              </td>
              <td className="px-4 py-2">{comic.chapters.length} 话</td>
              <td className="px-4 py-2 text-secondary text-xs">
                {new Date(comic.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => onManageChapters(comic)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  title="管理章节"
                >
                  <BookOpen className="w-4 h-4 inline" />
                </button>
                <button
                  onClick={() => onEdit(comic)}
                  className="text-primary-dark hover:text-blue-800 mr-2"
                >
                  <Pencil className="w-4 h-4 inline" />
                </button>
                <button
                  onClick={() => onDelete(comic.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// 子组件：漫画表单（含封面上传 + NSFW 复选框 + 阅读方向）
// ============================================================
function ComicForm({
  comic,
  onSave,
  onCancel,
  loading,
}: {
  comic?: ComicSeries | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isEditing = !!comic;

  const [title, setTitle] = useState(comic?.title || '');
  const [author, setAuthor] = useState(comic?.author || '');
  const [description, setDescription] = useState(comic?.description || '');
  const [coverImage, setCoverImage] = useState(comic?.coverImage || '');
  const [coverThumbUrl, setCoverThumbUrl] = useState(comic?.coverThumbUrl || '');
  const [status, setStatus] = useState<ComicStatus>(comic?.status || 'ongoing');
  const [readingDirection, setReadingDirection] = useState<ReadingDirection>(
    comic?.readingDirection || 'left-to-right'
  );

  // 封面上传状态
  const [coverPreview, setCoverPreview] = useState<string | null>(comic?.coverImage || null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverNsfw, setCoverNsfw] = useState(comic?.coverNsfw || false);

  // ===== 提交 =====
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      author,
      description,
      coverImage,
      coverThumbUrl,
      coverNsfw,
      status,
      readingDirection,
    });
  };

  // ===== 封面上传 =====
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setCoverPreview(preview);

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nsfw', coverNsfw ? 'true' : 'false');
      const res = await fetch('/api/upload-comic-cover', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setCoverImage(result.url);
        setCoverThumbUrl(result.thumbUrl || '');
      } else {
        alert('上传失败: ' + result.error);
        setCoverPreview(comic?.coverImage || null);
      }
    } catch (err) {
      alert('上传出错，请重试');
      setCoverPreview(comic?.coverImage || null);
    } finally {
      setUploadingCover(false);
    }
  };

  // ===== 移除封面 =====
  const clearCover = () => {
    setCoverImage('');
    setCoverThumbUrl('');
    setCoverPreview(null);
    const input = document.getElementById('coverFileInput') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">作品名称 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded p-2 dark:bg-card"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">作者 *</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="w-full border rounded p-2 dark:bg-card"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">简介</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2 dark:bg-card"
        />
      </div>

      {/* 封面上传 */}
      <div>
        <label className="block text-sm font-medium mb-1">封面图 *</label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <label
                className={`px-4 py-2 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                  uploadingCover ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <span className="flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  {uploadingCover ? '上传中...' : '选择封面图片'}
                </span>
                <input
                  id="coverFileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="hidden"
                  disabled={uploadingCover}
                />
              </label>
              {coverImage && (
                <button
                  type="button"
                  onClick={clearCover}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> 移除
                </button>
              )}
            </div>
            {coverImage && (
              <p className="text-xs text-secondary mt-1 truncate">
                路径: {coverImage}
              </p>
            )}
            {!coverImage && (
              <p className="text-xs text-secondary mt-1">支持 JPG, PNG, WebP，最大 5MB</p>
            )}
          </div>
          {coverPreview && (
            <div className="w-24 h-32 flex-shrink-0 border rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={coverPreview}
                alt="封面预览"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* NSFW 复选框 */}
        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            id="coverNsfw"
            checked={coverNsfw}
            onChange={(e) => setCoverNsfw(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="coverNsfw" className="text-sm text-red-600">
            标记为 NSFW（封面将使用模糊图）
          </label>
        </div>
      </div>

      {/* 状态 */}
      <div>
        <label className="block text-sm font-medium mb-1">状态</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ComicStatus)}
          className="w-full border rounded p-2 dark:bg-card"
        >
          <option value="ongoing">制作中</option>
          <option value="completed">已完结</option>
        </select>
      </div>

      {/* 阅读方向 */}
      <div>
        <label className="block text-sm font-medium mb-1">阅读方向 *</label>
        <select
          value={readingDirection}
          onChange={(e) => setReadingDirection(e.target.value as ReadingDirection)}
          className="w-full border rounded p-2 dark:bg-card"
        >
          {READING_DIRECTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-secondary mt-1">用户阅读时将以此方向翻阅</p>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          type="submit"
          disabled={loading || uploadingCover || !coverImage}
          className="px-4 py-2 bg-primary-dark text-white rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? (isEditing ? '更新中...' : '创建中...') : isEditing ? '更新漫画' : '创建漫画'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          取消
        </button>
      </div>
    </form>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function ComicsAdminPage() {
  const [comics, setComics] = useState<ComicSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingComic, setEditingComic] = useState<ComicSeries | null>(null);

  const [selectedComic, setSelectedComic] = useState<ComicSeries | null>(null);
  const [showChapterManager, setShowChapterManager] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ===== 加载数据 =====
  const fetchComics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comics');
      const data = await res.json();
      setComics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('获取漫画列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  // ===== 创建/更新漫画 =====
  const handleSaveComic = async (data: any) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const url = editingComic ? `/api/comics/${editingComic.id}` : '/api/comics';
      const method = editingComic ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: editingComic ? '漫画已更新' : '漫画已创建' });
        fetchComics();
        setShowForm(false);
        setEditingComic(null);
      } else {
        setMessage({ type: 'error', text: result.error || '操作失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '网络错误: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ===== 删除漫画 =====
  const handleDeleteComic = async (id: string) => {
    if (!confirm('确定要删除这部漫画吗？所有章节和图片将被删除！')) return;

    try {
      const res = await fetch(`/api/comics/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: '漫画已删除' });
        fetchComics();
        if (selectedComic?.id === id) {
          setSelectedComic(null);
          setShowChapterManager(false);
        }
      } else {
        const result = await res.json();
        setMessage({ type: 'error', text: result.error || '删除失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '网络错误: ' + err.message });
    }
  };

  // ===== 打开编辑 =====
  const handleEdit = (comic: ComicSeries) => {
    setEditingComic(comic);
    setShowForm(true);
    setShowChapterManager(false);
  };

  // ===== 打开章节管理 =====
  const handleManageChapters = (comic: ComicSeries) => {
    setSelectedComic(comic);
    setShowChapterManager(true);
    setShowForm(false);
    setEditingComic(null);
  };

  // ===== 关闭表单 =====
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingComic(null);
  };

  // ===== 返回列表 =====
  const handleBackToList = () => {
    setShowChapterManager(false);
    setSelectedComic(null);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-background">
      <div className="max-w-6xl mx-auto">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-secondary hover:text-foreground">
              ← 返回
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-pink-500" />
              漫画管理
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {selectedComic && showChapterManager && (
              <button
                onClick={handleBackToList}
                className="text-sm text-secondary hover:text-foreground"
              >
                ← 返回列表
              </button>
            )}
            <button
              onClick={() => {
                setShowForm(true);
                setEditingComic(null);
                setShowChapterManager(false);
              }}
              className="px-4 py-2 bg-primary-dark text-white rounded hover:bg-primary-700 flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" /> 新建漫画
            </button>
          </div>
        </div>

        {/* 消息 */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 表单 */}
        {showForm && (
          <div className="bg-white dark:bg-card rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingComic ? '编辑漫画' : '新建漫画'}
            </h2>
            <ComicForm
              comic={editingComic}
              onSave={handleSaveComic}
              onCancel={handleCancelForm}
              loading={submitting}
            />
          </div>
        )}

        {/* 章节管理 */}
        {showChapterManager && selectedComic && (
          <div className="bg-white dark:bg-card rounded-xl shadow p-6 mb-6">
            <ChapterManager
              comic={selectedComic}
              onRefresh={fetchComics}
              onBack={handleBackToList}
            />
          </div>
        )}

        {/* 列表 */}
        {!showChapterManager && (
          <div className="bg-white dark:bg-card rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">所有漫画</h2>
            <ComicList
              comics={comics}
              onEdit={handleEdit}
              onDelete={handleDeleteComic}
              onManageChapters={handleManageChapters}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
}