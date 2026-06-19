// app/gallery/_components/ParamRenderers/NaiParams.tsx

import { NaiParams, Character } from '../../types';

interface NaiParamsRendererProps {
  params: NaiParams;
}

export default function NaiParamsRenderer({ params: p }: NaiParamsRendererProps) {
  const characters = p.characters as Character[] | undefined;

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

      {p.nl && (
        <div>
          <span className="text-secondary text-sm">NL：</span>
          <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
            {p.nl}
          </div>
        </div>
      )}

      <div>
        <span className="text-secondary text-sm">Base Prompt：</span>
        <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
          {p.base_prompt}
        </div>
      </div>

      <div>
        <span className="text-secondary text-sm">Undesired Content：</span>
        <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
          {p.undesired_content}
        </div>
      </div>

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
          <span className="text-secondary text-sm">Prompt Guidance：</span>
          <span className="text-foreground text-sm ml-1">{p.prompt_guidance}</span>
        </div>
        <div>
          <span className="text-secondary text-sm">Variety+：</span>
          <span className="text-foreground text-sm ml-1">{p.variety}</span>
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

      {characters && characters.length > 0 && characters.some((c) => c.prompt || c.undesired_content) && (
        <div>
          <div className="text-secondary text-sm mb-1.5">Characters：</div>
          {characters.map((c, idx) => {
            if (!c.prompt && !c.undesired_content) return null;
            return (
              <div key={idx} className="border-l-2 border-pink-200/50 dark:border-pink-800/30 pl-3 mb-3 last:mb-0">
                <div className="font-medium text-sm text-foreground mb-0.5">{c.name}</div>
                <div>
                  <span className="text-secondary text-sm">Prompt：</span>
                  <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
                    {c.prompt}
                  </div>
                </div>
                <div>
                  <span className="text-secondary text-sm">Undesired：</span>
                  <div className="bg-pink-50/30 dark:bg-pink-900/25 p-3 rounded-xl text-foreground text-sm whitespace-pre-wrap mt-0.5">
                    {c.undesired_content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}