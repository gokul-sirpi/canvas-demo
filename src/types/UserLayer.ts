import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

export type UserLayer = {
  layerName: string;
  layerId: string;
  source: VectorSource;
  layer: VectorLayer<VectorSource<Feature<Geometry>>>;
  selected: boolean;
  visible: boolean;
};
