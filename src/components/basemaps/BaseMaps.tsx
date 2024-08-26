import { IoLayersOutline } from 'react-icons/io5';
import styles from './styles.module.css';
import * as Popover from '@radix-ui/react-popover';
import openLayerMap from '../../lib/openLayers';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { useEffect, useRef, useState } from 'react';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { baseOutlineStyle, basicBaseLayerStyle } from '../../lib/layerStyle';
import { useDispatch } from 'react-redux';
import { updateLoadingState } from '../../context/loading/LoaderSlice';
import VectorLayer from 'ol/layer/Vector';

type baseLayerTypes =
  | 'terrain'
  | 'standard'
  | 'humanitarian'
  | 'openseriesmap'
  | 'ogc_layer_light'
  | 'ogc_layer_dark';

const baseLayers = [
  { type: 'standard', imgSrc: 'assets/osm.png', name: 'OSM' },
  {
    type: 'openseriesmap',
    imgSrc: 'assets/openseries.png',
    name: 'Open series',
  },
  {
    type: 'humanitarian',
    imgSrc: 'assets/humanitarian.png',
    name: 'Humanitarian',
  },
  { type: 'terrain', imgSrc: 'assets/terrain.png', name: 'Terrain' },
  {
    type: 'ogc_layer_light',
    imgSrc: 'assets/ogc_light.png',
    name: 'Basic light',
  },
  { type: 'ogc_layer_dark', imgSrc: 'assets/ogc_dark.png', name: 'Basic dark' },
] as const;
function BaseMaps() {
  const [mapType, setMapType] = useState<baseLayerTypes>('standard');
  const singleRender = useRef(false);
  const dispatch = useDispatch();
  const ogcLayerLight = useRef<VectorImageLayer | undefined>();
  const ogcLayerDark = useRef<VectorLayer<VectorSource> | undefined>();

  const standardLayer = new TileLayer({
    source: new OSM({}),
  });
  const humanitarianLayer = new TileLayer({
    source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    }),
    visible: true,
  });
  const openSeriesMap = new TileLayer({
    source: new OSM({
      url: 'https://geoserver.dx.ugix.org.in/collections/e9120dac-0700-4a41-b07e-277b4f94bad0/map/tiles/WebMercatorQuad/{z}/{x}/{-y}',
      attributions: '',
    }),
  });
  const terrainLayer = new TileLayer({
    source: new OSM({
      url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
    }),
    visible: true,
  });
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
        const ogcOutline = new VectorImageLayer({
          source: vectorSource,
          style: baseOutlineStyle('#a480a2'),
          declutter: false,
        });
        const newOgcLayerDark = new VectorLayer({
          source: vectorSource,
          style: basicBaseLayerStyle('#ffffff', '#333333'),
          declutter: true,
          background: '#111111',
        });
        newOgcLayerLight.set('baseLayer', true);
        newOgcLayerDark.set('baseLayer', true);
        ogcOutline.set('baseLayer', true);
        openLayerMap.indianOutline = ogcOutline;
        ogcLayerLight.current = newOgcLayerLight;
        ogcLayerDark.current = newOgcLayerDark;
        standardLayer.set('baseLayer', true);
        openLayerMap.insertBaseMap('standard', standardLayer);
        setMapType('standard');
        dispatch(updateLoadingState(false));
      })
      .catch((error) => {
        dispatch(updateLoadingState(false));
        toggleBaseMap('standard');
        console.log(error);
      });
  }

  function toggleBaseMap(baseMapType: baseLayerTypes) {
    switch (baseMapType) {
      case 'standard':
        standardLayer.set('baseLayer', true);
        openLayerMap.replaceBasemap(baseMapType, standardLayer);
        setMapType(baseMapType);
        break;
      case 'openseriesmap':
        openSeriesMap.set('baseLayer', true);
        openLayerMap.replaceBasemap(baseMapType, openSeriesMap);
        setMapType(baseMapType);
        break;
      case 'terrain':
        terrainLayer.set('baseLayer', true);
        openLayerMap.replaceBasemap(baseMapType, terrainLayer);
        setMapType(baseMapType);
        break;
      case 'humanitarian':
        humanitarianLayer.set('baseLayer', true);
        openLayerMap.replaceBasemap(baseMapType, humanitarianLayer);
        setMapType(baseMapType);
        break;
      case 'ogc_layer_light':
        if (ogcLayerLight.current) {
          openLayerMap.replaceBasemap(baseMapType, ogcLayerLight.current);
          setMapType(baseMapType);
        }
        break;
      case 'ogc_layer_dark':
        if (ogcLayerDark.current) {
          openLayerMap.replaceBasemap(baseMapType, ogcLayerDark.current);
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
          <Popover.Trigger asChild data-intro="base_layer">
            <button className="header_button">
              <div>
                <IoLayersOutline size={25} />
              </div>
            </button>
          </Popover.Trigger>
        </TooltipWrapper>
        <Popover.Portal>
          <Popover.Content className={styles.popover_content}>
            <div>
              {baseLayers.map((baseLayer) => {
                return (
                  <button
                    key={baseLayer.name}
                    onClick={() => {
                      toggleBaseMap(baseLayer.type);
                    }}
                    className={
                      mapType === `${baseLayer.type}`
                        ? styles.selected
                        : styles.unselected
                    }
                  >
                    <span>
                      <img
                        src={baseLayer.imgSrc}
                        alt={baseLayer.type}
                        height={26}
                        width={26}
                      />
                    </span>
                    {baseLayer.name}
                  </button>
                );
              })}
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
