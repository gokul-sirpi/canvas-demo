import { FaLock, FaUnlock } from 'react-icons/fa';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import styles from './styles.module.css';
import { RiInformationFill } from 'react-icons/ri';
import { QueryParams, Resource } from '../../types/resource';
import openLayerMap from '../../lib/openLayers';
import { memo, SetStateAction, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addCanvasLayer,
  updateLayerFetchingStatus,
} from '../../context/canvasLayers/canvasLayerSlice';
import envurls from '../../utils/config';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import { updateLoadingState } from '../../context/loading/LoaderSlice';
import { emitToast } from '../../lib/toastEmitter';
import { MdDownloadForOffline } from 'react-icons/md';
import {
  getAccessToken,
  getAllUgixFeatures,
} from '../../lib/getAllUgixFeatures';
import { Extent } from 'ol/extent';
import axios from 'axios';
import { RootState } from '../../context/store';
import { getProviderIcon } from '../../assets/providerIcons';
import getResourceServerRegURL from '../../utils/ResourceServerRegURL';

function UgixFeatureTile({
  resource,
  dialogCloseTrigger,
}: {
  resource: Resource;
  dialogCloseTrigger: React.Dispatch<SetStateAction<boolean>>;
}) {
  // const limit = 5;
  const dispatch = useDispatch();
  const [noAccess, setNoAccess] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isExtraBtnVisible, setIsExtraBtnVisible] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const ugixResources: string[] = [];
  const canvasLayers = useSelector((state: RootState) => {
    return state.canvasLayer.layers;
  });
  canvasLayers.map((layer) => {
    if (layer.layerType === 'UgixLayer') {
      ugixResources.push(layer.layerId);
    }
  });
  function getinfoLink() {
    const groupId = resource.resourceGroup;
    const path = envurls.ugixCatalogue + 'dataset/' + groupId;
    return path;
  }
  function handleInfoOpen() {
    const path = getinfoLink();
    window.open(path, '_blank');
  }

  async function handleUgixLayerAddition(bbox?: Extent) {
    let serverUrl = await getResourceServerRegURL(resource);

    console.log(serverUrl);

    // store the resource data in session storage
    sessionStorage.setItem(
      `${resource.id}-ugix-resource`,
      JSON.stringify(resource)
    );
    console.log(resource);
    if (resource?.ogcResourceInfo?.ogcResourceAPIs?.includes('VECTOR_TILES')) {
      plotTiles();
    } else {
      setAdding(true);
      dispatch(updateLoadingState(true));
      const newLayer = openLayerMap.createNewUgixLayer(
        serverUrl,
        resource.label,
        resource.id,
        resource.resourceGroup,
        resource.ogcResourceInfo.geometryType
      );
      const queryParams: QueryParams = {};
      if (bbox) {
        queryParams.bbox = bbox.join();
      }
      getAllUgixFeatures(
        serverUrl,
        resource,
        newLayer,
        queryParams,

        () => {
          dispatch(addCanvasLayer(newLayer));
          ugixResources.push(newLayer.layerId);
          cleanUpSideEffects();
          dialogCloseTrigger(false);
          if (bbox) {
            openLayerMap.zoomToFit(newLayer.layerId, bbox);
          }
        },

        (type, message) => {
          if (type === 'no-access') {
            showNoAccessText();
          }
          if (type === 'empty') {
            openLayerMap.removeLayer(newLayer.layerId);
          }
          dispatch(updateLayerFetchingStatus(newLayer.layerId));
          emitToast('error', message);
          cleanUpSideEffects();
        },
        () => {
          cleanUpSideEffects();
          dispatch(updateLayerFetchingStatus(newLayer.layerId));
        }
      );
    }
  }
  function handleBboxSearch() {
    dialogCloseTrigger(false);
    const newLayer = openLayerMap.createNewUserLayer('', 'Rectangle');
    openLayerMap.addDrawFeature('Rectangle', newLayer, (event) => {
      openLayerMap.removeDrawInteraction();
      openLayerMap.removeLayer(newLayer.layerId);
      const extent = event.feature.getGeometry()?.getExtent();
      if (extent) {
        handleUgixLayerAddition(extent);
      }
    });
  }

  async function handleResourceDownload() {
    try {
      const url = envurls.ugixOgcServer + 'collections/' + resource.id;
      const response = await axios.get(url);
      const assetData = response.data;

      const href = assetData.links.filter((e: any) => {
        return e.rel === 'enclosure';
      })[0]?.href;

      if (href) {
        downloadResourceData(href);
      } else {
        emitToast('error', 'Unable to download data');
      }
    } catch (err) {
      console.log(err);
      emitToast('error', 'Unable to download data');
    }
  }
  async function downloadResourceData(href: string) {
    const { error, token } = await getAccessToken(resource);
    if (error) {
      emitToast('error', 'Unable to get Data. Access denied');
    }
    if (token) {
      try {
        const response = await axios.get(href, {
          headers: { Authorization: 'Bearer ' + token },
          responseType: 'blob',
        });
        if (anchorRef.current) {
          anchorRef.current.href = URL.createObjectURL(response.data);
          anchorRef.current.download = `${resource.label}.gpkg`;
          anchorRef.current.click();
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  function cleanUpSideEffects() {
    setAdding(false);
    dispatch(updateLoadingState(false));
  }
  function showNoAccessText() {
    setNoAccess(true);
    setTimeout(() => {
      setNoAccess(false);
    }, 5000);
  }
  function toggleExtraButtonDrawer() {
    setIsExtraBtnVisible(!isExtraBtnVisible);
  }

  async function plotTiles() {
    console.log('tiles');
    let serverUrl = await getResourceServerRegURL(resource);
    console.log(serverUrl);
    try {
      const { error, token } = await getAccessToken(resource, serverUrl);

      if (error) {
        emitToast('error', 'No acces to data');
        return;
      }

      // const response = await axios.get(
      //   envurls.ugixOgcServer +
      //     `/collections/${resource.id}/map/tiles/WorldCRS84Quad`
      // );
      const response = await axios.get(
        `https://${serverUrl}/collections/${resource.id}/map/tiles/WorldCRS84Quad`
      );
      console.log(response);

      if (token && response.status === 200) {
        console.log('hi');

        // get server url
        const newLayer = openLayerMap.createNewUgixTileLayer(
          serverUrl,
          resource.label,
          resource.id,
          resource.resourceGroup,
          resource.ogcResourceInfo.geometryType,
          token
        );

        console.log(newLayer);
        dispatch(addCanvasLayer(newLayer));
        cleanUpSideEffects();
        dialogCloseTrigger(false);
      } else {
        throw new Error();
      }
    } catch (error) {
      emitToast('error', 'Unable to plot tiles, please try again later');
    }
  }
  return (
    <div className={styles.tile_container}>
      <a style={{ display: 'none' }} ref={anchorRef}></a>
      {/* content */}
      <div className={styles.tile_content}>
        <div className={styles.tile_description}>
          <TooltipWrapper content={resource.label}>
            <h2 className={styles.tile_title}>{resource.label}</h2>
          </TooltipWrapper>
          {resource.accessPolicy === 'OPEN' ? (
            <div className={styles.badge}>
              <FaUnlock /> Public
            </div>
          ) : (
            <div className={`${styles.badge} ${styles.badge_private}`}>
              <FaLock /> Restricted
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={getProviderIcon(resource.providerName!)}
              alt={resource.providerName}
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <span>{resource.providerName}</span>
          </div>
          <div
            className={styles.extra_button_container}
            data-visible={isExtraBtnVisible}
          >
            <button
              className={styles.extra_button}
              disabled={adding}
              onClick={() => handleUgixLayerAddition()}
            >
              Get all
            </button>
            <button
              disabled={adding}
              className={styles.extra_button}
              onClick={handleBboxSearch}
            >
              BBOX search
            </button>
          </div>
        </div>
        <TooltipWrapper content="add">
          <button
            className={styles.add_button}
            disabled={adding}
            onClick={toggleExtraButtonDrawer}
          >
            <div className={styles.add_icon}>
              {isExtraBtnVisible ? <FaMinus size={23} /> : <FaPlus size={23} />}
            </div>
          </button>
        </TooltipWrapper>
      </div>
      {/* icon container */}
      <div className={styles.icon_container}>
        <TooltipWrapper content="Download complete resources">
          <button onClick={handleResourceDownload}>
            <div className={styles.icon_wrapper}>
              <MdDownloadForOffline />
            </div>
          </button>
        </TooltipWrapper>
        <TooltipWrapper content="Resource info">
          <button onClick={handleInfoOpen}>
            <div className={styles.icon_wrapper}>
              <RiInformationFill />
            </div>
          </button>
        </TooltipWrapper>
      </div>
      {noAccess && (
        <div className={styles.warn_text}>
          You do not have access to view this data, please visit{' '}
          <a href={getinfoLink()} target="_blank">
            GDI page
          </a>{' '}
          to request access
        </div>
      )}
    </div>
  );
}

const areEqual = (prevProps: any, nextProps: any) => {
  // Only rerender if resources prop has changed
  return prevProps.resources === nextProps.resources;
};
export default memo(UgixFeatureTile, areEqual);
