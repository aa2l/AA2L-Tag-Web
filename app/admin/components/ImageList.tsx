'use client';

import { ImageRecord, ModelType } from '../types';

const MODEL_LABELS: Record<ModelType, string> = {
  nai: 'NAI',
  sd: 'SD',
  anima: 'Anima',
  newbie: 'Newbie',
};

interface ImageListProps {
  images: ImageRecord[];
  onEdit: (image: ImageRecord) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  // ===== 批量选择相关 =====
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

export default function ImageList({
  images,
  onEdit,
  onDelete,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: ImageListProps) {
  if (loading) {
    return <div className="text-center py-4 text-secondary">加载中...</div>;
  }

  if (images.length === 0) {
    return <div className="text-center py-4 text-secondary">暂无图片</div>;
  }

  const allSelected = images.length > 0 && images.every((img) => selectedIds.has(img.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {/* ===== 全选复选框 ===== */}
            <th className="px-2 py-2 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400 cursor-pointer"
              />
            </th>
            <th className="px-4 py-2">预览</th>
            <th className="px-4 py-2">作者</th>
            <th className="px-4 py-2">模型</th>
            <th className="px-4 py-2">NSFW</th>
            <th className="px-4 py-2">上传时间</th>
            <th className="px-4 py-2 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img) => (
            <tr key={img.id} className="border-b border-border dark:border-border">
              {/* ===== 行复选框 ===== */}
              <td className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(img.id)}
                  onChange={() => onToggleSelect(img.id)}
                  className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400 cursor-pointer"
                />
              </td>
              <td className="px-4 py-2">
                <img
                  src={img.image_url}
                  alt={img.author}
                  className="w-16 h-16 object-cover rounded"
                />
              </td>
              <td className="px-4 py-2">{img.author}</td>
              <td className="px-4 py-2">{MODEL_LABELS[img.model]}</td>
              <td className="px-4 py-2">{img.nsfw ? '是' : '否'}</td>
              <td className="px-4 py-2">{new Date(img.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => onEdit(img)}
                  className="text-primary-dark hover:text-blue-800 mr-3"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(img.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}