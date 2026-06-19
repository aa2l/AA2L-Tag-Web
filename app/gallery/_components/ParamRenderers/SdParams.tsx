// app/gallery/_components/ParamRenderers/SdParams.tsx

import { SdParams } from '../../types';

interface SdParamsRendererProps {
  params: SdParams;
}

export default function SdParamsRenderer({ params: p }: SdParamsRendererProps) {
  const loras = p.loras as string[] | undefined;
  const hasLoras = loras && loras.length > 0 && loras.some((l) => l.trim());

  return (
    <div className="space-y-4">
      <div>
        <span className="text-secondary text-sm">模型：</span>
        <div className="text-foreground text-sm">{p.model_name}</div>
      </div>

      <div>
        <span className="text-secondary text-sm">画风 prompt：</span>
        <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
          {p.style_prompt}
        </div>
      </div>

      <div>
        <span className="text-secondary text-sm">质量 prompt：</span>
        <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
          {p.quality_prompt}
        </div>
      </div>

      <div>
        <span className="text-secondary text-sm">Positive Prompt：</span>
        <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
          {p.positive_prompt}
        </div>
      </div>

      <div>
        <span className="text-secondary text-sm">Negative Prompt：</span>
        <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
          {p.negative_prompt}
        </div>
      </div>

      {hasLoras && (
        <div>
          <span className="text-secondary text-sm">LORAS：</span>
          <ul className="list-disc list-inside text-foreground text-sm mt-0.5 space-y-0.5">
            {loras.map((l, idx) => l.trim() && <li key={idx}>{l}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        <div>
          <span className="text-secondary text-sm">分辨率：</span>
          <span className="text-foreground text-sm ml-1">{p.resolution}</span>
        </div>
        <div>
          <span className="text-secondary text-sm">Steps：</span>
          <span className="text-foreground text-sm ml-1">{p.steps}</span>
        </div>
        <div>
          <span className="text-secondary text-sm">CFG scale：</span>
          <span className="text-foreground text-sm ml-1">{p.cfg_scale}</span>
        </div>
        <div>
          <span className="text-secondary text-sm">denoise：</span>
          <span className="text-foreground text-sm ml-1">{p.denoise}</span>
        </div>
        <div>
          <span className="text-secondary text-sm">Sampler：</span>
          <span className="text-foreground text-sm ml-1">{p.sampler}</span>
        </div>
        <div>
          <span className="text-secondary text-sm">Schedule：</span>
          <span className="text-foreground text-sm ml-1">{p.schedule}</span>
        </div>
        <div className="col-span-2">
          <span className="text-secondary text-sm">Seed：</span>
          <span className="text-foreground text-sm font-mono ml-1">{p.seed}</span>
        </div>
      </div>

      {p.extra_params && (
        <div>
          <span className="text-secondary text-sm">额外参数：</span>
          <pre className="mt-1 p-3 bg-pink-50/30 dark:bg-pink-900/25 rounded-xl text-foreground text-xs overflow-auto max-h-32 whitespace-pre-wrap font-mono">
            {p.extra_params}
          </pre>
        </div>
      )}
      {p.workflow_json && (
  <div className="flex items-center gap-2 pt-1">
    <span className="text-secondary text-sm">工作流信息</span>
    <button
      onClick={() => navigator.clipboard.writeText(p.workflow_json!)}
      className="px-2.5 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 text-xs rounded-full hover:bg-pink-200 dark:hover:bg-pink-800/40 transition border border-pink-200/50 dark:border-pink-700/30"
    >
       复制 JSON
    </button>
  </div>
)}
    </div>
  );
}