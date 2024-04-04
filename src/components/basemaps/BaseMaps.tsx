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
import ogcDark from '../../assets/images/india_ogc_dark.png';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { basicBaseLayerStyle } from '../../lib/layerStyle';
import { useDispatch } from 'react-redux';
import { updateLoadingState } from '../../context/loading/LoaderSlice';
import VectorLayer from 'ol/layer/Vector';

type baseLayerTypes =
  | 'terrain'
  | 'standard'
  | 'humanitarian'
  | 'ogc_layer_light'
  | 'ogc_layer_dark';
function BaseMaps() {
  const [mapType, setMapType] = useState<baseLayerTypes>('standard');
  const singleRender = useRef(false);
  const dispatch = useDispatch();
  const ogcLayerLight = useRef<VectorImageLayer<VectorSource> | undefined>();
  const ogcLayerDark = useRef<VectorLayer<VectorSource> | undefined>();
  useEffect(() => {
    if (singleRender.current) return;
    singleRender.current = true;
    getDistrictBoundaries();
  }, []);
  function getDistrictBoundaries() {
    dispatch(updateLoadingState(true));
    fetch('https://iudx.s3.ap-south-1.amazonaws.com/state-boundaries.geojson')
      .then((res) => res.json())
      .then((response) => {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(response),
          format: new GeoJSON(),
        }) as VectorSource;
        const newOgcLayerLight = new VectorImageLayer({
          source: vectorSource,
          style: basicBaseLayerStyle('#778899', '#77889922'),
          declutter: true,
        });
        const newOgcLayerDark = new VectorLayer({
          source: vectorSource,
          style: basicBaseLayerStyle('#ffffff', '#333333'),
          declutter: true,
          background: '#111111',
        });
        newOgcLayerLight.set('baseLayer', true);
        newOgcLayerDark.set('baseLayer', true);
        ogcLayerLight.current = newOgcLayerLight;
        ogcLayerDark.current = newOgcLayerDark;
        openLayerMap.insertBaseMap(newOgcLayerLight);
        setMapType('ogc_layer_light');
        dispatch(updateLoadingState(false));
      })
      .catch((error) => {
        dispatch(updateLoadingState(false));
        toggleBaseMap('standard');
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
  const terrainLayer = new TileLayer({
    source: new OSM({
      url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
    }),
    visible: true,
  });
  function toggleBaseMap(baseMapType: baseLayerTypes) {
    switch (baseMapType) {
      case 'standard':
        standardLayer.set('baseLayer', true);
        openLayerMap.replaceBasemap(standardLayer);
        setMapType(baseMapType);
        break;
      case 'terrain':
        terrainLayer.set('baseLayer', true);
        openLayerMap.replaceBasemap(terrainLayer);
        setMapType(baseMapType);
        break;
      case 'humanitarian':
        humanitarianLayer.set('baseLayer', true);
        openLayerMap.replaceBasemap(humanitarianLayer);
        setMapType(baseMapType);
        break;
      case 'ogc_layer_light':
        if (ogcLayerLight.current) {
          openLayerMap.replaceBasemap(ogcLayerLight.current);
          setMapType(baseMapType);
        }
        break;
      case 'ogc_layer_dark':
        if (ogcLayerDark.current) {
          openLayerMap.replaceBasemap(ogcLayerDark.current);
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
        <TooltipWrapper content="Toggle base layer">
          <Popover.Trigger
            data-intro="base_layer"
            className={styles.popover_trigger}
          >
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
                  toggleBaseMap('terrain');
                }}
                className={
                  mapType === 'terrain' ? styles.selected : styles.unselected
                }
              >
                <span>
                  <img src={osmImg} alt="osmpreview" height={26} width={26} />
                </span>
                Terrain
              </button>
              <button
                onClick={() => toggleBaseMap('ogc_layer_light')}
                className={
                  mapType === 'ogc_layer_light'
                    ? styles.selected
                    : styles.unselected
                }
              >
                <span>
                  <span>
                    <img src={ogcImg} alt="osmpreview" height={26} width={26} />
                  </span>
                </span>
                Basic Light
              </button>
              <button
                onClick={() => toggleBaseMap('ogc_layer_dark')}
                className={
                  mapType === 'ogc_layer_dark'
                    ? styles.selected
                    : styles.unselected
                }
              >
                <span>
                  <span>
                    <img
                      src={ogcDark}
                      alt="osmpreview"
                      height={26}
                      width={26}
                    />
                  </span>
                </span>
                Basic Dark
              </button>
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
