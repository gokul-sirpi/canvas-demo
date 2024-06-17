//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
import { emitToast } from '../../lib/toastEmitter';
import { useEffect, useRef, useState } from 'react';
import IntersectObserver from '../intersectObserver/IntersectObserver';
import { useSelector } from 'react-redux';
import { RootState } from '../../context/store';

export default function PropertyTable() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [layerProp, setLayerProp] = useState<
    { [x: string]: string | number }[]
  >([]);
  const canvasLayer = useSelector((state: RootState) => {
    return state.footerState.canvasLayer;
  });
  useEffect(() => {
    if (canvasLayer) {
      getLayerProperties();
    }
  }, [canvasLayer]);
  function getLayerProperties() {
    if (canvasLayer) {
      const layerData = openLayerMap.canvasLayers.get(canvasLayer.layerId);
      if (!layerData) return;
      const layerJsonData = openLayerMap.createGeojsonFromLayer(
        canvasLayer.layerId,
        layerData.layer
      );
      if (layerJsonData) {
        console.log(layerJsonData);
        const layerProperties = layerJsonData.features.map((feature) => {
          const { properties } = feature;
          delete properties.geometry;
          delete properties.fill;
          delete properties.stroke;
          delete properties['fill-opacity'];
          delete properties['stroke-width'];
          delete properties['stroke-opacity'];
          delete properties['marker-id'];
          delete properties.layerGeom;
          delete properties.layerId;
          delete properties.layer;
          return properties;
        });
        setLayerProp(layerProperties);
      } else {
        emitToast('error', 'unable to get layer properties');
      }
    }
  }
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.layer_name} title={canvasLayer?.layerName}>
          {canvasLayer?.layerName}
        </h2>
      </header>
      {layerProp.length > 0 && (
        <div ref={rootRef} className={styles.tb_container}>
          <table className={styles.prop_table}>
            <thead className={styles.tb_thead}>
              <tr className={styles.tb_tr}>
                <th>Sr.No</th>
                {Object.keys(layerProp[0]).map((prop, index) => {
                  return (
                    <th key={index} className={styles.tb_th}>
                      {prop}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={styles.tb_tbody}>
              {layerProp.map((feature, index) => {
                return (
                  <IntersectObserver
                    key={index}
                    root={rootRef.current}
                    length={Object.keys(feature).length}
                  >
                    {/* <tr key={index} className={styles.tb_tr}> */}
                    <td className={styles.tb_td}>{index + 1}</td>
                    {Object.keys(feature).map((prop, index) => {
                      return (
                        <td
                          data-overflow={`${feature[prop]}`.length > 80}
                          title={`${feature[prop]}`}
                          key={index}
                          className={styles.tb_td}
                        >
                          {feature[prop]}
                        </td>
                      );
                    })}
                    {/* </tr> */}
                  </IntersectObserver>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
