import VectorLayer from 'ol/layer/Vector';
import { FeatureStyle } from './FeatureStyle';
import VectorSource from 'ol/source/Vector';

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
  featureType: drawType;
  editable: boolean;
  style: FeatureStyle;
  side: 'left' | 'right' | 'middle';
};

export type CanvasLayer = {
  layerId: string;
  layerName: string;
  layerType: 'UserLayer' | 'UgixLayer';
  layer: VectorLayer<VectorSource>;
  style: FeatureStyle;
  side: 'left' | 'right' | 'middle';
};
