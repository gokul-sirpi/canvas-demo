import { Map, View } from 'ol';
import { Attribution, ScaleLine } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import Draw from 'ol/interaction/Draw';
import { Type } from 'ol/geom/Geometry';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { UserLayer } from '../types/UserLayer';
const standardLayer = new TileLayer({
  source: new OSM({}),
});
const scaleControl = new ScaleLine({
  units: 'metric',
  minWidth: 100,
});
const attribution = new Attribution({ collapsible: false });
const ol_map = {
  drawing: false,
  map: new Map({
    view: new View({
      center: [78.9629, 22.5397],
      projection: 'EPSG:4326',
      zoom: 5,
    }),
    controls: [scaleControl, attribution],
    layers: [standardLayer],
  }),

  draw: new Draw({ type: 'Circle' }),
  drawFeature(type: Type, source: VectorSource, callback?: () => void) {
    if (this.drawing) {
      this.map.removeInteraction(this.draw);
      this.drawing = false;
      return;
    }
    this.draw = new Draw({ type: type, source: source });
    this.map.addInteraction(this.draw);
    this.drawing = true;
    this.draw.on('drawend', () => {
      this.map.removeInteraction(this.draw);
      this.drawing = false;
      if (callback) {
        callback();
      }
    });
  },
  createNewLayer(layerName: string): UserLayer {
    const source = new VectorSource({ wrapX: false });
    const layer = new VectorLayer({ source: source });
    const newLayer = {
      layerName: layerName,
      layerId: createUniqueId(),
      layer: layer,
      source: source,
      selected: true,
      visible: true,
    };
    this.map.addLayer(layer);
    return newLayer;
  },
  addLayer() {},
};

let id = 0;
function createUniqueId() {
  const time = Date.now().toString();
  const random = Math.random().toString(16).slice(2, 10);
  return time + random + id++;
}

export default ol_map;
