//
import * as Popover from '@radix-ui/react-popover';
import styles from './styles.module.css';
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
import { deleteCanvasLayer } from '../../context/canvasLayers/canvasLayerSlice';
import envurls from '../../utils/config';
import { getCookieValue, setCookie } from '../../lib/cookieManger';
import { useRef } from 'react';
import { getUgixFeatureById } from '../../lib/getUgixFeatureById';
import { emitToast } from '../../lib/toastEmitter';
import { toast } from 'react-toastify';
import { StacLayer } from '../../types/StacLayer';
// import {
//   updateFooterLayerState,
//   updateFooterShownState,
// } from '../../context/footerState/footerStateSlice';

function LayerMorePopover({
  layer,
  onDeleteLayer,
}: {
  layer: UserLayer | UgixLayer | StacLayer;
  onDeleteLayer: (layerId: string) => void;
}) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const dispatch = useDispatch();

  function deleteLayer() {
    dispatch(deleteCanvasLayer(layer.layerId));
    if (layer.layerType === 'UgixLayer') {
      removeCookieFromWishList(layer.ugixLayerId);
    }
    if (layer.layerType === 'StacLayer') {
      sessionStorage.removeItem(layer.layerId + '-extent');
    }
    onDeleteLayer?.(layer.layerId);
    openLayerMap.removeLayer(layer.layerId);
  }

  function removeCookieFromWishList(id: string) {
    const cookie = getCookieValue(envurls.catalogueCookie);
    if (cookie) {
      const allIds = cookie.split(',');
      const indexOfIdInCookie = allIds.indexOf(id);
      if (indexOfIdInCookie !== -1) {
        allIds.splice(indexOfIdInCookie, 1);
        setCookie(envurls.catalogueCookie, allIds.join());
      }
    }
  }
  function handleInfoOpen() {
    if (layer.layerType === 'UgixLayer') {
      const groupId = layer.ugixGroupId;
      const path = envurls.ugixCatalogue + 'dataset/' + groupId;
      window.open(path, '_blank');
    }
  }
  async function handleLayerExport() {
    let l = layer;

    // Handle Ugix
    if (l.layerType === 'UgixLayer' && l.sourceType === 'tile') {
      try {
        const data = await getUgixFeatureById(l.ugixLayerId);
        const file = new Blob([JSON.stringify(data)], {
          type: 'application/geo+json;charset=utf-8',
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(file);
        link.href = url;
        link.download = `${l.layerName}.geojson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (err) {
        emitToast('error', 'Failed to export data');
        console.log(err);
      } finally {
        toast.dismiss('exporting-data');
      }
      return;
    }
    if (l.layerType === 'StacLayer') {
      try {
        const stacLayerEntry = openLayerMap.canvasLayers.get(l.layerId);
        if (!stacLayerEntry || !stacLayerEntry.layer) {
          throw new Error('Layer not found in map');
        }

        const stacLayer = stacLayerEntry.layer;

        // ✅ Get the STAC item URL from the custom property
        const stacItemUrl = stacLayer.get('stac-url');
        if (!stacItemUrl) {
          throw new Error('STAC item URL not found on the layer');
        }

        const response = await fetch(stacItemUrl);
        const stacJson = await response.json();

        const asset =
          stacJson.assets?.visual ||
          stacJson.assets?.overview ||
          stacJson.assets?.thumbnail ||
          Object.values(stacJson.assets || {})[0];

        if (!asset?.href) {
          throw new Error('No downloadable asset found in STAC item');
        }

        const link = document.createElement('a');
        link.href = asset.href;
        link.download = `${l.layerName || 'stac-layer'}.tif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error(err);
        emitToast('error', 'Failed to export data');
      } finally {
        toast.dismiss('exporting-data');
      }
      return;
    }

    // Default fallback to GeoJSON export for other layer types
    const geojsonData = openLayerMap.createGeojsonFromLayer(layer.layerId);
    const file = new Blob([JSON.stringify(geojsonData)], {
      type: 'text/json;charset=utf-8',
    });

    if (anchorRef.current) {
      anchorRef.current.href = URL.createObjectURL(file);
      anchorRef.current.download = `${layer.layerName}.geojson`;
      anchorRef.current.click();
    }
  }

  // function handleFooterUpdate() {
  //   dispatch(updateFooterShownState(true));
  //   dispatch(updateFooterLayerState(layer));
  // }

  return (
    <>
      <Popover.Root>
        <TooltipWrapper content="More" side="right">
          <Popover.Trigger asChild>
            <button className={styles.popover_trigger}>
              <div className={styles.btn_icon_container}>
                <PiDotsThreeOutlineVerticalFill size={18} />
              </div>
            </button>
          </Popover.Trigger>
        </TooltipWrapper>
        <Popover.Portal>
          <Popover.Content className={styles.popover_content}>
            <div>
              <button onClick={deleteLayer} className={styles.popover_btn}>
                Delete layer
              </button>
            </div>
            <div>
              <Popover.Close asChild>
                <button
                  onClick={handleLayerExport}
                  className={styles.popover_btn}
                >
                  Export layer
                </button>
              </Popover.Close>
            </div>
            <div>
              <Popover.Close asChild>
                <button
                  className={styles.popover_btn}
                  onClick={() => {
                    const extent = JSON.parse(
                      sessionStorage.getItem(layer.layerId + '-extent')!
                    );
                    openLayerMap.zoomToFit(layer.layerId, extent);
                  }}
                >
                  Zoom to bound
                </button>
              </Popover.Close>
            </div>
            {/* <div>
              <Popover.Close asChild>
                <button
                  onClick={handleFooterUpdate}
                  className={styles.popover_btn}
                >
                  Properties
                </button>
              </Popover.Close>
            </div> */}
            {layer.layerType === 'UgixLayer' && (
              <div>
                <button onClick={handleInfoOpen} className={styles.popover_btn}>
                  About
                </button>
              </div>
            )}
            <a ref={anchorRef} href=""></a>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}

export default LayerMorePopover;
