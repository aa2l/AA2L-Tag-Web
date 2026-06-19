// app/gallery/components/ParamRenderers/index.tsx

import { ModelParams, ModelType } from '../../types';
import NaiParamsRenderer from './NaiParams';
import AnimaParamsRenderer from './AnimaParams';
import SdParamsRenderer from './SdParams';

interface ParamRendererProps {
  model: ModelType;
  params: ModelParams;
}

export default function ParamRenderer({ model, params }: ParamRendererProps) {
  switch (model) {
    case 'nai':
      return <NaiParamsRenderer params={params as any} />;
    case 'anima':
      return <AnimaParamsRenderer params={params as any} />;
    case 'sd':
      return <SdParamsRenderer params={params as any} />;
    case 'newbie':
      return <p className="text-secondary italic">暂无参数信息</p>;
    default:
      return null;
  }
}

// 也可以单独导出各个渲染器（可选）
export { NaiParamsRenderer, AnimaParamsRenderer, SdParamsRenderer };