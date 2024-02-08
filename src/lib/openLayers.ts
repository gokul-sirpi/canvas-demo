import { Feature, Map, View } from 'ol';
import { Attribution, ScaleLine } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import Draw, { createBox } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { UserLayer } from '../types/UserLayer';
import { Style, Icon } from 'ol/style';
import { Point } from 'ol/geom';
import GeoJson from 'ol/format/GeoJSON';
import marker from '../assets/icons/generic_marker.png';
import { GeoJsonObj, JsonFeature } from '../types/GeojsonType';
import styleFunction from './layerStyle';
import { GsixLayer } from '../types/gsixLayers';

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

const openLayerMap = {
  draw: new Draw({ type: 'Circle' }),
  drawing: false,
  map: new Map({
    view: new View({
      center: [78.9629, 22.5397],
      projection: 'EPSG:4326',
      zoom: 5,
      minZoom: 5,
    }),
    controls: [scaleControl, attribution],
    layers: [standardLayer],
    // target: 'ol-map',
  }),

  replaceBasemap(newLayers: TileLayer<OSM>) {
    this.map.getLayers().forEach(layer => {
      if (layer instanceof TileLayer) {
        this.map.removeLayer(layer);
      }
    });
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

  createNewLayer(layerName: string): UserLayer & { source: VectorSource } {
    const source = new VectorSource({});
    const featureColor = getRandomColor();
    const layer = new VectorLayer({
      source: source,
      style: (feature) => styleFunction(feature, featureColor),
    });
    const layerId = createUniqueId();
    layer.set('layer-id', layerId);
    const newLayer = {
      layerName: layerName,
      layerId,
      source,
      selected: true,
      visible: true,
      isCompleted: false,
      layerColor: featureColor,
    };
    this.map.addLayer(layer);
    return newLayer;
  },

  changeLayerColor(layerId: string, color: string) {
    const layer = this.getLayer(layerId);
    if (layer) {
      layer.setStyle((feature) => styleFunction(feature, color));
    }
  },

  addDrawFeature(
    type: 'Circle' | 'Box',
    source: VectorSource,
    callback?: () => void
  ) {
    this.removeDrawInteraction();
    let geometryFunction;
    if (type === 'Box') {
      geometryFunction = createBox();
    }
    this.draw = new Draw({
      type: 'Circle',
      source: source,
      geometryFunction,
    });
    this.map.addInteraction(this.draw);
    this.drawing = true;
    this.draw.on('drawend', () => {
      if (callback) {
        callback();
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
    layerName: string,
    gsixId: string
  ) {
    geojsonData.crs = {
      type: 'name',
      properties: {
        name: 'EPSG:4326',
      },
    };
    for (const feature of geojsonData.features) {
      feature.type = 'Feature';
    }
    const vectorSource = new VectorSource({
      features: new GeoJson().readFeatures(geojsonData),
    });
    // const layerColor = getRandomColor();
    const layerColor = '#8d0505';
    const layerId = createUniqueId();
    const vectorLayer = new VectorLayer({
      //@ts-expect-error vector source expects Feature<Geometry>
      //but Geojson().readFeature() returns FeatureLike, known issue in openlayers
      source: vectorSource,
      style: (feature) => styleFunction(feature, layerColor),
    });
    vectorLayer.set('layer-id', layerId);
    this.addLayer(vectorLayer);
    const newLayer: GsixLayer = {
      layerName: layerName,
      layerId,
      gsixLayerId: gsixId,
      selected: true,
      visible: true,
      isCompleted: true,
      layerColor,
    };
    return newLayer;
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

  zoomToFit(feature: JsonFeature) {
    let meanLat = 0;
    let meanLng = 0;
    for (let i = 0; i < 4; i++) {
      const coord = feature.geometry.coordinates[0][i];
      meanLat += coord[0];
      meanLng += coord[1];
    }
    const position = [meanLat / 4, meanLng / 4];
    // const origin = feature.geometry.coordinates[0][0];
    const view = this.map.getView();
    view.setCenter(position);
    view.setZoom(8);
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
};
// basic map interactions

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
    num += Math.floor(Math.random() * 16).toString(16);
  }
  return '#' + num;
}

export default openLayerMap;
