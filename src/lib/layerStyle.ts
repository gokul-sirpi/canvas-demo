import { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { FeatureStyle } from '../types/FeatureStyle';

const opacity = '99'; //hex value for opacity

const image = new CircleStyle({
  radius: 5,
  fill: undefined,
  stroke: new Stroke({ color: 'red', width: 1 }),
});
const whiteFill = '#ffffff';
const whiteFillOpacity = '55';

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
        color: whiteFill + whiteFillOpacity,
      }),
      stroke: new Stroke({
        color: stroke,
        width: 2,
      }),
    });
  } else if (type === 'Point' || type === 'MultiPoint') {
    style = new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({
          color: stroke + opacity,
        }),
        stroke: new Stroke({ color: stroke, width: 1 }),
      }),
    });
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

export function basicBaseLayerStyle(color: string) {
  const style = new Style({
    stroke: new Stroke({
      width: 2,
      color: color,
    }),
    fill: new Fill({
      color: color + '33',
    }),
  });
  return style;
}

export function featureUniqueStyle(
  stroke: string,
  fill: string,
  strokeOpacity: number,
  strokeWidth: number,
  fillOpacity: number
) {
  const fillOpStr = Math.floor(fillOpacity * 15).toString(16);
  const strokeOpStr = Math.floor(strokeOpacity * 15).toString(16);
  return new Style({
    fill: new Fill({
      color: fill + fillOpStr + fillOpStr,
    }),
    stroke: new Stroke({
      color: stroke + strokeOpStr + strokeOpStr,
      width: strokeWidth,
    }),
    image: new CircleStyle({
      radius: 4,
      fill: new Fill({
        color: fill + fillOpStr + fillOpStr,
      }),
      stroke: new Stroke({
        color: stroke + strokeOpStr + strokeOpStr,
        width: strokeWidth,
      }),
    }),
  });
}

export function createFeatureStyle(color: string) {
  const styleObj: FeatureStyle = {
    fill: whiteFill,
    'fill-opacity': 0.4,
    stroke: color,
    'stroke-width': 2,
    'stroke-opacity': 1,
  };
  return styleObj;
}
