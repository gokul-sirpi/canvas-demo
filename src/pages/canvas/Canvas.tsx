import { useEffect, useRef } from 'react';
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers.ts';
import Header from '../../layouts/header/Header';
import LayerCard from '../../layouts/layerCard/LayerCard';
import keycloak from '../../lib/keycloak.ts';
import { useNavigate } from 'react-router-dom';

function Canvas() {
  const singleRender = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (singleRender.current) return;
    openLayerMap.setOlTarget('ol-map');
    checkLoginStatus();
  }, []);

  function checkLoginStatus() {
    if (!keycloak.authenticated) {
      navigate('/');
    }
  }
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
