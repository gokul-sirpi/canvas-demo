import { GeoJsonObj, JsonFeature } from './GeojsonType';

export type Resource = {
  _id: string;
  id: string;
  __v: number;
  createdAt: string;
  dataSample: GeoJsonObj;
  dataset: string;
  description: string;
  icon: string;
  instance: string;
  itemCreatedAt: string;
  itemStatus: string;
  label: string;
  location: JsonFeature;
  name: string;
  ogc: string;
  provider: string;
  resourceType: string;
  updatedAt: string;
  access_status: 'Private' | 'Public';
};
