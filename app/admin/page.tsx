'use client';
import { useMemo } from 'react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import ImageList from './components/ImageList';
import EditForm from './components/EditForm';
import {
  ImageRecord,
  ModelType,
  NaiParams,
  AnimaParams,
  SdParams,
} from './types';

// 默认参数（复用之前的定义）
const defaultNaiParams: NaiParams = {
  model_name: 'Noval AI v4.5',
  style_prompt: '::0.8::artist:patzzi::,0.6::su_reut,::0.6::artist:na_tarapisu153,::',
  quality_prompt: 'very aesthetic, masterpiece,',
  nl: '',
  base_prompt: '',
  undesired_content: 'lowres,bad anatomy,bad hands,text,error,missing fingers,extra digit,fewer digits,cropped,worst quality,low quality,signature,watermark,username,artist ,name,2::Weapon,',
  resolution: '832×1216',
  steps: 28,
  prompt_guidance: 5.5,
  variety: 'on',
  sampler: 'Euler a',
  schedule: 'karras',
  seed: '',
  characters: [
    { name: 'Character 1', prompt: '', undesired_content: '' },
    { name: 'Character 2', prompt: '', undesired_content: '' },
    { name: 'Character 3', prompt: '', undesired_content: '' },
    { name: 'Character 4', prompt: '', undesired_content: '' },
  ],
};

const defaultAnimaParams: AnimaParams = {
  model_name: 'Anima base V10.safetensors',
  style_prompt: '@ixy,',
  quality_prompt: 'year 2025, masterpiece, best quality, score_8, score_7,absurdres,',
  nl: '',
  positive_prompt: '',
  negative_prompt: 'worst quality, low quality, score_1, score_2, score_3, artist name,(sleeves:2),',
  loras: [''],
  resolution: '1024×1536',
  steps: 38,
  cfg: 5.0,
  denoise: 1.0,
  sampler: 'euler_an',
  schedule: 'simple',
  seed: '',
  workflow_json: '',
};

const defaultSdParams: SdParams = {
  model_name: 'waiNSFWIllustrious_v150.safetensors',
  style_prompt: '(ratatatat74:0.5),(binggong asylum:0.3),',
  quality_prompt: 'year 2025, masterpiece, best quality,absurdres,',
  positive_prompt: '',
  negative_prompt: 'nsfw,text,bad quality,worst quality,worst detail,censor,worst quality,old,early,low quality,lowres,signature,username,logo,bad hands,mutated hands,anthro,ambiguous form,feral,semi-anthro,worst aesthetic,ai-generated,',
  loras: [''],
  resolution: '1616x1064',
  steps: 34,
  cfg_scale: 5.5,
  denoise: 1.0,
  sampler: 'Euler a',
  schedule: 'Karras',
  seed: '',
  extra_params: '',
  workflow_json: '',
};

