import { useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { OSM } from 'ol/source.js';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { ScaleLine, Attribution } from 'ol/control.js';
import Header from '../../layouts/header/Header';
import LayerCard from '../../layouts/layerCard/LayerCard';

function Canvas() {
  const singleRender = useRef(false);
  useEffect(() => {
    if (singleRender.current) return;
    singleRender.current = true;
    const standardLayer = new TileLayer({
      source: new OSM({}),
    });
    const scaleControl = new ScaleLine({
      units: 'metric',
      minWidth: 100,
    });
    const attribution = new Attribution({ collapsible: false });
    const map = new Map({
      view: new View({
        center: [78.9629, 22.5397],
        projection: 'EPSG:4326',
        zoom: 5,
      }),
      controls: [scaleControl, attribution],
      layers: [standardLayer],
      target: 'ol-map',
    });
    console.log(map);
  }, []);
  return (
    <section className={styles.container}>
      <div id="ol-map" className={styles.ol_map}></div>
      <Header />
      <LayerCard />
    </section>
  );
}

export default Canvas;
