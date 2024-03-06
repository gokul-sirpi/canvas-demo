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
    geometryType: string;
  };
  location: JsonFeature;
  dataSample: GeoJsonObj;
  instance: string;
  itemCreatedAt: string;
  ownerUserId: string;
};
