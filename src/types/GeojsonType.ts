import { Type } from 'ol/render/Feature';

type JsonFeature = {
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
    coordinates: number[] | number[][][];
  };
  properties: object;
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
