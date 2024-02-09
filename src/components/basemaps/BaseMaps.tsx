import { IoLayersOutline } from 'react-icons/io5';
import styles from './styles.module.css';
import * as Popover from '@radix-ui/react-popover';
import openLayerMap from '../../lib/openLayers';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { useState } from 'react';
import osmImg from '../../assets/images/osm.png';
import humImg from '../../assets/images/humanitarian.png';

function BaseMaps() {
  const [mapType, setMapType] = useState('standard');

  const standardLayer = new TileLayer({
    source: new OSM({}),
  });

  const humanitarianLayer = new TileLayer({
    source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    }),
    visible: true,
  });
  if (mapType === 'standard') {
    openLayerMap.replaceBasemap(standardLayer);
  }
  if (mapType === 'humanitarian') {
    openLayerMap.replaceBasemap(humanitarianLayer);
  }

  return (
    <>
      <Popover.Root>
        <Popover.Trigger className={styles.popover_trigger}>
          <div className={styles.btn_icon_container}>
            <IoLayersOutline size={25} />
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={styles.popover_content}>
            <div>
              <button
                onClick={() => {
                  setMapType('standard');
                }}
                className={
                  mapType === 'standard' ? styles.selected : styles.unselected
                }
              >
                <span>
                  <img src={osmImg} alt="osmpreview" height={26} width={26} />
                </span>
                OSM
              </button>
              <button
                onClick={() => {
                  setMapType('humanitarian');
                }}
                className={
                  mapType === 'humanitarian'
                    ? styles.selected
                    : styles.unselected
                }
              >
                <span>
                  <span>
                    <img src={humImg} alt="osmpreview" height={26} width={26} />
                  </span>
                </span>
                Humanitarian
              </button>
            </div>
            {/* <button>Bharat Map</button> */}
            <Popover.Arrow className={styles.popover_arrow} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}

export default BaseMaps;
