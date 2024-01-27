import { useEffect, useRef } from 'react';
import styles from './styles.module.css';
import openLMap from '../../lib/openLayers.ts';
import Header from '../../layouts/header/Header';
import LayerCard from '../../layouts/layerCard/LayerCard';

function Canvas() {
  const singleRender = useRef(false);
  useEffect(() => {
    if (singleRender.current) return;
    openLMap.map.setTarget('ol-map');
  }, []);

  return (
    <section className={styles.container}>
      <div id="ol-map" className={styles.ol_map}></div>
      <>
        <Header />
        <LayerCard />
      </>
    </section>
  );
}
export default Canvas;
