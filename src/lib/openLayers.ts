import { Map, View } from 'ol';
import { Attribution, ScaleLine } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import Draw from 'ol/interaction/Draw';
import { Type } from 'ol/geom/Geometry';

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
  drawBbox(type: Type) {
    if (this.drawing) {
      this.map.removeInteraction(this.draw);
      this.drawing = false;
      return;
    }
    this.draw = new Draw({ type: type });
    this.map.addInteraction(this.draw);
    this.drawing = true;
    this.draw.on('drawend', () => {
      this.map.removeInteraction(this.draw);
      this.drawing = false;
    });
  },

  addLayer() {},
};

export default ol_map;
