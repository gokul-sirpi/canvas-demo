import { Type } from 'ol/geom/Geometry';
import { FeatureStyle } from './FeatureStyle';


export type UgixLayer = {
  layerType: 'UgixLayer';
  sourceType: 'tile' | 'raster' | 'json';
  layerName: string;
  layerId: string;
  ugixLayerId: string;
  ugixGroupId: string;
  visible: boolean;
  selected: boolean;
  isCompleted: boolean;
  layerColor: string;
  style: FeatureStyle;
  featureType: Type | "Static";
  fetching: boolean;
  editable: boolean;
  side: 'left' | 'right' | 'middle';
};

export type StacAssetRole = 'thumbnail' | 'overview' | 'data' | 'metadata' | string;

export interface StacAsset {
  href: string;
  type: string;
  roles?: StacAssetRole[];
  title?: string;
  properties?: Record<string, any>;
  collection_id?: string;
  'file:size'?: number;
  description?: string;
}

export interface StacItem {
  id: string;
  type: string;
  bbox: number[];
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    datetime: string;
    [key: string]: any;
  };
  assets: {
    [key: string]: StacAsset;
  };
  collection: string;
  links: Array<{
    rel: string;
    type: string;
    href: string;
  }>;
}
