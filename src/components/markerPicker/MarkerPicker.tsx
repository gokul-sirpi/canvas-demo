import * as Popover from '@radix-ui/react-popover';
//
import styles from './styles.module.css';
import { markerIcons } from '../../lib/layerStyle';
import { useState } from 'react';
import openLayerMap from '../../lib/openLayers';
function MarkerPicker({ layerId }: { layerId: string }) {
  const [selectedInd, setSelectedInd] = useState(0);
  function handleMarkerChange(index: number) {
    setSelectedInd(index);
    openLayerMap.changeMarkerIcon(layerId, index);
  }
  return (
    <div className={styles.container}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className={styles.popover_trigger}>
            <img src={`icons/${markerIcons[selectedInd]}`} alt="marker" />
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
                    <img src={`icons/${icon}`} alt="marker" />
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
