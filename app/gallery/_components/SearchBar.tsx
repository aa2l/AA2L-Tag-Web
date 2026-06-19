// app/gallery/_components/SearchBar.tsx

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortType: 'newest' | 'oldest' | 'random';
  setSortType: (value: 'newest' | 'oldest' | 'random') => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: '最新' },
  { value: 'oldest', label: '最旧' },
  { value: 'random', label: '随机' },
];

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  sortType,
  setSortType,
}: SearchBarProps) {
  const [localInput, setLocalInput] = useState(searchTerm);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLocalInput(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (value: string) => {
    setLocalInput(value);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  };

  const handleClear = () => {
    setLocalInput('');
    setSearchTerm('');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  const handleSelect = (value: 'newest' | 'oldest' | 'random') => {
    setSortType(value);
    setIsOpen(false);
  };

  const currentLabel = SORT_OPTIONS.find((opt) => opt.value === sortType)?.label || '最新';

  return (
    <div className="flex items-center gap-2 flex-1 min-w-[180px]">
      {/* 搜索框 */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
        <input
          type="text"
          value={localInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="搜索作者、模型或提示词..."
          className="w-full pl-9 pr-8 py-1.5 text-sm rounded-full bg-card-soft dark:bg-card-soft transition ring-2 ring-pink-100 dark:ring-pink-900/30 focus:ring-pink-300 focus:ring-2 focus:outline-none"
        />
        {localInput && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition"
            aria-label="清空搜索"
          >
            ✕
          </button>
        )}
      </div>

      {/* 排序下拉 */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all duration-200 ring-2 ring-pink-100 dark:ring-pink-900/30 hover:ring-pink-300 dark:hover:ring-pink-700 bg-card-soft dark:bg-card-soft ${
            isOpen ? 'ring-pink-300 dark:ring-pink-600' : ''
          }`}
        >
          <span>{currentLabel}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-secondary transition-transform duration-300 ease-out ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        <div
          className={`absolute right-0 mt-1.5 w-36 bg-card-soft dark:bg-card-soft rounded-xl shadow-lg shadow-pink-100/30 dark:shadow-pink-900/20 border-2 border-pink-100 dark:border-pink-900/30 overflow-hidden transition-all duration-200 ease-out origin-top-right ${
            isOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value as 'newest' | 'oldest' | 'random')}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                sortType === opt.value
                  ? 'text-pink-500 font-medium bg-pink-50 dark:bg-pink-900/20'
                  : 'text-secondary hover:text-foreground hover:bg-pink-50 dark:hover:bg-pink-900/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}