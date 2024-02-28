import { Feature, Map, Overlay, View } from 'ol';
import { drawType } from '../types/UserLayer';
import { Attribution, ScaleLine } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import Draw, {
  DrawEvent,
  SketchCoordType,
  createBox,
} from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/VectorImage';
import { UserLayer } from '../types/UserLayer';
import { Style, Icon } from 'ol/style';
import { LineString, Point, Polygon, SimpleGeometry } from 'ol/geom';
import GeoJson from 'ol/format/GeoJSON';
import marker from '../assets/icons/generic_marker.png';
import { GeoJsonObj } from '../types/GeojsonType';
import { styleFunction, measurementStyle } from './layerStyle';
import { GsixLayer } from '../types/gsixLayers';
import { getArea, getDistance, getLength } from 'ol/sphere.js';
import { circular } from 'ol/geom/Polygon';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import VectorImageLayer from 'ol/layer/VectorImage';

const standardLayer = new TileLayer({
  source: new OSM({}),
});
const scaleControl = new ScaleLine({
  units: 'metric',
  minWidth: 100,
});
const attribution = new Attribution({ collapsible: false });

const markerStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    height: 35,
    src: marker,
  }),
});

// Map properties and methods
const openLayerMap = {
  draw: new Draw({ type: 'Circle' }),
  drawing: false,
  latestLayer: null as UserLayer | null,
  measureTooltip: null as Overlay | null,
  tooltipElement: null as HTMLDivElement | null,
  map: new Map({
    view: new View({
      center: [78.9629, 22.5397],
      projection: 'EPSG:4326',
      zoom: 5,
      minZoom: 5,
    }),
    controls: [scaleControl, attribution],
    layers: [standardLayer],
  }),

  replaceBasemap(newLayers: TileLayer<OSM> | VectorImageLayer<VectorSource>) {
    this.map.getLayers().removeAt(0);
    this.map.getLayers().insertAt(0, newLayers);
  },

  setOlTarget(target: string) {
    this.map.setTarget(target);
  },
  removeDrawInteraction() {
    if (this.drawing) {
      this.map.removeInteraction(this.draw);
      this.drawing = false;
    }
  },

  addLayer(layer: VectorLayer<VectorSource>) {
    this.map.addLayer(layer);
  },

  removeLayer(layerId: string) {
    const layer = this.getLayer(layerId);
    if (layer) {
      this.map.removeLayer(layer);
    }
  },

  getLayer(layerId: string): VectorLayer<VectorSource> | undefined {
    let reqLayer;
    this.map.getLayers().forEach((layer) => {
      if (layer.get('layer-id') === layerId) {
        reqLayer = layer;
      }
    });
    return reqLayer;
  },

  createDrawableUserLayer(
    layerName: string,
    featureType: drawType
  ): UserLayer & { source: VectorSource } {
    const source = new VectorSource({});
    const featureColor = getRandomColor();
    const layer = new VectorLayer({
      source: source,
      style: (feature) => styleFunction(feature, featureColor),
    });
    const layerId = createUniqueId();
    layer.set('layer-id', layerId);
    const newLayer = {
      layerType: 'UserLayer' as const,
      layerName: layerName,
      layerId,
      source,
      selected: true,
      visible: true,
      isCompleted: false,
      layerColor: featureColor,
      featureType: featureType,
    };
    this.map.addLayer(layer);
    this.latestLayer = newLayer;
    return newLayer;
  },
  createNewUserLayer(
    layerName: string,
    featureType: drawType | 'GeometryCollection'
  ) {
    const layerColor = getRandomColor();
    const layerId = createUniqueId();
    const newLayer: UserLayer = {
      layerType: 'UserLayer',
      layerName: layerName,
      layerId,
      selected: true,
      visible: true,
      isCompleted: false,
      layerColor,
      featureType: featureType,
    };
    return newLayer;
  },
  createNewUgixLayer(layerName: string, ugixId: string) {
    const layerColor = getRandomColor();
    const layerId = createUniqueId();
    const newLayer: GsixLayer = {
      layerType: 'GsixLayer',
      layerName: layerName,
      layerId,
      gsixLayerId: ugixId,
      selected: true,
      visible: true,
      isCompleted: true,
      layerColor,
    };
    return newLayer;
  },

  changeLayerColor(layerId: string, color: string) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.setStyle((feature) => styleFunction(feature, color));
    }
  },

  addDrawFeature(
    type: 'Circle' | 'Box' | 'Polygon' | 'Measure' | 'Line',
    source: VectorSource,
    callback?: (event: DrawEvent) => void
  ) {
    this.removeDrawInteraction();
    switch (type) {
      case 'Box':
        this.draw = new Draw({
          type: 'Circle',
          source: source,
          geometryFunction: createBox(),
        });
        break;
      case 'Circle':
        this.draw = new Draw({
          type: 'Circle',
          source: source,
          geometryFunction: circleGeomatryFunction,
        });
        break;
      case 'Polygon':
        this.draw = new Draw({
          type: 'Polygon',
          source: source,
        });
        break;
      case 'Line':
        this.draw = new Draw({
          type: 'LineString',
          source: source,
        });
        break;
      case 'Measure':
        this.draw = new Draw({
          type: 'LineString',
          source: source,
          style: () => measurementStyle(),
        });
        break;
      default:
        this.removeDrawInteraction();
        return;
    }
    this.map.addInteraction(this.draw);
    this.drawing = true;
    if (this.measureTooltip) {
      this.map.addOverlay(this.measureTooltip);
    }
    let drawChangeListener: EventsKey | undefined;
    this.draw.on('drawstart', (evt) => {
      const { measureTooltip, tooltipElement } = createMeasureTooltip();
      this.measureTooltip = measureTooltip;
      this.tooltipElement = tooltipElement;
      this.map.addOverlay(measureTooltip);
      const feature = evt.feature;
      drawChangeListener = feature
        .getGeometry()
        ?.on('change', function (event) {
          const geom = event.target;
          let output = '';
          let tooltipPosition;
          if (geom instanceof LineString) {
            output = formatLength(geom);
            tooltipPosition = geom.getLastCoordinate();
          } else if (geom instanceof Polygon) {
            output = formatArea(geom);
            tooltipPosition = geom.getInteriorPoint().getCoordinates();
          }
          if (output[0] !== '0') {
            tooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipPosition);
          }
        });
    });
    this.draw.on('drawend', (event) => {
      if (this.tooltipElement) {
        this.tooltipElement.remove();
        this.tooltipElement = null;
      }
      if (this.measureTooltip) {
        this.measureTooltip.dispose();
        this.measureTooltip = null;
      }
      if (drawChangeListener) {
        unByKey(drawChangeListener);
      }
      if (callback) {
        callback(event);
      }
    });
    this.draw.on('drawabort', () => {
      if (this.tooltipElement) {
        this.tooltipElement.remove();
        this.tooltipElement = null;
      }
      if (this.measureTooltip) {
        this.measureTooltip.dispose();
        this.measureTooltip = null;
      }
      if (drawChangeListener) {
        unByKey(drawChangeListener);
      }
    });
  },

  addMarkerFeature(source: VectorSource, callback?: () => void) {
    this.removeDrawInteraction();
    this.draw = new Draw({
      type: 'Point',
    });
    this.map.addInteraction(this.draw);
    this.drawing = true;
    this.draw.on('drawend', (drawEvent) => {
      const marker = new Feature({
        geometry: new Point(drawEvent.target.sketchCoords_),
        name: 'marker',
      });
      marker.setStyle(markerStyle);
      source.addFeature(marker);
      if (callback) {
        callback();
      }
    });
  },

  addGeoJsonFeature(
    geojsonData: GeoJsonObj,
    layerId: string,
    layerColor: string
  ) {
    geojsonData.crs = {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    };
    // for (const feature of geojsonData.features) {
    //   feature.type = 'Feature';
    // }
    const vectorSource = new VectorSource({
      features: new GeoJson().readFeatures(geojsonData),
      format: new GeoJson(),
    }) as VectorSource;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => styleFunction(feature, layerColor),
      declutter: true,
    });
    vectorLayer.set('layer-id', layerId);
    this.addLayer(vectorLayer);
  },

  toggleLayerVisibility(layerId: string, visible: boolean) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.setVisible(visible);
    }
  },

  getLayerVisibility(layerId: string): boolean | undefined {
    return this.getLayer(layerId)?.isVisible();
  },

  zoomToFit(layerId: string) {
    const extent = this.getLayer(layerId)?.getSource()?.getExtent();
    const view = this.map.getView();
    if (extent) {
      view.fit(extent, { padding: [100, 100, 100, 100] });
    }
  },

  distanceBetweenPoints(point1: number[], point2: number[]) {
    const lat1 = point1[0] / 57.295;
    const lat2 = point2[0] / 57.295;
    const lng1 = point1[1] / 57.295;
    const lng2 = point2[1] / 57.295;
    const distance =
      6371 *
      Math.acos(
        Math.sin(lat1) * Math.sin(lat2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
      );
    return distance;
  },
  exportAsImage(anchor: HTMLAnchorElement, imageName: string) {
    const mapCanvas = document.createElement('canvas');
    const allCanvas = this.map
      .getViewport()
      .querySelectorAll(
        '.ol-layer canvas, canvas.ol-layer'
      ) as NodeListOf<HTMLCanvasElement>;

    mapCanvas.width = allCanvas[0].width;
    mapCanvas.height = allCanvas[0].height;
    const mapContext = mapCanvas.getContext('2d');
    if (!mapContext) return [new Error('No context found')];

    this.map.once('rendercomplete', function () {
      for (const canvas of allCanvas) {
        if (canvas.width > 0) {
          mapContext.globalAlpha = 1;
          let matrix = [
            parseFloat(canvas.style.width) / canvas.width,
            0,
            0,
            parseFloat(canvas.style.height) / canvas.height,
            0,
            0,
          ] as DOMMatrix2DInit;
          const transform = canvas.style.transform;
          if (transform) {
            const newMatrix = transform.match(/^matrix\(([^(]*)\)$/);
            if (newMatrix) {
              const num = newMatrix[1].split(',').map(Number);
              matrix = num as DOMMatrix2DInit;
            }
          }
          mapContext.setTransform(matrix);
          mapContext.drawImage(canvas, 0, 0);
        }
      }
      mapContext.setTransform(1, 0, 0, 1, 0, 0);
      anchor.href = mapCanvas.toDataURL();
      anchor.download = `${imageName}.jpeg`;
      anchor.click();
    });
    this.map.renderSync();
    return null;
  },
  exportAsGeoJson(anchor: HTMLAnchorElement, exportName: string) {
    let allGeoData: undefined | GeoJsonObj;
    this.map.getLayers().forEach((layer) => {
      const layerId = layer.get('layer-id');
      if (layerId && layer instanceof VectorLayer) {
        if (!layer.getVisible()) return;
        const source = layer.getSource() as VectorSource;
        const features = source.getFeatures();
        const geojsonData = new GeoJson().writeFeaturesObject(features);
        console.log(geojsonData);
        if (!allGeoData) {
          allGeoData = geojsonData;
        } else {
          allGeoData.features = allGeoData.features.concat(
            geojsonData.features
          );
        }
      }
    });
    const file = new Blob([JSON.stringify(allGeoData)], {
      type: 'text/json;charset=utf-8',
    });
    anchor.href = URL.createObjectURL(file);
    anchor.download = `${exportName}.json`;
    anchor.click();
  },
};
// basic map interactions

// Utility functions
function circleGeomatryFunction(
  coordinates: SketchCoordType,
  geometry: SimpleGeometry
) {
  const center = coordinates[0] as number[];
  const last = coordinates[coordinates.length - 1] as number[];
  const radius = getDistance(center, last);
  const circle = circular(center, radius, 128);
  const coord = circle.getCoordinates();
  if (!geometry) {
    geometry = new Polygon(coord);
  } else {
    geometry.setCoordinates(coord);
  }
  return geometry;
}

function formatLength(line: LineString) {
  const length = getLength(line, { projection: 'EPSG:4326' });
  let output;
  if (length > 1000) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
}

function formatArea(polygon: Polygon) {
  const area = getArea(polygon, { projection: 'EPSG:4326' });
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
}

function createMeasureTooltip() {
  const tooltipElement = document.createElement('div');
  tooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  const measureTooltip = new Overlay({
    element: tooltipElement,
    offset: [0, -5],
    positioning: 'bottom-center',
    stopEvent: false,
  });
  return { measureTooltip, tooltipElement };
}
//creates unique id for layers
let id = 0;
function createUniqueId() {
  const time = Date.now().toString();
  const random = Math.random().toString(16).slice(2, 10);
  return time + random + id++;
}

//creates random hex color
function getRandomColor(): string {
  let num = '';
  for (let i = 0; i < 6; i++) {
    num += Math.floor(Math.random() * 11).toString(16);
  }
  return '#' + num;
}

export default openLayerMap;
