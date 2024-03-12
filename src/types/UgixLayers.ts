import { FeatureStyle } from './FeatureStyle';

export type UgixLayer = {
  layerType: 'UgixLayer';
  layerName: string;
  layerId: string;
  gsixLayerId: string;
  visible: boolean;
  selected: boolean;
  isCompleted: boolean;
  layerColor: string;
  style: FeatureStyle;
};
