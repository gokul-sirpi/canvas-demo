export type drawType = 'Circle' | 'Box' | 'Marker';

export type UserLayer = {
  layerType: 'UserLayer';
  layerName: string;
  layerId: string;
  selected: boolean;
  visible: boolean;
  isCompleted: boolean;
  layerColor: string;
  featureType: drawType;
};
