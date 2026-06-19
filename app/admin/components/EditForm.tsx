'use client';

import { ModelType, NaiParams, AnimaParams, SdParams, NewbieParams } from '../types';
import NaiForm from './form-fields/NaiForm';
import AnimaForm from './form-fields/AnimaForm';
import SdForm from './form-fields/SdForm';
import NewbieForm from './form-fields/NewbieForm';

interface EditFormProps {
  model: ModelType;
  naiParams: NaiParams;
  animaParams: AnimaParams;
  sdParams: SdParams;
  onNaiChange: (params: NaiParams) => void;
  onAnimaChange: (params: AnimaParams) => void;
  onSdChange: (params: SdParams) => void;
}

export default function EditForm({
  model,
  naiParams,
  animaParams,
  sdParams,
  onNaiChange,
  onAnimaChange,
  onSdChange,
}: EditFormProps) {
  switch (model) {
    case 'nai':
      return <NaiForm params={naiParams} onChange={onNaiChange} />;
    case 'anima':
      return <AnimaForm params={animaParams} onChange={onAnimaChange} />;
    case 'sd':
      return <SdForm params={sdParams} onChange={onSdChange} />;
    case 'newbie':
      return <NewbieForm />;
    default:
      return null;
  }
}