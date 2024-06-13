import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
import { emitToast } from '../../lib/toastEmitter';
import { useRef, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import IntersectObserver from '../intersectObserver/IntersectObserver';

export default function PropertyTable({
  layer,
}: {
  layer: UserLayer | UgixLayer;
}) {
  const [layerProp, setLayerProp] = useState<
    { [x: string]: string | number }[]
  >([]);
  const rootRef = useRef<HTMLDivElement>(null);
  function getLayerProperties(open: boolean) {
    if (open) {
      const layerData = openLayerMap.canvasLayers.get(layer.layerId);
      if (!layerData) return;
      const layerJsonData = openLayerMap.createGeojsonFromLayer(
        layer.layerId,
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
    <Dialog.Root onOpenChange={getLayerProperties}>
      <Dialog.Trigger asChild>
        <button className={styles.popover_btn}>Properties</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialog_overlay} />
        <Dialog.Content className={styles.dialog_content}>
          <Dialog.Title className={styles.dialog_title}>
            <Dialog.Close asChild>
              <Popover.Close asChild>
                <button className={styles.close_btn}>
                  <div className={styles.btn_icon_container}>
                    <IoMdClose size={20} />
                  </div>
                </button>
              </Popover.Close>
            </Dialog.Close>
          </Dialog.Title>
          <section className={styles.dialog_container}>
            <header>
              <h2 className={styles.layer_name}>{layer.layerName}</h2>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
