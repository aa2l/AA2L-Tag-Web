// app/gallery/constants.ts

import { ModelType } from './types';

// NSFW 解锁密钥
export const NSFW_KEY = 'AA2L-F103-C8T6';

// 所有模型列表
export const ALL_MODELS: ModelType[] = ['nai', 'sd', 'anima', 'newbie'];

// 模型标签映射（用于显示）
export const MODEL_LABELS: Record<ModelType, string> = {
  nai: 'NAI',
  sd: 'SD',
  anima: 'Anima',
  newbie: 'Newbie',
};