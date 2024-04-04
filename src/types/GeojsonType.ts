import { Type } from 'ol/render/Feature';

export type JsonFeature = {
  id: 'string';
  type: 'Feature';
  geometry: {
    type: Type;
    crs: {
      type: string;
      properties: {
        name: string;
      };
    };
    coordinates: number[][][];
  };
  properties: { [x: string]: string | number };
};

export type GeoJsonObj = {
  type: 'FeatureCollection';
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: JsonFeature[];
};
