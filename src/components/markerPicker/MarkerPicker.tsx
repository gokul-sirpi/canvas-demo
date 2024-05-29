import * as Popover from '@radix-ui/react-popover';
//
import styles from './styles.module.css';
import { markerIcons } from '../../lib/layerStyle';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import { updateLayerMarkerIcon } from '../../context/canvasLayers/canvasLayerSlice';
import { UserLayer } from '../../types/UserLayer';
import { UgixLayer } from '../../types/UgixLayers';
function MarkerPicker({
  layer,
  index,
  disable,
}: {
  layer: UserLayer | UgixLayer;
  index: number;
  disable: boolean;
}) {
  const dispatch = useDispatch();

  function handleMarkerChange(id: number) {
    dispatch(updateLayerMarkerIcon({ index, id }));
    openLayerMap.changeMarkerIcon(layer.layerId, id);
  }
  return (
    <div className={styles.container}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button disabled={disable} className={styles.popover_trigger}>
            <img
              src={`icons/marker/${markerIcons[layer.style['marker-id']]}`}
              alt="marker"
            />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={styles.popover_content}>
            <Popover.Arrow className={styles.popover_arrow} />
            {markerIcons.map((icon, index) => {
              return (
                <Popover.Close asChild key={icon}>
                  <button
                    onClick={() => handleMarkerChange(index)}
                    className={styles.marker_btn}
                    key={icon}
                  >
                    <img src={`icons/marker/${icon}`} alt="marker" />
                  </button>
                </Popover.Close>
              );
            })}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export default MarkerPicker;
