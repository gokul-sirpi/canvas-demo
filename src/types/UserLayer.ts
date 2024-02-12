import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import VectorSource from 'ol/source/Vector';

export type UserLayer = {
  layerType: 'UserLayer';
  layerName: string;
  layerId: string;
  source: VectorSource<Feature<Geometry>>;
  selected: boolean;
  visible: boolean;
  isCompleted: boolean;
  layerColor: string;
};
