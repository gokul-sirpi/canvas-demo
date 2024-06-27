import { FeatureLike } from 'ol/Feature';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { FeatureStyle } from '../types/FeatureStyle';
import { Type } from 'ol/geom/Geometry';

//const opacity = '99'; //hex value for opacity

const image = new CircleStyle({
  radius: 5,
  fill: undefined,
  stroke: new Stroke({ color: 'red', width: 1 }),
});
const whiteFill = '#ffffff';
const whiteFillOpacity = '44';

//returns different style for different types of feature eg-polygon,point
export function styleFunction(feature: FeatureLike, stroke: string) {
  const type = feature.getGeometry()?.getType();
  let style: Style;
  if (type === 'LineString' || type === 'MultiLineString') {
    style = new Style({
      stroke: new Stroke({
        color: stroke,
        width: 2,
      }),
    });
  } else if (
    type === 'Circle' ||
    type === 'Polygon' ||
    type === 'MultiPolygon'
  ) {
    style = new Style({
      fill: new Fill({
        color: stroke + whiteFillOpacity,
      }),
      stroke: new Stroke({
        color: stroke,
        width: 2,
      }),
    });
  } else if (type === 'Point' || type === 'MultiPoint') {
    style = markerStyleFunction(0);
  } else {
    style = new Style({
      fill: new Fill({
        color: whiteFill + whiteFillOpacity,
      }),
      stroke: new Stroke({
        color: stroke,
      }),
      image: image,
    });
  }
  return style;
}

export function hoverStyle(style: FeatureStyle) {
  return new Style({
    stroke: new Stroke({
      color: style.fill,
      width: 2,
    }),
    fill: new Fill({
      color: style.fill + '77',
    }),
    image: new Icon({
      anchor: [0.5, 0.87],
      src: `icons/marker/${markerIcons[Number(style['marker-id'])]}`,
      width: 28,
    }),
  });
}

export function drawingStyle() {
  const style = new Style({
    stroke: new Stroke({
      width: 1,
      color: '#f86925',
      lineDash: [4, 4],
    }),
    fill: new Fill({
      color: '#f8692522',
    }),
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: '#f86925',
      }),
      stroke: new Stroke({
        width: 2,
        color: 'white',
      }),
    }),
  });
  return style;
}
export function measurementStyle() {
  const style = new Style({
    stroke: new Stroke({
      width: 2,
      lineDash: [10, 10],
    }),
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: '#ffffff44',
      }),
      stroke: new Stroke({
        width: 1,
      }),
    }),
  });
  return style;
}

export function basicBaseLayerStyle(strokeColor: string, fillColor: string) {
  const style = new Style({
    stroke: new Stroke({
      width: 0.3,
      color: strokeColor,
    }),
    fill: new Fill({
      color: fillColor,
    }),
  });
  return style;
}
export function baseOutlineStyle(strokeColor: string) {
  const style = new Style({
    stroke: new Stroke({
      width: 1,
      color: strokeColor,
    }),
    fill: new Fill({
      color: 'transparent',
    }),
  });
  return style;
}

export function featureUniqueStyle(
  type: Type,
  stroke: string,
  fill: string,
  strokeOpacity: number,
  strokeWidth: number,
  fillOpacity: number,
  iconId?: number
) {
  const fillOpStr = Math.floor(fillOpacity * 15).toString(16);
  const strokeOpStr = Math.floor(strokeOpacity * 15).toString(16);
  if (type === 'MultiPoint' || type === 'Point') {
    return markerStyleFunction(iconId || 0);
  }
  return new Style({
    fill: new Fill({
      color: fill + fillOpStr + fillOpStr,
    }),
    stroke: new Stroke({
      color: stroke + strokeOpStr + strokeOpStr,
      width: strokeWidth,
    }),
    image: new Icon({
      anchor: [0.5, 0.85],
      src: `icons/${markerIcons[iconId || 0]}`,
      width: 25,
    }),
  });
}

export function createFeatureStyle(color: string) {
  const styleObj: FeatureStyle = {
    fill: color,
    'fill-opacity': 0.3,
    stroke: color,
    'stroke-width': 2,
    'stroke-opacity': 1,
    'marker-id': 0,
  };
  return styleObj;
}

export const markerIcons = [
  'marker_red.png',
  'marker_green.png',
  'marker_blue.png',
  'marker_orange.png',
  'marker_purple.png',
  'plane.png',
  'college.png',
  'train_2.png',
  'hospital.png',
  'train_1.png',
  'fire.png',
];

export function markerStyleFunction(iconInd: number) {
  return new Style({
    image: new Icon({
      anchor: [0.5, 0.85],
      src: `icons/marker/${markerIcons[iconInd]}`,
      width: 25,
    }),
  });
}
