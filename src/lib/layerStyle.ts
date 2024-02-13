import { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

const opacity = '99'; //hex value for opacity

const image = new CircleStyle({
  radius: 5,
  fill: undefined,
  stroke: new Stroke({ color: 'red', width: 1 }),
});
const whiteFill = '#ffffff55';

//returns different style for different types of feature eg-polygon,point
function styleFunction(feature: FeatureLike, color: string) {
  const type = feature.getGeometry()?.getType();
  let style: Style;
  if (type === 'LineString' || type === 'MultiLineString') {
    style = new Style({
      stroke: new Stroke({
        color: color,
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
        color: whiteFill,
      }),
      stroke: new Stroke({
        color: color,
        width: 2,
      }),
    });
  } else if (type === 'Point' || type === 'MultiPoint') {
    style = new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({
          color: color + opacity,
        }),
        stroke: new Stroke({ color: color, width: 1 }),
      }),
    });
  } else {
    style = style = new Style({
      fill: new Fill({
        color: color + opacity,
      }),
      stroke: new Stroke({
        color: color,
      }),
      image: image,
    });
  }
  return style;
}

export default styleFunction;
