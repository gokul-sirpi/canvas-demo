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
import { GeoJsonObj } from '../types/GeojsonType';
import styleFunction from './layerStyle';

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
    }),
    controls: [scaleControl, attribution],
    layers: [standardLayer],
    // target: 'ol-map',
  }),
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
    };
    this.map.addLayer(layer);
    return newLayer;
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

  addGeoJsonFeature(geojsonData: GeoJsonObj, layerName: string) {
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
    const layerColor = getRandomColor();
    const layerId = createUniqueId();
    const vectorLayer = new VectorLayer({
      //@ts-expect-error vector source expects Feature<Geometry>
      //but Geojson().readFeature() returns FeatureLike
      //so ignore
      source: vectorSource,
      style: (feature) => styleFunction(feature, layerColor),
    });
    vectorLayer.set('layer-id', layerId);
    this.addLayer(vectorLayer);
    const newLayer = {
      layerName: layerName,
      layerId,
      selected: true,
      visible: true,
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
};
// basic map interactions
// ol_map.map.on('pointermove', (e) => {
//   const feature = ol_map.map.forEachFeatureAtPixel(e.pixel, (feature) => {
//     console.log(feature);
//     return feature;
//   });
// });

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
