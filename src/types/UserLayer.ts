import { FeatureStyle } from './FeatureStyle';

export type drawType =
  | 'Circle'
  | 'Rectangle'
  | 'Point'
  | 'Polygon'
  | 'Measure'
  | 'Line'
  | 'GeometryCollection';

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
