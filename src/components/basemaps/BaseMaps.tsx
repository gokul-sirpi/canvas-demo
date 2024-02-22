import { IoLayersOutline } from 'react-icons/io5';
import styles from './styles.module.css';
import * as Popover from '@radix-ui/react-popover';
import openLayerMap from '../../lib/openLayers';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { useEffect, useRef, useState } from 'react';
import osmImg from '../../assets/images/osm.png';
import humImg from '../../assets/images/humanitarian.png';
import ogcImg from '../../assets/images/india-OGC.png';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { ogcLayerStyle } from '../../lib/layerStyle';

function BaseMaps() {
  const [mapType, setMapType] = useState('standard');
  const ogcLayer = useRef<VectorImageLayer<VectorSource> | undefined>();
  useEffect(() => {
    getDistrictBoundaries();
  }, []);
  function getDistrictBoundaries() {
    fetch('https://iudx.s3.ap-south-1.amazonaws.com/state-boundaries.geojson')
      .then((res) => res.json())
      .then((response) => {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(response),
          format: new GeoJSON(),
        }) as VectorSource;
        const newOgcLayer = new VectorImageLayer({
          source: vectorSource,
          style: ogcLayerStyle('#99aabb'),
          declutter: true,
        });
        ogcLayer.current = newOgcLayer;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const standardLayer = new TileLayer({
    source: new OSM({}),
  });

  const humanitarianLayer = new TileLayer({
    source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    }),
    visible: true,
  });
  function toggleBaseMap(baseMapType: string) {
    switch (baseMapType) {
      case 'standard':
        openLayerMap.replaceBasemap(standardLayer);
        setMapType(baseMapType);
        break;
      case 'humanitarian':
        openLayerMap.replaceBasemap(humanitarianLayer);
        setMapType(baseMapType);
        break;
      case 'ogc-layer':
        if (ogcLayer.current) {
          openLayerMap.replaceBasemap(ogcLayer.current);
          setMapType(baseMapType);
        }
        break;
      default:
        break;
    }
  }

  return (
    <>
      <Popover.Root>
        <TooltipWrapper content="Base Maps">
          <Popover.Trigger className={styles.popover_trigger}>
            <div className={styles.btn_icon_container}>
              <IoLayersOutline size={25} />
            </div>
          </Popover.Trigger>
        </TooltipWrapper>
        <Popover.Portal>
          <Popover.Content className={styles.popover_content}>
            <div>
              <button
                onClick={() => {
                  toggleBaseMap('standard');
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
                  toggleBaseMap('humanitarian');
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
              <button
                onClick={() => toggleBaseMap('ogc-layer')}
                className={
                  mapType === 'ogc-layer' ? styles.selected : styles.unselected
                }
              >
                <span>
                  <span>
                    <img src={ogcImg} alt="osmpreview" height={26} width={26} />
                  </span>
                </span>
                Basic Map
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
