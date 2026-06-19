'use client';

import { NaiParams, Character } from '../../types';

interface NaiFormProps {
  params: NaiParams;
  onChange: (params: NaiParams) => void;
}

export default function NaiForm({ params, onChange }: NaiFormProps) {
  const update = (key: keyof NaiParams, value: any) => {
    onChange({ ...params, [key]: value });
  };

  const updateChar = (idx: number, field: keyof Character, value: string) => {
    const chars = [...params.characters];
    chars[idx][field] = value;
    onChange({ ...params, characters: chars });
  };

  const addChar = () => {
    if (params.characters.length >= 6) return;
    const chars = [...params.characters, { name: `Character ${params.characters.length + 1}`, prompt: '', undesired_content: '' }];
    onChange({ ...params, characters: chars });
  };

  const removeChar = (idx: number) => {
    if (params.characters.length <= 1) return;
    const chars = [...params.characters];
    chars.splice(idx, 1);
    onChange({ ...params, characters: chars });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">NAI 参数</h3>
      <div>
        <label className="block text-sm font-medium mb-1">模型名称</label>
        <input type="text" value={params.model_name} onChange={(e) => update('model_name', e.target.value)} className="w-full border rounded p-2 dark:bg-card" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">画风 prompt</label>
        <textarea rows={3} value={params.style_prompt} onChange={(e) => update('style_prompt', e.target.value)} className="w-full border rounded p-2 dark:bg-card" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">质量 prompt</label>
        <textarea rows={2} value={params.quality_prompt} onChange={(e) => update('quality_prompt', e.target.value)} className="w-full border rounded p-2 dark:bg-card" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">NL（可选）</label>
        <textarea rows={2} value={params.nl || ''} onChange={(e) => update('nl', e.target.value)} className="w-full border rounded p-2 dark:bg-card" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Base Prompt</label>
        <textarea rows={4} value={params.base_prompt} onChange={(e) => update('base_prompt', e.target.value)} className="w-full border rounded p-2 dark:bg-card" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Undesired Content</label>
        <textarea rows={4} value={params.undesired_content} onChange={(e) => update('undesired_content', e.target.value)} className="w-full border rounded p-2 dark:bg-card" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">分辨率</label><input type="text" value={params.resolution} onChange={(e) => update('resolution', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">Steps</label><input type="number" value={params.steps} onChange={(e) => update('steps', Number(e.target.value))} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">Prompt Guidance</label><input type="number" step="0.1" value={params.prompt_guidance} onChange={(e) => update('prompt_guidance', Number(e.target.value))} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">Variety+</label><select value={params.variety} onChange={(e) => update('variety', e.target.value as 'on' | 'off')} className="w-full border rounded p-2 dark:bg-card"><option value="on">On</option><option value="off">Off</option></select></div>
        <div><label className="block text-sm font-medium mb-1">Sampler</label><input type="text" value={params.sampler} onChange={(e) => update('sampler', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div><label className="block text-sm font-medium mb-1">Schedule</label><input type="text" value={params.schedule} onChange={(e) => update('schedule', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
        <div className="col-span-2"><label className="block text-sm font-medium mb-1">Seed</label><input type="text" value={params.seed} onChange={(e) => update('seed', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
      </div>
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Characters（最多6个）</h4>
          <button type="button" onClick={addChar} disabled={params.characters.length >= 6} className="px-3 py-1 bg-primary-dark text-white rounded disabled:opacity-50 text-sm">+ 添加</button>
        </div>
        {params.characters.map((char, idx) => (
          <div key={idx} className="border p-3 rounded mb-3">
            <div className="flex justify-between items-center">
              <h5 className="font-medium">{char.name}</h5>
              <button type="button" onClick={() => removeChar(idx)} disabled={params.characters.length <= 1} className="text-red-600 text-sm disabled:opacity-50">删除</button>
            </div>
            <div className="mt-2"><label className="block text-sm">Prompt</label><textarea rows={2} value={char.prompt} onChange={(e) => updateChar(idx, 'prompt', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
            <div className="mt-2"><label className="block text-sm">Undesired Content</label><textarea rows={2} value={char.undesired_content} onChange={(e) => updateChar(idx, 'undesired_content', e.target.value)} className="w-full border rounded p-2 dark:bg-card" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}