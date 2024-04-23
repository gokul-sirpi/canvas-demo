import { Feature, Map, Overlay, View } from 'ol';
import { Pixel } from 'ol/pixel';
import { drawType } from '../types/UserLayer';
import { Attribution, ScaleLine } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import Draw, {
  DrawEvent,
  SketchCoordType,
  createBox,
} from 'ol/interaction/Draw';
import { Snap } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { UserLayer } from '../types/UserLayer';
import { Geometry, LineString, Point, Polygon, SimpleGeometry } from 'ol/geom';
import GeoJson from 'ol/format/GeoJSON';
import { GeoJsonObj } from '../types/GeojsonType';
import {
  styleFunction,
  measurementStyle,
  createFeatureStyle,
  featureUniqueStyle,
  markerStyleFunction,
  drawingStyle,
  hoverStyle,
} from './layerStyle';
import { UgixLayer } from '../types/UgixLayers';
import { getArea, getDistance, getLength } from 'ol/sphere.js';
import { circular } from 'ol/geom/Polygon';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import VectorImageLayer from 'ol/layer/VectorImage';
import { FeatureStyle } from '../types/FeatureStyle';
import { FeatureLike } from 'ol/Feature';
import { Type as GeometryType } from 'ol/geom/Geometry';
import JSZip from 'jszip';
import { Style } from 'ol/style';
type baseLayerTypes =
  | 'terrain'
  | 'openseriesmap'
  | 'standard'
  | 'humanitarian'
  | 'ogc_layer_light'
  | 'ogc_layer_dark';
const scaleControl = new ScaleLine({
  units: 'metric',
  minWidth: 100,
});
const attribution = new Attribution({ collapsible: false });

