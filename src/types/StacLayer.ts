import { FeatureStyle } from './FeatureStyle';

export type StacLayer = {
  layerType: 'StacLayer';
  layerName: string;
  layerId: string;
  stacCollectionId: string;
  stacItemId: string;
  visible: boolean;
  selected: boolean;
  isCompleted: boolean;
  layerColor: string;
  style: FeatureStyle;
  fetching: boolean;
  editable: boolean;
  opacity?: number;
  side: 'left' | 'right' | 'middle';
};
