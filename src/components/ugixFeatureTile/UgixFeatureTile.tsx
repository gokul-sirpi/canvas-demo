import { FaLock, FaUnlock } from 'react-icons/fa';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import styles from './styles.module.css';
import { RiInformationFill } from 'react-icons/ri';
import { QueryParams, Resource, ResourceDownload } from '../../types/resource';
import openLayerMap from '../../lib/openLayers';
import { SetStateAction, useRef, useState } from 'react';
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
    // store the resource data in session storage
    sessionStorage.setItem(
      `${resource.id}-ugix-resource`,
      JSON.stringify(resource)
    );

    if (resource.ogcResourceInfo.ogcResourceAPIs.includes('VECTOR_TILES')) {
      plotTiles();
    } else {
      setAdding(true);
      dispatch(updateLoadingState(true));
      const newLayer = openLayerMap.createNewUgixLayer(
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
          } else {
            openLayerMap.zoomToFit(newLayer.layerId);
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
      const url = envurls.ugixOgcServer + 'stac/collections/' + resource.id;
      const response = await axios.get(url);
      const assetData = response.data as ResourceDownload;
      for (const asset in assetData.assets) {
        const { role, href } = assetData.assets[asset];
        if (role[0] === 'data') {
          downloadResourceData(href);
        } else {
          emitToast('error', 'Unable to download data');
        }
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
    try {
      const { error, token } = await getAccessToken(resource);
      if (error) {
        emitToast('error', 'No acces to data');
        return;
      }
      const response = await axios.get(
        envurls.ugixOgcServer +
          `/collections/${resource.id}/map/tiles/WorldCRS84Quad`
      );
      console.log(response);

      if (token && response.status === 200) {
        const newLayer = openLayerMap.createNewUgixTileLayer(
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

export default UgixFeatureTile;
