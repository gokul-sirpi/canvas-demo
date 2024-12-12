//
import * as Popover from '@radix-ui/react-popover';
import styles from './styles.module.css';
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import openLayerMap from '../../lib/openLayers';
import { useDispatch, useSelector } from 'react-redux';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
import { deleteCanvasLayer } from '../../context/canvasLayers/canvasLayerSlice';
import envurls from '../../utils/config';
import { getCookieValue, setCookie } from '../../lib/cookieManger';
import { useRef } from 'react';
import { RootState } from '../../context/store';
import { getUgixFeatureById } from '../../lib/getUgixFeatureById';
import { emitToast } from '../../lib/toastEmitter';
import { toast } from 'react-toastify';
// import {
//   updateFooterLayerState,
//   updateFooterShownState,
// } from '../../context/footerState/footerStateSlice';

function LayerMorePopover({ layer }: { layer: UserLayer | UgixLayer }) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const dispatch = useDispatch();
  function deleteLayer() {
    dispatch(deleteCanvasLayer(layer.layerId));
    if (layer.layerType === 'UgixLayer') {
      removeCookieFromWishList(layer.ugixLayerId);
    }
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
    let l: UgixLayer = layer as UgixLayer;

    if (l.sourceType === 'tile') {
      try {
        const data = await getUgixFeatureById(l.ugixLayerId);
        console.log('data', data);

        const file = new Blob([JSON.stringify(data)], {
          type: 'application/geo+json;charset=utf-8',
        });

        const tempAnchor = document.createElement('a');
        const url = URL.createObjectURL(file);
        tempAnchor.href = url;
        tempAnchor.download = `${l.layerName}.geojson`;
        document.body.appendChild(tempAnchor);
        tempAnchor.click();
        document.body.removeChild(tempAnchor);

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      } catch (err) {
        emitToast('error', 'Failed to export data');
        console.log(err);
      } finally {
        toast.dismiss('exporting-data');
      }
      return;
    }

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

  const canvasLayers = useSelector((state: RootState) => {
    return state.canvasLayer.layers;
  });

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
