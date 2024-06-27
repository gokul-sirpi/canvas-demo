//
import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { Feature } from 'ol';

function Popup() {
  const singleRender = useRef<boolean>(false);
  const popupContainer = useRef<HTMLDivElement>(null);
  const currentFeature = useRef<Feature>();
  const [properties, setProperties] = useState<{
    [x: string]: string | number | null;
  }>();
  useEffect(() => {
    if (!popupContainer.current) return;
    if (singleRender.current) return;
    singleRender.current = true;
    openLayerMap.initialiseMapClickEvent(popupContainer.current, (feature) => {
      currentFeature.current = feature;
      const properties = feature.getProperties();
      delete properties.geometry;
      delete properties.fill;
      delete properties.stroke;
      delete properties['fill-opacity'];
      delete properties['stroke-width'];
      delete properties['stroke-opacity'];
      delete properties['marker-id'];
      delete properties.layerGeom;
      delete properties.layerId;
      setProperties(properties);
      if (Object.keys(properties).length === 0) {
        openLayerMap.closePopupOverLay();
      }
    });
  }, []);
  function handlePopupClosing() {
    openLayerMap.closePopupOverLay();
  }
  return (
    <div id="popup" ref={popupContainer} className={styles.ol_popup}>
      <button
        onClick={handlePopupClosing}
        className={styles.ol_popup_closer}
      ></button>
      <div id="popup-content">
        <table className={styles.popup_table}>
          <tbody>
            {properties &&
              Object.keys(properties).map((property) => {
                return (
                  <tr key={property}>
                    <td title={property} className={styles.table_cell}>
                      {property}
                    </td>
                    <td
                      title={`${properties[property]}`}
                      className={styles.table_cell}
                    >
                      : {properties[property]}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Popup;
