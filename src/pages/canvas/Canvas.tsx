import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import openLMap from '../../lib/openLayers.ts';
import Header from '../../layouts/header/Header';
import LayerCard from '../../layouts/layerCard/LayerCard';
import { UserLayer } from '../../types/UserLayer.ts';

function Canvas() {
  const singleRender = useRef(false);
  const [userLayer, setUserLayer] = useState<UserLayer[]>([]);
  useEffect(() => {
    if (singleRender.current) return;
    openLMap.map.setTarget('ol-map');
  }, []);

  function addUserLayer(layer: UserLayer) {
    userLayer.push(layer);
    setUserLayer([...userLayer]);
  }

  // function addNewUserlayer(layerName: string) {
  //   const newLayer = openLMap.createNewLayer(layerName);
  //   setUserLayer((prev) => {
  //     prev.push(newLayer);
  //     return [...prev];
  //   });
  // }

  function addNewUserFeature(type: 'Circle' | 'Box' | 'Point') {
    // if (userLayer.length > 0) {
    //   let currentLayer;
    //   for (const layer of userLayer) {
    //     if (layer.selected) {
    //       currentLayer = layer;
    //       break;
    //     }
    //   }
    //   if (currentLayer) {
    //     openLMap.drawFeature(type, currentLayer?.source, () => {});
    //   }
    // } else {
    // }
    const newLayer = openLMap.createNewLayer(`layer${userLayer.length}`);
    if (type === 'Point') {
      openLMap.addMarkerFeature(newLayer.source, () => {
        addUserLayer(newLayer);
      });
      return;
    }
    openLMap.drawFeature(type, newLayer.source, () => {
      addUserLayer(newLayer);
    });
  }

  return (
    <section className={styles.container}>
      <div id="ol-map" className={styles.ol_map}></div>
      <>
        <Header addFeature={addNewUserFeature} />
        <LayerCard userLayer={userLayer} />
      </>
    </section>
  );
}

export default Canvas;
