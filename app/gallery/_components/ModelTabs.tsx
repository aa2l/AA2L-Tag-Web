// app/gallery/_components/ModelTabs.tsx

import { useRef, useEffect } from 'react';
import { ModelType } from '../types';
import { ALL_MODELS, MODEL_LABELS } from '../constants';

interface ModelTabsProps {
  currentModel: ModelType | 'all';
  setCurrentModel: (model: ModelType | 'all') => void;
}

export default function ModelTabs({ currentModel, setCurrentModel }: ModelTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const activeButton = container.querySelector(
      `button[data-model="${currentModel}"]`
    ) as HTMLButtonElement;
    if (!activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    indicator.style.left = `${buttonRect.left - containerRect.left}px`;
    indicator.style.width = `${buttonRect.width}px`;
  }, [currentModel]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-1 text-sm">
        <button
          data-model="all"
          onClick={() => setCurrentModel('all')}
          className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
            currentModel === 'all'
              ? 'text-pink-500 font-medium'
              : 'text-secondary hover:text-foreground hover:-translate-y-0.5'
          }`}
        >
          全部
        </button>
        {ALL_MODELS.map((m) => (
          <button
            key={m}
            data-model={m}
            onClick={() => setCurrentModel(m)}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
              currentModel === m
                ? 'text-pink-500 font-medium'
                : 'text-secondary hover:text-foreground hover:-translate-y-0.5'
            }`}
          >
            {MODEL_LABELS[m]}
          </button>
        ))}
      </div>
      {/* 滑动下划线指示器 */}
      <div
        ref={indicatorRef}
        className="absolute bottom-0 h-0.5 bg-pink-400 rounded-full transition-all duration-300 ease-out"
        style={{ left: 0, width: 0 }}
      />
    </div>
  );
}