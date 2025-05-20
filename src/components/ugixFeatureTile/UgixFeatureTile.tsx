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
import StacItemsPopup from './stacListPopup/StackListPopUp';
import * as Dialog from '@radix-ui/react-dialog';

function UgixFeatureTile({
  resource,
  dialogCloseTrigger,
}: {
  resource: Resource;
  dialogCloseTrigger: React.Dispatch<SetStateAction<boolean>>;
}) {
  const dispatch = useDispatch();
  const [noAccess, setNoAccess] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isExtraBtnVisible, setIsExtraBtnVisible] = useState(false);
  const [stacItems, setStacItems] = useState<any[]>([]);
  const [secondPageItems, setSecondPageItems] = useState<any[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [paginationHistory, setPaginationHistory] = useState<string[]>([]);
  const [limit] = useState(12); // Set to 12 per cURL
  const [hasMoreStacItems, setHasMoreStacItems] = useState(true);
  const [showStacPopup, setShowStacPopup] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
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

    sessionStorage.setItem(
      `${resource.id}-ugix-resource`,
      JSON.stringify(resource)
    );
    console.log(resource);
    if (resource?.ogcResourceInfo?.ogcResourceAPIs?.includes('VECTOR_TILES')) {
      plotTiles();
    } else if (resource?.ogcResourceInfo?.ogcResourceAPIs?.includes('STAC')) {
      getStacItems(null); // Initial call with no URL
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
    let serverUrl = await getResourceServerRegURL(resource);
    try {
      const url = 'https://' + serverUrl + '/collections/' + resource.id;
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
      console.log('download error', err);
      emitToast('error', 'Unable to download data');
    }
  }

  async function downloadResourceData(href: string) {
    let serverUrl = await getResourceServerRegURL(resource);

    const { error, token } = await getAccessToken(resource, serverUrl);
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
    try {
      const { error, token } = await getAccessToken(resource, serverUrl);

      if (error) {
        emitToast('error', 'No access to data');
        return;
      }

      const response = await axios.get(
        `https://${serverUrl}/collections/${resource.id}/map/tiles/WorldCRS84Quad`
      );
      console.log(response);

      if (token && response.status === 200) {
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

  async function getStacItems(url: string | null) {
    console.log('Fetching STAC items with URL:', url || 'Initial call');
    setAdding(true);
    dispatch(updateLoadingState(true));

    let serverUrl = await getResourceServerRegURL(resource);
    try {
      const { error, token } = await getAccessToken(resource, serverUrl);
      if (error) {
        emitToast('error', 'No access to data');
        cleanUpSideEffects();
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Verify collection exists
      const res = await axios.get(
        `https://${serverUrl}/stac/collections/${resource.id}`,
        { headers }
      );

      if (token && res.status === 200) {
        // Use provided URL or construct initial URL
        const fetchUrl = url || `https://${serverUrl}/stac/collections/${resource.id}/items?limit=${limit}`;
        const items = await axios.get(fetchUrl, { headers });

        console.log('Full API Response:', JSON.stringify(items.data, null, 2));
        console.log('Fetched items:', items.data.features.length, 'URL:', fetchUrl);
        console.log('Current stacItems length:', items.data.features.length);

        const newItems = items.data.features;
        const nextLink = items.data.links?.find((link: any) => link.rel === 'next')?.href;

        // If no items and no next link, revert to second page items without updating history
        if (newItems.length === 0 && !nextLink) {
          emitToast('info', 'No data found');
          // Use secondPageItems if available, otherwise current stacItems (for single-page case)
          setStacItems(secondPageItems.length > 0 ? secondPageItems : stacItems);
          setNextUrl(null);
          setHasMoreStacItems(false);
          setAdding(false);
          dispatch(updateLoadingState(false));
          console.log('Reverted stacItems:', secondPageItems.length > 0 ? secondPageItems.length : stacItems.length);
          return;
        }

        // Update pagination history for valid responses
        setPaginationHistory((prev) => {
          if (prev[prev.length - 1] !== fetchUrl) {
            return [...prev, fetchUrl];
          }
          return prev;
        });

        // Update secondPageItems when on page 2
        if (paginationHistory.length === 1 && newItems.length > 0) {
          // This will be page 2 after adding fetchUrl
          setSecondPageItems(newItems);
        }

        setStacItems(newItems);
        setNextUrl(nextLink || null);
        setHasMoreStacItems(!!nextLink);

        setShowStacPopup(true);
        cleanUpSideEffects();
      } else {
        throw new Error('Failed to fetch STAC collection');
      }
    } catch (error) {
      console.error('Error fetching STAC items:', error);
      emitToast('error', 'Failed to fetch STAC items');
      cleanUpSideEffects();
    }
  }

  function fetchNextPage() {
    console.log('fetchNextPage called, nextUrl:', nextUrl, 'hasMoreStacItems:', hasMoreStacItems);
    if (nextUrl) {
      getStacItems(nextUrl);
    } else {
      emitToast('info', 'No data found');
      setStacItems(secondPageItems.length > 0 ? secondPageItems : stacItems);
      console.log('Reverted stacItems in fetchNextPage:', secondPageItems.length > 0 ? secondPageItems.length : stacItems.length);
    }
  }

  function fetchPreviousPage() {
    console.log('fetchPreviousPage called, paginationHistory length:', paginationHistory.length);
    if (paginationHistory.length > 1) {
      // Pop the current page and get the previous one
      const newHistory = [...paginationHistory];
      newHistory.pop(); // Remove current page
      const previousUrl = newHistory[newHistory.length - 1];

      // Fetch previous page
      getStacItems(previousUrl);

      // Update history (remove the popped entry)
      setPaginationHistory(newHistory);
    }
  }

  function handlePreviewStac(item: any) {
    const thumbnailAsset = Object.values(item.assets || {}).find(
      (asset: any) =>
        Array.isArray(asset.roles) && asset.roles.includes('thumbnail')
    );

    if (
      thumbnailAsset &&
      typeof thumbnailAsset === 'object' &&
      'href' in thumbnailAsset
    ) {
      setPreviewImageUrl(thumbnailAsset.href as string);
      setIsDialogOpen(true);
    } else {
      console.warn('No thumbnail found for STAC item:', item);
    }
  }

  function handlePlotStac(
    imageUrl: string,
    bbox: [number, number, number, number]
  ) {
    console.log('Plot STAC item:', imageUrl);
    const stac = openLayerMap.createNewStacImageLayer(imageUrl, bbox);
    console.log(stac);
    dispatch(addCanvasLayer(stac));
    setShowStacPopup(false);
    dialogCloseTrigger(false);
  }

  function closeStacPopup() {
    console.log('closeStacPopup called');
    setShowStacPopup(false);
    setStacItems([]);
    setSecondPageItems([]);
    setNextUrl(null);
    setPaginationHistory([]);
    setHasMoreStacItems(true);
  }

  return (
    <div className={styles.tile_container}>
      <a style={{ display: 'none' }} ref={anchorRef}></a>
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
            {resource?.ogcResourceInfo?.ogcResourceAPIs &&
            resource?.ogcResourceInfo?.ogcResourceAPIs[0] !== 'STAC' ? (
              <>
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
              </>
            ) : (
              <>
                <button
                  className={styles.extra_button}
                  disabled={adding}
                  onClick={() => getStacItems(null)}
                >
                  {adding ? 'Loading...' : 'Get STAC list'}
                </button>
              </>
            )}
          </div>
        </div>
        <TooltipWrapper content="add">
          <button
            className={styles.add_button}
            disabled={adding}
            onClick={toggleExtraButtonDrawer}
          >
            <div className={styles.add_icon}>
              {isExtraBtnVisible ? <FaMinus size="23" /> : <FaPlus size="23" />}
            </div>
          </button>
        </TooltipWrapper>
      </div>
      <div className={styles.icon_container}>
        <TooltipWrapper
          content={
            resource.isDownloadEnabled
              ? 'Download complete resources'
              : 'Download not available for this resource'
          }
        >
          <button
            disabled={!resource.isDownloadEnabled}
            onClick={handleResourceDownload}
          >
            <div
              className={styles.icon_wrapper}
              style={!resource.isDownloadEnabled ? { color: 'grey' } : {}}
            >
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

        {showStacPopup && (
        
        <StacItemsPopup
          resource={resource}
          stacItems={stacItems}
          onClose={closeStacPopup}
          onPreviewStac={handlePreviewStac}
          onPlotStac={handlePlotStac}
          setPreviewImageUrl={setPreviewImageUrl}
          fetchNextPage={fetchNextPage}
          fetchPreviousPage={fetchPreviousPage}
          hasMoreStacItems={hasMoreStacItems}
          isFirstPage={paginationHistory.length <= 1}
          paginationHistory={paginationHistory}
        />
  
      )}

      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setPreviewImageUrl(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialog_overlay} />
          <Dialog.Content className={styles.dialogContent}>
            <Dialog.Title className={styles.dialogTitle}>
              Preview STAC Image
            </Dialog.Title>
            <img
              src={previewImageUrl || ''}
              alt="Thumbnail"
              className={styles.previewImage}
            />
            <Dialog.Close
              onClick={() => setIsDialogOpen(false)}
              className={styles.dialogClose}
            >
              ×
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

const areEqual = (prevProps: any, nextProps: any) => {
  return prevProps.resources === nextProps.resources;
};

export default memo(UgixFeatureTile, areEqual);