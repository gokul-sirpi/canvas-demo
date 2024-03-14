//
import * as Popover from '@radix-ui/react-popover';
import styles from './styles.module.css';
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import { deleteUgixLayer } from '../../context/ugixLayers/ugixLayerSlice';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
import { deleteUserLayer } from '../../context/userLayers/userLayerSlice';
import envurls from '../../utils/config';
import { getCookieValue, setCookie } from '../../lib/cookieManger';

function LayerMorePopover({ layer }: { layer: UserLayer | UgixLayer }) {
  const dispatch = useDispatch();
  function deleteLayer() {
    if (layer.layerType === 'UserLayer') {
      dispatch(deleteUserLayer(layer.layerId));
    } else if (layer.layerType === 'UgixLayer') {
      dispatch(deleteUgixLayer(layer.layerId));
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
      const groupId = layer.ugixLayerId.split('/').slice(0, -1).join('-');
      const path = envurls.ugixCatalogue + 'dataset/' + groupId;
      window.open(path, '_blank');
    }
  }
  return (
    <>
      <Popover.Root>
        <TooltipWrapper content="More">
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
                Delete
              </button>
            </div>
            {layer.layerType === 'UgixLayer' && (
              <div>
                <button onClick={handleInfoOpen} className={styles.popover_btn}>
                  About
                </button>
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}

export default LayerMorePopover;