// Map properties and methods
const openLayerMap = {
  draw: new Draw({ type: 'Circle' }),
  drawing: false,
  latestLayer: null as UserLayer | UgixLayer | null,
  indianOutline: null as VectorImageLayer<VectorSource> | null,
  measureTooltip: null as Overlay | null,
  tooltipElement: null as HTMLDivElement | null,
  popupOverLay: new Overlay({}),
  map: new Map({
    view: new View({
      center: [78.9629, 22.5397],
      projection: 'EPSG:4326',
      zoom: 4.5,
      // minZoom: 4,
    }),
    controls: [scaleControl, attribution],
    layers: [],
  }),
  replaceBasemap(
    baseMapType: baseLayerTypes,
    newLayers:
      | VectorLayer<VectorSource>
      | TileLayer<OSM>
      | VectorImageLayer<VectorSource>
  ) {
    this.map.getAllLayers().forEach((layer) => {
      if (layer.get('baseLayer')) {
        this.map.removeLayer(layer);
      }
    });
    const layers = this.map.getLayers();
    layers.insertAt(0, newLayers);
    if (baseMapType !== 'ogc_layer_dark' && baseMapType !== 'ogc_layer_light') {
      if (this.indianOutline) {
        if (layers.getLength() === 1) {
          this.map.addLayer(this.indianOutline);
        } else {
          layers.insertAt(1, this.indianOutline);
        }
      }
    }
  },
  insertBaseMap(
    baseMapType: baseLayerTypes,
    baseLayer: TileLayer<OSM> | VectorImageLayer<VectorSource>
  ) {
    this.map.getLayers().insertAt(0, baseLayer);
    if (baseMapType !== 'ogc_layer_dark' && baseMapType !== 'ogc_layer_light') {
      if (this.indianOutline) {
        this.map.getLayers().insertAt(1, this.indianOutline);
        // this.map.addLayer(this.indianOutline);
      }
    }
  },

  setOlTarget(target: string) {
    this.map.setTarget(target);
  },
  removeDrawInteraction() {
    if (this.drawing) {
      this.map.removeInteraction(this.draw);
      this.drawing = false;
    }
    if (this.latestLayer) {
      const layerId = this.latestLayer.layerId;
      const source = this.getLayer(layerId)?.getSource();
      if (source) {
        const featureLength = source.getFeatures().length;
        if (featureLength === 0) {
          this.removeLayer(layerId);
        }
      }
    }
  },

  addLayer(layer: VectorLayer<VectorSource> | VectorImageLayer<VectorSource>) {
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

  createNewUserLayer(layerName: string, featureType: drawType): UserLayer {
    const source = new VectorSource({});
    const featureColor = getRandomColor();
    const layer = new VectorImageLayer({
      source: source,
      style: (feature) => styleFunction(feature, featureColor),
    });
    const featureStyle = createFeatureStyle(featureColor);
    const layerId = createUniqueId();
    layer.set('layer-id', layerId);
    const newLayer: UserLayer = {
      layerType: 'UserLayer' as const,
      layerName: layerName,
      layerId,
      selected: true,
      visible: true,
      isCompleted: false,
      layerColor: featureColor,
      featureType: featureType,
      style: featureStyle,
      editable: true,
    };
    this.map.addLayer(layer);
    this.removeDrawInteraction();
    this.latestLayer = newLayer;
    return newLayer;
  },
  createNewUgixLayer(
    layerName: string,
    ugixId: string,
    ugixGroupId: string,
    type: GeometryType
  ) {
    const layerColor = getRandomColor();
    const featureStyle = createFeatureStyle(layerColor);
    const layerId = createUniqueId();
    const vectorSource = new VectorSource({});
    const newVectorLayer = new VectorImageLayer({
      source: vectorSource,
      style: (feature) => styleFunction(feature, layerColor),
    });
    newVectorLayer.set('layer-id', layerId);
    this.addLayer(newVectorLayer);
    const newLayer: UgixLayer = {
      layerType: 'UgixLayer',
      layerName: layerName,
      layerId,
      ugixLayerId: ugixId,
      ugixGroupId: ugixGroupId,
      selected: true,
      visible: true,
      isCompleted: true,
      layerColor,
      style: featureStyle,
      featureType: type,
      fetching: true,
      editable: true,
    };
    this.latestLayer = newLayer;
    return newLayer;
  },

  changeLayerColor(layerId: string, color: string) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.setStyle((feature) => styleFunction(feature, color));
    }
    const featureStyle = createFeatureStyle(color);
    const source = layer?.getSource();
    if (source) {
      source.getFeatures().forEach((feature) => {
        feature.setProperties(featureStyle);
      });
    }
    return featureStyle;
  },
  changeMarkerIcon(layerId: string, iconInd: number) {
    const source = this.getLayer(layerId)?.getSource();
    if (!source) return;
    source.getFeatures().forEach((feature) => {
      feature.setStyle(markerStyleFunction(iconInd));
      feature.setProperties({ 'marker-id': iconInd });
      // feature.setProperties()
    });
  },

  addDrawFeature(
    type: drawType,
    layerId: string,
    featureStyle: FeatureStyle,
    callback?: (event: DrawEvent) => void
  ) {
    const source = this.getLayer(layerId)?.getSource();
    if (!source) return;
    switch (type) {
      case 'Rectangle':
        this.draw = new Draw({
          type: 'Circle',
          source: source,
          style: drawingStyle,
          geometryFunction: createBox(),
        });
        break;
      case 'Circle':
        this.draw = new Draw({
          type: 'Circle',
          source: source,
          style: drawingStyle,
          geometryFunction: circleGeometryFunction,
        });
        break;
      case 'Polygon':
        this.draw = new Draw({
          type: 'Polygon',
          style: drawingStyle,
          source: source,
        });
        break;
      case 'Line':
        this.draw = new Draw({
          type: 'LineString',
          style: drawingStyle,
          source: source,
        });
        break;
      case 'Measure':
        this.draw = new Draw({
          type: 'LineString',
          style: () => measurementStyle(),
        });
        this.removeLayer(layerId);
        break;
      default:
        this.removeDrawInteraction();
        return;
    }
    this.map.addInteraction(this.draw);
    const snap = new Snap({ source: source });
    this.map.addInteraction(snap);
    this.drawing = true;
    const featureProprties: { [x: string]: string } = {};
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
            featureProprties.length = output;
            tooltipPosition = geom.getLastCoordinate();
          } else if (geom instanceof Polygon) {
            if (type === 'Circle') {
              const center = geom.getInteriorPoint().getCoordinates();
              const edge = geom.getFirstCoordinate();
              const line = new LineString([center, edge]);
              output = formatLength(line);
            } else {
              output = formatArea(geom);
            }
            featureProprties.area = output;
            tooltipPosition = geom.getInteriorPoint().getCoordinates();
          }
          if (output[0] !== '0') {
            tooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipPosition);
          }
        });
    });
    this.draw.on('drawend', (event) => {
      event.feature.setProperties({
        layer: 'Null',
        ...featureStyle,
        ...featureProprties,
      });
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

  addMarkerFeature(
    layerId: string,
    layerName: string,
    featureStyle: FeatureStyle,
    callback?: () => void
  ) {
    const source = this.getLayer(layerId)?.getSource();
    if (!source) return;
    this.draw = new Draw({
      type: 'Point',
    });
    this.map.addInteraction(this.draw);
    this.drawing = true;
    this.draw.on('drawend', (drawEvent) => {
      const marker = drawEvent.feature as Feature<Point>;
      marker.setProperties({
        layer: layerName || 'NULL',
        ...featureStyle,
        lat: marker.getGeometry()?.getCoordinates()[1],
        lng: marker.getGeometry()?.getCoordinates()[0],
      });
      marker.setStyle(markerStyleFunction(0));
      source.addFeature(marker);
      if (callback) {
        callback();
      }
    });
  },

  addGeoJsonFeature(
    geojsonData: GeoJsonObj | undefined,
    layerId: string,
    style: FeatureStyle,
    layerName: string
  ) {
    if (!geojsonData) return;
    geojsonData.crs = {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    };
    const featureLikes = new GeoJson().readFeatures(geojsonData);
    const features = featureLikes.map((featureLike) => {
      return new Feature({
        geometry: featureLike.getGeometry() as Geometry,
        ...featureLike.getProperties(),
        layer: layerName,
      });
    });
    const vectorSource = this.getLayer(layerId)?.getSource();
    if (vectorSource) {
      vectorSource.addFeatures(features);
      vectorSource.getFeatures().forEach((feature) => {
        feature.setProperties(style);
      });
    }
  },
  addImportedGeojsonData(
    geojsonData: GeoJsonObj,
    layerId: string,
    style: FeatureStyle
  ) {
    geojsonData.crs = {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    };
    const source = this.getLayer(layerId)?.getSource();
    if (!source) return;
    const featureLikes = new GeoJson().readFeatures(geojsonData);
    const features = featureLikes.map((feature) => {
      const properties = feature.getProperties();
      const newStyle = {
        fill: properties.fill || style.fill,
        'fill-opacity': properties['fill-opacity'] || style['fill-opacity'],
        stroke: properties.stroke || style.stroke,
        'stroke-opacity':
          properties['stroke-opacity'] || style['stroke-opacity'],
        'stroke-width': properties['stroke-width'] || style['stroke-width'],
        'marker-id': properties['marker-id'] || style['marker-id'],
      };
      const featureGeometry = feature.getGeometry() as Geometry;
      const newFeature = new Feature({
        geometry: featureGeometry,
        ...properties,
        ...newStyle,
      });
      const type = featureGeometry.getType();
      const newStyleobj = featureUniqueStyle(
        type,
        newStyle.stroke,
        newStyle.fill,
        newStyle['stroke-opacity'],
        newStyle['stroke-width'],
        newStyle['fill-opacity'],
        newStyle['marker-id']
      );
      newFeature.setStyle(newStyleobj);
      return newFeature;
    });
    source.addFeatures(features);
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

  swapLayerPosition(layers: string[]) {
    const mapLayers = this.map.getLayers();
    mapLayers.forEach((l) => {
      const base = l.get('baseLayer');
      if (base) return;
      const id = l.get('layer-id');
      const index = layers.indexOf(id);
      l.setZIndex(index);
    });
  },

  zoomToFit(layerId: string) {
    const extent = this.getLayer(layerId)?.getSource()?.getExtent();
    const view = this.map.getView();
    if (extent) {
      view.fit(extent, { padding: [100, 100, 100, 100], duration: 500 });
    }
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
    const zip = new JSZip();
    this.map.getLayers().forEach((layer) => {
      const layerId = layer.get('layer-id');
      if (layerId) {
        if (!layer.getVisible()) return;
        const geojsonData = openLayerMap.createGeojsonFromLayer(
          layerId,
          //@ts-expect-error this case will not happen
          layer
        ) as GeoJsonObj;
        console.log(geojsonData.features[0].properties);

        const layerName =
          geojsonData.features[0].properties.layer || `layer_${layerId}`;
        zip.file(`${layerName}.geojson`, JSON.stringify(geojsonData));
      }
    });
    zip.generateAsync({ type: 'blob' }).then((content) => {
      anchor.href = URL.createObjectURL(content);
      anchor.download = `${exportName}.zip`;
      anchor.click();
    });
  },
  createGeojsonFromLayer(layerId: string, layer?: VectorLayer<VectorSource>) {
    if (!layer) {
      layer = this.getLayer(layerId);
      if (!layer) return;
    }
    const source = layer.getSource() as VectorSource;
    const features = source.getFeatures();
    const geojsonData: GeoJsonObj = new GeoJson().writeFeaturesObject(features);
    geojsonData.features.forEach((feature) => {
      if (!feature.properties) {
        feature.properties = {};
      }
    });
    return geojsonData;
  },
  initialiseMapClickEvent(
    container: HTMLDivElement,
    callback: (feature: Feature) => void
  ) {
    this.popupOverLay.setElement(container);
    this.map.addOverlay(this.popupOverLay);
    this.map.on('click', (evt) => {
      if (this.drawing) return;
      const selectedFeature = this.getFeatureAtPixel(evt.pixel) as Feature;
      if (selectedFeature) {
        this.popupOverLay.setPosition(evt.coordinate);
        callback(selectedFeature);
      } else {
        this.closePopupOverLay();
      }
    });
  },
  closePopupOverLay() {
    this.popupOverLay.setPosition(undefined);
  },
  getFeatureAtPixel(pixel: Pixel) {
    let feature: FeatureLike | undefined;
    this.map.forEachFeatureAtPixel(
      pixel,
      (selected) => {
        if (!feature) {
          feature = selected;
        }
      },
      { hitTolerance: 3 }
    );
    return feature;
  },
  updateFeatureProperties(
    layerId: string,
    key: string,
    value: string | number
  ) {
    const source = this.getLayer(layerId)?.getSource();
    if (source) {
      source.getFeatures().forEach((feature) => {
        feature.setProperties({ [key]: value });
      });
    }
  },
};
// basic map interactions
let selected: Feature | undefined;
let prevStyle: Style | undefined;
openLayerMap.map.on('pointermove', (event) => {
  if (openLayerMap.drawing) {
    return;
  }
  if (selected) {
    selected.setStyle(prevStyle);
    selected = undefined;
  }
  const feature = openLayerMap.map.getFeaturesAtPixel(event.pixel)[0] as
    | Feature
    | undefined;
  if (feature) {
    const { layer, ...style } = feature.getProperties();
    if (!layer) return;
    prevStyle = feature.getStyle() as Style;
    feature.setStyle(hoverStyle(style as FeatureStyle));
    selected = feature;
  }
});

// Utility functions
function circleGeometryFunction(
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
    output = Math.round(length / 10) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
}

function formatArea(polygon: Polygon) {
  const area = getArea(polygon, { projection: 'EPSG:4326' });
  let output;
  if (area > 10000) {
    output = Math.round(area / 10000) / 100 + ' ' + 'km2';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm2';
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
