import VectorLayer from 'ol/layer/Vector';
import { FeatureStyle } from './FeatureStyle';
import VectorTileLayer from 'ol/layer/VectorTile';
import STACLayer from 'ol-stac'; // Assuming this is the correct import for STACLayer

export type DrawType =
  | 'Circle'
  | 'Rectangle'
  | 'Point'
  | 'Polygon'
  | 'Measure'
  | 'Line'
  | 'GeometryCollection';

export type CustomLayer =
  | VectorLayer<any>
  | VectorTileLayer<any>
  | STACLayer
  | any; // The `any` type is used for flexibility, but you can make this more specific if you know the other possible layer types.

export type UserLayer = {
  readonly layerType: 'UserLayer';
  readonly layerId: string;
  layerName: string;
  selected: boolean;
  visible: boolean;
  isCompleted: boolean;
  layerColor: string;
  featureType: DrawType;
  editable: boolean;
  style: FeatureStyle;
  side: 'left' | 'right' | 'middle';
};

export type CanvasLayer = {
  layerId: string;
  layerName: string;
  layerType: 'UserLayer' | 'UgixLayer' | 'StacLayer'; // Including UgixLayer and StacLayer
  layer: CustomLayer; // This can be any of the specified layer types
  style: FeatureStyle;
  side: 'left' | 'right' | 'middle';
  opacity?: number; // Optional property for opacity
};

// import VectorLayer from 'ol/layer/Vector';
// import { FeatureStyle } from './FeatureStyle';
// import VectorTileLayer from 'ol/layer/VectorTile';
// import STACLayer from 'ol-stac';
// export type DrawType =
//   | 'Circle'
//   | 'Rectangle'
//   | 'Point'
//   | 'Polygon'
//   | 'Measure'
//   | 'Line'
//   | 'GeometryCollection';

// export type CustomLayer =
//   | VectorLayer<any>
//   | VectorTileLayer<any>
//   | STACLayer
//   | any;

// export type UserLayer = {
//   readonly layerType: 'UserLayer';
//   readonly layerId: string;
//   layerName: string;
//   selected: boolean;
//   visible: boolean;
//   isCompleted: boolean;
//   layerColor: string;
//   featureType: DrawType;
//   editable: boolean;
//   style: FeatureStyle;
//   side: 'left' | 'right' | 'middle';
// };

// export type CanvasLayer = {
//   layerId: string;
//   layerName: string;
//   layerType: 'UserLayer' | 'UgixLayer' | 'StacLayer';
//   layer: CustomLayer;
//   style: FeatureStyle;
//   side: 'left' | 'right' | 'middle';
// };
