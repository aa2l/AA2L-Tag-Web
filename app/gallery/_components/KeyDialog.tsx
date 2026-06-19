// app/gallery/_components/KeyDialog.tsx

import { Lock } from 'lucide-react';

interface KeyDialogProps {
  isOpen: boolean;
  keyInput: string;
  setKeyInput: (value: string) => void;
  keyError: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function KeyDialog({
  isOpen,
  keyInput,
  setKeyInput,
  keyError,
  onConfirm,
  onCancel,
}: KeyDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-card-soft dark:bg-card-soft rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-pink-200/30 dark:shadow-pink-900/30 border-2 border-pink-100 dark:border-pink-900/30"
        style={{ backgroundColor: 'var(--color-card-soft, #FFFFFF)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <Lock className="w-10 h-10 text-pink-300 mx-auto mb-2" />
          <h3 className="text-xl font-bold">请输入通行证密钥</h3>
        </div>
        <p className="text-sm text-secondary text-center mb-4">
          请输入密钥以查看NSFW ✦ 这是一个必要的君子协定 ✦
        </p>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
          className="w-full border-2 border-pink-200 dark:border-pink-900/30 rounded-full p-3 mb-2 bg-background dark:bg-card focus:outline-none focus:ring-2 focus:ring-pink-300 transition text-center"
          placeholder=" 输入密钥..."
          autoFocus
        />
        {keyError && <p className="text-pink-500 text-sm text-center mb-2">{keyError}</p>}
        <div className="flex justify-center gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-6 py-2 border-2 border-pink-200 rounded-full"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-pink-400 text-white rounded-full hover:bg-pink-500 transition"
          >
             确认
          </button>
        </div>
      </div>
    </div>
  );
}