import { Feature, Map as OlMap, Overlay, View } from 'ol';
import { Pixel } from 'ol/pixel';
import { CanvasLayer, DrawType } from '../types/UserLayer';
import {
  Attribution,
  ScaleLine,
  defaults as defaultControls,
} from 'ol/control';
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
  markerIcons,
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
import { getRenderPixel } from 'ol/render';
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
const newControls = defaultControls().extend([scaleControl, attribution]);
const LAYER_ID_KEY = 'layer-id';
const BASE_LAYER_KEY = 'baseLayer';
let ugixResources: string[] = [];

// Map properties and methods
const openLayerMap = {
  draw: new Draw({ type: 'Circle' }),
  drawing: false,
  swipePercentage: 1,
  canvasLayers: new Map<string, CanvasLayer>(),
  latestLayer: null as UserLayer | UgixLayer | null,
  indianOutline: null as VectorImageLayer<VectorSource> | null,
  measureTooltip: null as Overlay | null,
  tooltipElement: null as HTMLDivElement | null,
  popupOverLay: new Overlay({}),
  map: new OlMap({
    view: new View({
      center: [78.9629, 22.5397],
      projection: 'EPSG:4326',
      zoom: 4.5,
      // minZoom: 4,
    }),
    controls: newControls,
    layers: [],
  }),
  replaceBasemap(
    baseMapType: baseLayerTypes,
    newLayer:
      | VectorLayer<VectorSource>
      | TileLayer<OSM>
      | VectorImageLayer<VectorSource>
  ) {
    this.map.getAllLayers().forEach((layer) => {
      if (layer.get(BASE_LAYER_KEY)) {
        this.map.removeLayer(layer);
      }
    });
    const layers = this.map.getLayers();
    layers.insertAt(0, newLayer);
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
    ugixResources = [];
    [...this.canvasLayers.values()].map((layer) => {
      if (layer.layerType === 'UgixLayer') {
        ugixResources.push(layer.layerId);
      }
    });
    const layer = this.getLayer(layerId);
    if (layer) {
      this.map.removeLayer(layer);
      this.canvasLayers.delete(layerId);

      if (ugixResources.length == 1) {
        openLayerMap.zoomToCombinedExtend([]);
      }
      if (ugixResources.indexOf(layerId) != -1) {
        ugixResources.splice(ugixResources.indexOf(layerId), 1);
        openLayerMap.zoomToCombinedExtend(ugixResources);
      }
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

  createNewUserLayer(layerName: string, featureType: DrawType): UserLayer {
    const source = new VectorSource({});
    const featureColor = getRandomColor();
    const layer = new VectorLayer({
      source: source,
      style: (feature) => styleFunction(feature, featureColor),
    });
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
      style: createFeatureStyle(featureColor),
      editable: true,
      side: 'middle',
    };
    this.canvasLayers.set(layerId, {
      layer,
      layerId,
      layerName,
      layerType: 'UserLayer',
      style: createFeatureStyle(featureColor),
      side: 'middle',
    });
    this.addSwipeFuncToLayer(layer);
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
    const layerId = createUniqueId();
    const vectorSource = new VectorSource({});
    const newVectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => styleFunction(feature, layerColor),
    });
    newVectorLayer.set('layer-id', layerId);
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
      style: createFeatureStyle(layerColor),
      featureType: type,
      fetching: true,
      editable: true,
      side: 'middle',
    };
    this.canvasLayers.set(layerId, {
      layer: newVectorLayer,
      layerId,
      layerName,
      layerType: 'UgixLayer',
      style: createFeatureStyle(layerColor),
      side: 'middle',
    });
    this.addLayer(newVectorLayer);
    this.addSwipeFuncToLayer(newVectorLayer);
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
    type: DrawType,
    newLayer: UserLayer,
    callback?: (event: DrawEvent) => void
  ) {
    const { layerId, style } = newLayer;
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
              featureProprties.radius = output;
              featureProprties.area = formatArea(geom);
            } else {
              output = formatArea(geom);
              featureProprties.area = output;
            }
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
        layerId,
        ...style,
        ...featureProprties,
        layerGeom: type,
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

  addMarkerFeature(newLayer: UserLayer, callback?: () => void) {
    const { layerId, layerName, style } = newLayer;
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
        layerId,
        layerGeom: 'Point',
        ...style,
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
        layerId,
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
        'marker-id': Number(properties['marker-id']) || style['marker-id'],
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

  zoomToCombinedExtend(resourcesFromCatalogue: string[]) {
    let extent: number[] = [180, 180, -180, -180];
    if (resourcesFromCatalogue.length == 0) {
      extent = [67, 4, 98, 39];
    }
    resourcesFromCatalogue.map((layerId: string) => {
      const layerExtent = this.getLayer(layerId)?.getSource()?.getExtent();
      if (layerExtent != undefined || resourcesFromCatalogue.length > 0) {
        extent[0] = Math.min(layerExtent![0], extent![0]);
        extent[1] = Math.min(layerExtent![1], extent![1]);
        extent[2] = Math.max(layerExtent![2], extent![2]);
        extent[3] = Math.max(layerExtent![3], extent![3]);
      } else {
        extent = [67, 4, 98, 39];
      }
    });
    const view = this.map.getView();
    if (extent) {
      view.fit(extent, { padding: [100, 100, 100, 100], duration: 500 });
    }
  },

  async exportAsImage(anchor: HTMLAnchorElement, imageName: string) {
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
    const legendCanvas = await this.createLegend(
      allCanvas[0].width,
      allCanvas[0].height
    );
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
      if (legendCanvas) {
        mapContext.drawImage(legendCanvas, 0, 0);
      }
      anchor.href = mapCanvas.toDataURL();
      anchor.download = `${imageName}.jpeg`;
      anchor.click();
    });
    this.map.renderSync();
    return null;
  },
  async createLegend(width: number, height: number) {
    const padding = 10;
    const imageSize = 12;
    const rowGap = 4;
    const colGap = 5;
    let minWidth = 100;
    const canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.beginPath();
    context.fillStyle = 'white';
    context.roundRect(
      padding,
      padding,
      minWidth,
      imageSize + colGap + 10,
      [10, 0, 0, 0]
    );
    context.fill();
    context.closePath();
    context.beginPath();
    context.fillStyle = 'black';
    context.textBaseline = 'hanging';
    context.font = `${imageSize}px roboto`;
    context.fillText('Legend', padding + 10, padding + 10);
    context.closePath();
    context.fill();
    let count = 1;
    const promises: Promise<boolean>[] = [];
    this.map.getLayers().forEach((layer) => {
      if (!layer.getVisible()) return;
      const layerId = layer.get(LAYER_ID_KEY);
      if (layerId) {
        const source = this.getLayer(layerId)?.getSource();
        if (source) {
          const feature = source.getFeatures()[0];
          const properties = feature.getProperties();
          console.log(properties);
          const layerGeometry = properties.layerGeom as DrawType | undefined;
          //
          const top = padding + count * (imageSize + colGap) + 10;
          const left = padding + 10;
          //
          const rowWidth = drawbackgroundBox(
            context,
            properties.layer,
            top,
            padding,
            imageSize,
            rowGap,
            colGap,
            minWidth
          );
          if (rowWidth > minWidth) {
            context.beginPath();
            context.fillRect(minWidth, 10, rowWidth - minWidth + 10, top);
            context.fill();
            context.closePath();
            minWidth = rowWidth;
          }
          const image = new Image();
          switch (layerGeometry) {
            case 'Circle':
              image.src = '/icons/circle.svg';
              break;
            case 'Polygon':
              image.src = '/icons/polygon.svg';
              break;
            case 'Rectangle':
              image.src = '/icons/square.svg';
              break;
            case 'Line':
              image.src = '/icons/line.svg';
              break;
            case 'Point':
              image.src = `icons/marker/${markerIcons[properties['marker-id']]}`;
              break;
            default:
              image.src = '/icons/shapes.svg';
              break;
          }
          const imageLoad = new Promise<boolean>((resolve) => {
            image.onload = () => {
              context.drawImage(image, left, top, imageSize, imageSize);
              resolve(true);
            };
          });
          if (layerGeometry !== 'Point') {
            context.beginPath();
            context.fillStyle = properties.fill;
            context.fillRect(
              left + imageSize + rowGap,
              top,
              imageSize,
              imageSize
            );
            context.closePath();
          } else {
            context.beginPath();
            context.fillStyle = 'black';
            context.fillRect(
              left + imageSize + rowGap + imageSize / 4,
              top + imageSize / 2 - 1,
              imageSize / 2,
              2
            );
            context.closePath();
          }
          promises.push(imageLoad);
          context.fillStyle = 'black';
          context.textBaseline = 'hanging';
          context.fillText(
            properties.layer,
            left + (imageSize + rowGap) * 2,
            top + 1
          );
          context.fill();
          count++;
        }
      }
    });
    if (count === 1) {
      return undefined;
    }
    const top = count * (imageSize + colGap) + padding + 10;
    context.beginPath();
    context.fillStyle = 'white';
    context.roundRect(10, top, minWidth, 10, [0, 0, 0, 10]);
    context.roundRect(minWidth + 10, 10, 10, top, [0, 10, 10, 0]);
    context.fill();
    context.closePath();
    await Promise.all(promises);
    return canvas;
  },
  exportAsGeoJson(anchor: HTMLAnchorElement, exportName: string) {
    const zip = new JSZip();
    this.map.getLayers().forEach((layer) => {
      const layerId = layer.get(LAYER_ID_KEY);
      if (layerId) {
        if (!layer.getVisible()) return;
        const geojsonData = openLayerMap.createGeojsonFromLayer(
          layerId,
          //@ts-expect-error this case will not happen
          layer
        ) as GeoJsonObj;
        const layerName =
          geojsonData.features[0].properties.layer || `layer_${layerId}`;
        zip.file(`${layerName}.geojson`, JSON.stringify(geojsonData));
        this.canvasLayers.get(layerId)?.layerName || `layer_${layerId}`;
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
        if (feature) return;
        const side = this.getMouseSideStatus(pixel);
        if (side !== null) {
          const layerID: string = selected.get('layerId');
          const layer = this.canvasLayers.get(layerID);
          if (layer) {
            if (side === layer.side) {
              feature = selected;
            }
          }
        } else {
          feature = selected;
        }
      },
      { hitTolerance: 3 }
    );
    return feature;
  },
  getMouseSideStatus(pixel: Pixel) {
    let side = null;
    if (this.swipePercentage < 1) {
      const mapSize = this.map.getSize();
      if (mapSize) {
        const clickedPercentage = pixel[0] / mapSize[0];
        if (clickedPercentage < this.swipePercentage) {
          side = 'left';
        } else {
          side = 'right';
        }
      }
    }
    return side;
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
  addSwipeFuncToLayer(layer: VectorLayer<VectorSource>) {
    layer.on('prerender', (event) => {
      const ctx = event.context as CanvasRenderingContext2D;
      const mapSize = this.map.getSize();
      if (!mapSize || !ctx) return;
      const layerId = layer.get(LAYER_ID_KEY);
      const side = this.canvasLayers.get(layerId)?.side;
      if (side === 'middle') return;
      let tl, tr, bl, br;
      const width = mapSize[0] * this.swipePercentage;
      if (side === 'left') {
        tl = getRenderPixel(event, [0, 0]);
        tr = getRenderPixel(event, [width, 0]);
        bl = getRenderPixel(event, [0, mapSize[1]]);
        br = getRenderPixel(event, [width, mapSize[1]]);
      } else {
        tl = getRenderPixel(event, [width, 0]);
        tr = getRenderPixel(event, [mapSize[0], 0]);
        bl = getRenderPixel(event, [width, mapSize[1]]);
        br = getRenderPixel(event, mapSize);
      }
      // else {
      //   tl = getRenderPixel(event, [0, 0]);
      //   tr = getRenderPixel(event, [mapSize[0], 0]);
      //   bl = getRenderPixel(event, [0, mapSize[1]]);
      //   br = getRenderPixel(event, mapSize);
      // }
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tl[0], tl[1]);
      ctx.lineTo(bl[0], bl[1]);
      ctx.lineTo(br[0], br[1]);
      ctx.lineTo(tr[0], tr[1]);
      ctx.closePath();
      ctx.clip();
    });
    layer.on('postrender', (event) => {
      const ctx = event.context as CanvasRenderingContext2D;
      ctx.restore();
    });
  },
  addSwipeLayer(leftIds: string[], rightIds: string[], middleIds: string[]) {
    for (const id of rightIds) {
      const layer = this.canvasLayers.get(id);
      if (layer) {
        layer.side = 'right';
      }
    }
    for (const id of leftIds) {
      const layer = this.canvasLayers.get(id);
      if (layer) {
        layer.side = 'left';
      }
    }
    for (const id of middleIds) {
      const layer = this.canvasLayers.get(id);
      if (layer) {
        layer.side = 'middle';
      }
    }
    this.map.render();
  },
  updateSwipeLayer(percentage: number) {
    this.swipePercentage = percentage;
    this.map.render();
  },
  removeSwipeLayer(rightIds: string[]) {
    for (const id of rightIds) {
      const layer = this.canvasLayers.get(id);
      if (layer) {
        layer.side = 'left';
      }
    }
    this.swipePercentage = 1;
    this.map.render();
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
  const feature = openLayerMap.getFeatureAtPixel(event.pixel) as
    | Feature
    | undefined;
  if (feature) {
    const { layer, ...style } = feature.getProperties();
    if (!layer) return;
    prevStyle = feature.getStyle() as Style;
    // console.log(style);
    feature.setStyle(hoverStyle(style as FeatureStyle));
    selected = feature;
  }
});
// openLayerMap.map.on('pointerdrag', (event) => {
//   console.log(event);
// });

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
    output = Math.round(area / 10000) / 100 + ' ' + 'sq. km';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'sq. m';
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

// draw a white box in canvas

function drawbackgroundBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  top: number,
  left: number,
  h: number,
  rowGap: number,
  colGap: number,
  minWidth: number
) {
  const { width } = ctx.measureText(text);
  console.log(width);
  let rowWidth = width + (h + rowGap) * 2 + 10;
  rowWidth = Math.max(minWidth, rowWidth);
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.fillRect(left, top, rowWidth, h + colGap);
  ctx.fill();
  ctx.closePath();
  return rowWidth;
}

export default openLayerMap;
