//
import * as Popover from '@radix-ui/react-popover';
import styles from './styles.module.css';
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import { deleteGsixLayer } from '../../context/gsixLayers/gsixLayerSlice';
import { UserLayer } from '../../types/UserLayer';
import { GsixLayer } from '../../types/gsixLayers';
import { deleteUserLayer } from '../../context/userLayers/userLayerSlice';
import envurls from '../../utils/config';

function LayerMorePopover({ layer }: { layer: UserLayer | GsixLayer }) {
  const dispatch = useDispatch();
  function deleteLayer() {
    if (layer.layerType === 'UserLayer') {
      dispatch(deleteUserLayer(layer.layerId));
    } else if (layer.layerType === 'GsixLayer') {
      dispatch(deleteGsixLayer(layer.layerId));
    }
    openLayerMap.removeLayer(layer.layerId);
  }
  function handleInfoOpen() {
    if (layer.layerType === 'GsixLayer') {
      const groupId = layer.gsixLayerId.split('/').slice(0, -1).join('-');
      const path = envurls.gsixCatalogue + 'dataset/' + groupId;
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
            {layer.layerType === 'GsixLayer' && (
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
