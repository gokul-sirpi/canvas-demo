import { Type } from 'ol/geom/Geometry';
import { GeoJsonObj, JsonFeature } from './GeojsonType';

export type Resource = {
  id: string;
  name: string;
  label: string;
  description: string;
  tags: string[];
  itemStatus: string;
  resourceGroup: string;
  resourceServer: string;
  provider: string;
  accessPolicy: 'SECURE' | 'OPEN';
  apdURL: string;
  resourceType: string;
  crs: string;
  datum: string;
  ogcResourceInfo: {
    ogcResourceType: string;
    geometryType: Type;
  };
  location: JsonFeature;
  dataSample: GeoJsonObj;
  instance: string;
  itemCreatedAt: string;
  ownerUserId: string;
};

export type QueryParams = {
  [x: string]: string | number;
};

export type ResourceDownload = {
  id: string;
  title: string;
  description: string;
  license: string;
  assets: {
    [x: string]: {
      title: string;
      href: string;
      type: string;
      role: string[];
      'file:size': number;
    };
  };
  type: string;
  links: {
    rel: string;
    href: string;
    type: string;
  }[];
  stac_version: string;
  extent: {
    spatial: {
      bbox: number[][];
    };
    temporal: {
      interval: [];
    };
  };
};
