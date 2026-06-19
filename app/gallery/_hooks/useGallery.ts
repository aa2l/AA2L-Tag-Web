// app/gallery/hooks/useGallery.ts

import { useState, useEffect, useMemo } from 'react';
import imagesData from '../../../data/images.json';
import { ImageRecord, ModelType } from '../types';
import { NSFW_KEY, ALL_MODELS } from '../constants';

export function useGallery() {
  // ---------- 状态 ----------
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [currentModel, setCurrentModel] = useState<ModelType | 'all'>('all');
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<'newest' | 'oldest' | 'random'>('newest');

  // ---------- 加载数据 ----------
  useEffect(() => {
    const data = imagesData as unknown as ImageRecord[];
    setImages(data);
    const stored = sessionStorage.getItem('nsfw_unlocked');
    if (stored === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  // ---------- 按模型筛选 ----------
  const filteredImages = useMemo(() => {
    if (currentModel === 'all') {
      return images;
    }
    return images.filter((img) => img.model === currentModel);
  }, [images, currentModel]);

  // ---------- 搜索 + 排序 ----------
  const searchedAndSortedImages = useMemo(() => {
    let result = filteredImages;

    if (searchTerm.trim()) {
      const keyword = searchTerm.trim().toLowerCase();
      result = result.filter((img) => {
        // 安全搜索作者
        if (img.author && typeof img.author === 'string' && img.author.toLowerCase().includes(keyword)) return true;
        // 安全搜索模型
        if (img.model && typeof img.model === 'string' && img.model.toLowerCase().includes(keyword)) return true;
        // 搜索 params
        if (img.params && typeof img.params === 'object') {
          if ('model_name' in img.params && typeof img.params.model_name === 'string') {
            if (img.params.model_name.toLowerCase().includes(keyword)) return true;
          }
          const paramsValues = Object.values(img.params).filter((val) => typeof val === 'string');
          for (const val of paramsValues) {
            if (val.toLowerCase().includes(keyword)) return true;
          }
        }
        return false;
      });
    }

    // 排序
    switch (sortType) {
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        result.sort((a, b) => a.id - b.id);
        break;
      case 'random':
        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }
        break;
      default:
        break;
    }

    return result;
  }, [filteredImages, searchTerm, sortType]);

  // ---------- 解锁函数 ----------
  const handleUnlock = () => {
    if (keyInput === NSFW_KEY) {
      setIsUnlocked(true);
      sessionStorage.setItem('nsfw_unlocked', 'true');
      setKeyError('');
      setShowKeyDialog(false);
      setKeyInput('');
    } else {
      setKeyError('密钥错误');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('nsfw_unlocked');
  };

  // ---------- Modal 操作 ----------
  const openModal = (img: ImageRecord) => setSelectedImage(img);
  const closeModal = () => setSelectedImage(null);

  return {
    // 数据
    images,
    filteredImages,
    searchedAndSortedImages,
    // 模型
    currentModel,
    setCurrentModel,
    // 搜索排序
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    // Modal
    selectedImage,
    openModal,
    closeModal,
    // 解锁
    isUnlocked,
    showKeyDialog,
    setShowKeyDialog,
    keyInput,
    setKeyInput,
    keyError,
    handleUnlock,
    handleLock,
  };
}