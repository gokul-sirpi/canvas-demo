import { FeatureStyle } from './FeatureStyle';

export type drawType =
  | 'Circle'
  | 'Box'
  | 'Marker'
  | 'Polygon'
  | 'Measure'
  | 'Line';

export type UserLayer = {
  layerType: 'UserLayer';
  layerName: string;
  layerId: string;
  selected: boolean;
  visible: boolean;
  isCompleted: boolean;
  layerColor: string;
  featureType: drawType | 'GeometryCollection';
  editable: boolean;
  style: FeatureStyle;
};
