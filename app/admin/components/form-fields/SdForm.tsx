'use client';

import { SdParams } from '../../types';

interface SdFormProps {
  params: SdParams;
  onChange: (params: SdParams) => void;
}

export default function SdForm({ params, onChange }: SdFormProps) {
  const update = (key: keyof SdParams, value: any) => {
    onChange({ ...params, [key]: value });
  };

  const addLora = () => onChange({ ...params, loras: [...params.loras, ''] });
  const removeLora = (idx: number) => {
    if (params.loras.length <= 1) return;
    const l = [...params.loras];
    l.splice(idx, 1);
    onChange({ ...params, loras: l });
  };
  const updateLora = (idx: number, val: string) => {
    const l = [...params.loras];
    l[idx] = val;
    onChange({ ...params, loras: l });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">SD 参数</h3>
      <div><label className="block text-sm font-medium mb-1">模型名称</label><input type="text" value={params.model_name} onChange={(e) => update('model_name', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
      <div><label className="block text-sm font-medium mb-1">画风 prompt</label><textarea rows={2} value={params.style_prompt} onChange={(e) => update('style_prompt', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
      <div><label className="block text-sm font-medium mb-1">质量 prompt</label><textarea rows={2} value={params.quality_prompt} onChange={(e) => update('quality_prompt', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
      <div><label className="block text-sm font-medium mb-1">Positive Prompt</label><textarea rows={4} value={params.positive_prompt} onChange={(e) => update('positive_prompt', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
      <div><label className="block text-sm font-medium mb-1">Negative Prompt</label><textarea rows={4} value={params.negative_prompt} onChange={(e) => update('negative_prompt', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
      <div>
        <div className="flex justify-between items-center"><label className="block text-sm font-medium mb-1">LORAS</label><button type="button" onClick={addLora} className="px-3 py-1 bg-primary-dark text-white rounded text-sm">+ 添加</button></div>
        {params.loras.map((l, idx) => (
          <div key={idx} className="flex gap-2 mb-2 items-center">
            <input type="text" value={l} onChange={(e) => updateLora(idx, e.target.value)} placeholder="Lora 文件名" className="flex-1 border rounded p-2 dark:bg-card" />
            <button type="button" onClick={() => removeLora(idx)} disabled={params.loras.length <= 1} className="text-red-600 text-sm disabled:opacity-50">删除</button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">分辨率</label><input type="text" value={params.resolution} onChange={(e) => update('resolution', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">Steps</label><input type="number" value={params.steps} onChange={(e) => update('steps', Number(e.target.value))} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">CFG scale</label><input type="number" step="0.1" value={params.cfg_scale} onChange={(e) => update('cfg_scale', Number(e.target.value))} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">denoise</label><input type="number" step="0.1" value={params.denoise} onChange={(e) => update('denoise', Number(e.target.value))} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">Sampler</label><input type="text" value={params.sampler} onChange={(e) => update('sampler', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">Schedule</label><input type="text" value={params.schedule} onChange={(e) => update('schedule', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div className="col-span-2"><label className="block text-sm font-medium mb-1">Seed</label><input type="text" value={params.seed} onChange={(e) => update('seed', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div className="col-span-2"><label className="block text-sm font-medium mb-1">额外参数（可选）</label><textarea rows={4} value={params.extra_params || ''} onChange={(e) => update('extra_params', e.target.value)} className="w-full border rounded p-2 dark:bg-card" placeholder="例如: kohya_hrfix_enabled: True, ..." /></div>
      </div>
      <div className="col-span-2">
  <label className="block text-sm font-medium mb-1">工作流 JSON（可选）</label>
  <textarea
    rows={6}
    value={params.workflow_json || ''}
    onChange={(e) => update('workflow_json', e.target.value)}
    className="w-full border rounded p-2 font-mono text-sm dark:bg-card"
    placeholder='{"id": "...", "nodes": [...], "edges": [...]}'
  />
  <p className="text-xs text-secondary mt-1"> 仅用于复制展示，不会显示内容详情</p>
</div>
    </div>
  );
}