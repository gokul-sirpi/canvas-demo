//
import { PiDotsThreeOutlineFill } from 'react-icons/pi';
import { UserLayer } from '../../types/UserLayer';
import styles from './styles.module.css';
import { IoSettingsOutline } from 'react-icons/io5';
import { useState } from 'react';

function LayerTile({ layer }: { layer: UserLayer }) {
  const [visible, setVisible] = useState<boolean>(layer.layer.isVisible());
  function toggleLayerVisibility() {
    if (layer.layer.isVisible()) {
      layer.layer.setVisible(false);
      setVisible(false);
    } else {
      layer.layer.setVisible(true);
      setVisible(true);
    }
  }
  return (
    <div className={styles.container}>
      <div className={styles.input_container}>
        <input
          type="checkbox"
          checked={visible}
          name=""
          id={layer.layerId}
          onChange={toggleLayerVisibility}
        />
        <label htmlFor={layer.layerId}>{layer.layerName}</label>
      </div>
      <div className={styles.btn_container}>
        <button>
          <div className={styles.btn_icon_container}>
            <PiDotsThreeOutlineFill size={20} />
          </div>
        </button>
        <button>
          <div className={styles.btn_icon_container}>
            <IoSettingsOutline size={20} />
          </div>
        </button>
      </div>
    </div>
  );
}

export default LayerTile;
