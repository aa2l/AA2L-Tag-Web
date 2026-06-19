// app/gallery/types.ts

export type ModelType = 'nai' | 'sd' | 'anima' | 'newbie';

export interface Character {
  name: string;
  prompt: string;
  undesired_content: string;
}

export interface NaiParams {
  model_name: string;
  style_prompt: string;
  quality_prompt: string;
  nl?: string;
  base_prompt: string;
  undesired_content: string;
  resolution: string;
  steps: number;
  prompt_guidance: number;
  variety: 'on' | 'off';
  sampler: string;
  schedule: string;
  seed: string;
  characters: Character[];
}

export interface AnimaParams {
  model_name: string;
  style_prompt: string;
  quality_prompt: string;
  nl?: string;
  positive_prompt: string;
  negative_prompt: string;
  loras: string[];
  resolution: string;
  steps: number;
  cfg: number;
  denoise: number;
  sampler: string;
  schedule: string;
  seed: string;
  workflow_json?: string;
}

export interface SdParams {
  model_name: string;
  style_prompt: string;
  quality_prompt: string;
  positive_prompt: string;
  negative_prompt: string;
  loras: string[];
  resolution: string;
  steps: number;
  cfg_scale: number;
  denoise: number;
  sampler: string;
  schedule: string;
  seed: string;
  extra_params?: string;
  workflow_json?: string;
}

export type NewbieParams = Record<string, never>;
export type ModelParams = NaiParams | AnimaParams | SdParams | NewbieParams;

// ========== 核心改动：增加 blur_image_url ==========
export interface ImageRecord {
  id: number;
  image_url: string;
  blur_image_url: string;      // ← 新增：模糊预览图路径
  author: string;
  model: ModelType;
  params: ModelParams;
  nsfw: boolean;
  created_at: string;
}