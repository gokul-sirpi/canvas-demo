import { useEffect, useRef } from 'react';
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers.ts';
import Header from '../../layouts/header/Header';
import LayerCard from '../../layouts/layerCard/LayerCard';
import { UserProfile } from '../../types/UserProfile.ts';

function Canvas({ profileData }: { profileData: UserProfile | undefined }) {
  const singleRender = useRef(false);
  useEffect(() => {
    if (singleRender.current) return;
    openLayerMap.setOlTarget('ol-map');
  }, []);

  return (
    <section className={styles.container}>
      <div id="ol-map" className={styles.ol_map}></div>
      <>
        <Header profileData={profileData} />
        <LayerCard />
      </>
    </section>
  );
}
export default Canvas;
