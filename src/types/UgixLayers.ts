import { Type } from 'ol/geom/Geometry';
import { FeatureStyle } from './FeatureStyle';

export type UgixLayer = {
  layerType: 'UgixLayer';
  layerName: string;
  layerId: string;
  ugixLayerId: string;
  ugixGroupId: string;
  visible: boolean;
  selected: boolean;
  isCompleted: boolean;
  layerColor: string;
  style: FeatureStyle;
  featureType: Type;
  fetching: boolean;
  editable: boolean;
};
