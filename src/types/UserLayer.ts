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
  readonly layerType: 'UserLayer';
  readonly layerId: string;
  layerName: string;
  selected: boolean;
  visible: boolean;
  isCompleted: boolean;
  layerColor: string;
  featureType: drawType | 'GeometryCollection';
  editable: boolean;
  style: FeatureStyle;
};
