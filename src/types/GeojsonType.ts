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
  properties: GenericObject;
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

export type GenericObject = { [x: string]: string | number | null };