export default function AdminPage() {
  // ---------- 图片列表 ----------
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // ---------- 表单状态 ----------
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [author, setAuthor] = useState('');
  const [model, setModel] = useState<ModelType>('nai');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [nsfw, setNsfw] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---------- 批量删除状态 ----------
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loadingBatchDelete, setLoadingBatchDelete] = useState(false);

  // 参数状态
  const [naiParams, setNaiParams] = useState<NaiParams>(defaultNaiParams);
  const [animaParams, setAnimaParams] = useState<AnimaParams>(defaultAnimaParams);
  const [sdParams, setSdParams] = useState<SdParams>(defaultSdParams);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- 数据加载 ----------
  const fetchImages = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/images');
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error('获取列表失败:', error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // ---------- 重置表单为“新增” ----------
  const resetToAddMode = () => {
    setIsEditing(false);
    setEditingId(null);
    setAuthor('');
    setFile(null);
    setFilePreview(null);
    setNsfw(false);
    setNaiParams(defaultNaiParams);
    setAnimaParams(defaultAnimaParams);
    setSdParams(defaultSdParams);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- 填充编辑 ----------
  const fillFormForEdit = (image: ImageRecord) => {
    setIsEditing(true);
    setEditingId(image.id);
    setAuthor(image.author);
    setModel(image.model);
    setNsfw(image.nsfw);
    switch (image.model) {
      case 'nai':
        setNaiParams(image.params as NaiParams);
        break;
      case 'anima':
        setAnimaParams(image.params as AnimaParams);
        break;
      case 'sd':
        setSdParams(image.params as SdParams);
        break;
      default:
        break;
    }
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- 过滤与排序状态 ----------
  const [searchAuthor, setSearchAuthor] = useState('');
  const [filterModel, setFilterModel] = useState<ModelType | 'all'>('all');
  const [filterNsfw, setFilterNsfw] = useState<'all' | 'nsfw' | 'safe'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // ---------- 过滤与排序逻辑 ----------
  const filteredAndSortedImages = useMemo(() => {
    let result = [...images];

    // 1. 作者模糊搜索
    if (searchAuthor.trim()) {
      const keyword = searchAuthor.trim().toLowerCase();
      result = result.filter((img) =>
        img.author.toLowerCase().includes(keyword)
      );
    }

    // 2. 模型筛选
    if (filterModel !== 'all') {
      result = result.filter((img) => img.model === filterModel);
    }

    // 3. NSFW 筛选
    if (filterNsfw === 'nsfw') {
      result = result.filter((img) => img.nsfw === true);
    } else if (filterNsfw === 'safe') {
      result = result.filter((img) => img.nsfw === false);
    }

    // 4. 日期排序（id 是时间戳）
    result.sort((a, b) => {
      return sortOrder === 'newest' ? b.id - a.id : a.id - b.id;
    });

    return result;
  }, [images, searchAuthor, filterModel, filterNsfw, sortOrder]);

  // ---------- 批量选择操作 ----------
  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    const allIds = filteredAndSortedImages.map((img) => img.id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  // ---------- 批量删除 ----------
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      setMessage({ type: 'error', text: '请至少选择一张图片' });
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.size} 张图片吗？此操作不可撤销！`)) {
      return;
    }

    setLoadingBatchDelete(true);
    setMessage(null);

    try {
      const res = await fetch('/api/images/batch-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `✅ 成功删除 ${result.deletedCount} 张图片` });
        setSelectedIds(new Set());
        fetchImages();
        // 如果当前编辑的图片被删了，重置表单
        if (editingId !== null && selectedIds.has(editingId)) {
          resetToAddMode();
        }
      } else {
        setMessage({ type: 'error', text: result.error || '批量删除失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '网络错误：' + err.message });
    } finally {
      setLoadingBatchDelete(false);
    }
  };

  // ---------- 提交 ----------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setMessage({ type: 'error', text: '作者不能为空' });
      return;
    }
    if (!isEditing && !file) {
      setMessage({ type: 'error', text: '请选择一张图片' });
      return;
    }

    setLoadingSubmit(true);
    setMessage(null);
    try {
      let params = {};
      switch (model) {
        case 'nai':
          params = naiParams;
          break;
        case 'anima':
          params = animaParams;
          break;
        case 'sd':
          params = sdParams;
          break;
        default:
          params = {};
      }

      if (isEditing) {
        const payload = { author: author.trim(), model, params, nsfw };
        const res = await fetch(`/api/images/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok) {
          setMessage({ type: 'success', text: '更新成功！' });
          fetchImages();
          resetToAddMode();
        } else {
          setMessage({ type: 'error', text: result.error || '更新失败' });
        }
      } else {
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('author', author.trim());
        formData.append('model', model);
        formData.append('params', JSON.stringify(params));
        formData.append('nsfw', nsfw ? 'true' : 'false');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await res.json();
        if (res.ok) {
          setMessage({ type: 'success', text: '上传成功！' });
          fetchImages();
          resetToAddMode();
        } else {
          setMessage({ type: 'error', text: result.error || '上传失败' });
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '网络错误：' + err.message });
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ---------- 删除 ----------
  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: '删除成功' });
        fetchImages();
        if (editingId === id) resetToAddMode();
      } else {
        const result = await res.json();
        setMessage({ type: 'error', text: result.error || '删除失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '网络错误：' + err.message });
    }
  };

  // ---------- 渲染 ----------
  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded mb-6">
          ⚠️ 此页面仅用于本地管理，不会部署到线上。
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold"> 图片管理后台</h1>
          <Link href="/gallery" className="text-primary-dark hover:underline">← 回到画廊</Link>
        </div>
        <Link href="/admin/comics" className="text-primary-dark hover:underline"> 漫画管理</Link>
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-card rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">作者 *</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required className="w-full border rounded p-2 dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">模型 *</label>
              <select value={model} onChange={(e) => setModel(e.target.value as ModelType)} className="w-full border rounded p-2 dark:bg-gray-700">
                <option value="nai">NAI</option>
                <option value="sd">SD</option>
                <option value="anima">Anima</option>
                <option value="newbie">Newbie</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">图片文件 {!isEditing && '*'}</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); setFilePreview(URL.createObjectURL(f)); } else { setFile(null); setFilePreview(null); }
            }} className="w-full border rounded p-2 dark:bg-gray-700" />
            {filePreview && <img src={filePreview} alt="预览" className="mt-2 max-h-32 rounded border object-contain" />}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <input type="checkbox" id="nsfw" checked={nsfw} onChange={(e) => setNsfw(e.target.checked)} className="w-5 h-5" />
            <label htmlFor="nsfw" className="text-sm font-medium text-red-600"> 标记为 NSFW</label>
          </div>
          <EditForm
            model={model}
            naiParams={naiParams}
            animaParams={animaParams}
            sdParams={sdParams}
            onNaiChange={setNaiParams}
            onAnimaChange={setAnimaParams}
            onSdChange={setSdParams}
          />
          <div className="flex items-center gap-4 pt-4 border-t">
            <button type="submit" disabled={loadingSubmit} className="px-6 py-2 bg-primary-dark text-white rounded hover:bg-primary-700 disabled:opacity-50">
              {loadingSubmit ? (isEditing ? '更新中...' : '上传中...') : (isEditing ? '更新图片' : '上传图片')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetToAddMode} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                取消编辑
              </button>
            )}
            {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
          </div>
        </form>

        {/* ---------- 过滤工具栏 ---------- */}
        <div className="mb-4 p-4 bg-background dark:bg-gray-700/50 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-secondary dark:text-secondary mb-1">作者搜索</label>
            <input
              type="text"
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
              placeholder="输入作者名..."
              className="w-full border rounded px-3 py-1.5 text-sm dark:bg-card dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary dark:text-secondary mb-1">模型</label>
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value as typeof filterModel)}
              className="w-full border rounded px-3 py-1.5 text-sm dark:bg-card dark:border-gray-600"
            >
              <option value="all">全部</option>
              <option value="nai">NAI</option>
              <option value="sd">SD</option>
              <option value="anima">Anima</option>
              <option value="newbie">Newbie</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary dark:text-secondary mb-1">NSFW</label>
            <select
              value={filterNsfw}
              onChange={(e) => setFilterNsfw(e.target.value as typeof filterNsfw)}
              className="w-full border rounded px-3 py-1.5 text-sm dark:bg-card dark:border-gray-600"
            >
              <option value="all">全部</option>
              <option value="safe">仅安全</option>
              <option value="nsfw">仅 NSFW</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary dark:text-secondary mb-1">排序</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              className="w-full border rounded px-3 py-1.5 text-sm dark:bg-card dark:border-gray-600"
            >
              <option value="newest">最新优先</option>
              <option value="oldest">最旧优先</option>
            </select>
          </div>
        </div>

        {/* 结果统计 + 批量删除工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-secondary dark:text-secondary mb-3">
          <span>
            共 {filteredAndSortedImages.length} 张图片
            {searchAuthor && `（搜索: "${searchAuthor}"）`}
            {filterModel !== 'all' && `（模型: ${filterModel}）`}
            {filterNsfw !== 'all' && `（${filterNsfw === 'nsfw' ? 'NSFW' : '安全'}）`}
          </span>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <span className="text-sm">
                已选 <span className="font-semibold text-pink-500">{selectedIds.size}</span> 张
              </span>
            )}
            <button
              onClick={handleBatchDelete}
              disabled={selectedIds.size === 0 || loadingBatchDelete}
              className={`px-4 py-1.5 text-sm rounded-full transition ${
                selectedIds.size === 0 || loadingBatchDelete
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200/50 dark:shadow-red-900/30'
              }`}
            >
              {loadingBatchDelete ? '删除中...' : `🗑 批量删除 (${selectedIds.size})`}
            </button>
          </div>
        </div>

        {/* 图片列表 */}
        <div className="bg-white dark:bg-card rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">已上传图片</h2>
          <ImageList
            images={filteredAndSortedImages}
            onEdit={fillFormForEdit}
            onDelete={handleDelete}
            loading={loadingList}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />
        </div>
      </div>
    </div>
  );
}