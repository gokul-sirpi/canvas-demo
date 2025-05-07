import VectorLayer from 'ol/layer/Vector';
import { FeatureStyle } from './FeatureStyle';
import VectorSource from 'ol/source/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';

export type DrawType =
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
  featureType: DrawType;
  editable: boolean;
  style: FeatureStyle;
  side: 'left' | 'right' | 'middle';
};

export type CanvasLayer = {
  layerId: string;
  layerName: string;
  layerType: 'UserLayer' | 'UgixLayer' | 'StacLayer' | 'BBoxLayer';
  layer:
    | VectorLayer<VectorSource>
    | VectorTileLayer
    | ImageLayer<ImageSource>
    | VectorLayer<VectorSource<Feature<Polygon>>>;
  style: FeatureStyle;
  side: 'left' | 'right' | 'middle';
};
