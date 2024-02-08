import { useRef, useState } from 'react';
import { PiDotsThreeOutlineFill } from 'react-icons/pi';
import { IoSettingsOutline } from 'react-icons/io5';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io';
import { UserLayer } from '../../types/UserLayer';
//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import {
  deleteUserLayer,
  updateLayerColor,
  updateUserLayer,
} from '../../context/userLayers/userLayerSlice';
import { GsixLayer } from '../../types/gsixLayers';

function LayerTile({
  layer,
  index,
}: {
  layer: UserLayer | GsixLayer;
  index: number;
}) {
  const layerNameRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState<boolean | undefined>(
    openLayerMap.getLayerVisibility(layer.layerId)
  );
  const [selectedColor, setSelectedColor] = useState<string>(layer.layerColor);

  const dispatch = useDispatch();
  function toggleLayerVisibility() {
    if (visible) {
      openLayerMap.toggleLayerVisibility(layer.layerId, false);
      setVisible(false);
    } else {
      openLayerMap.toggleLayerVisibility(layer.layerId, true);
      setVisible(true);
    }
  }

  function completeLayerCreation() {
    openLayerMap.removeDrawInteraction();
    let layerName = layerNameRef.current?.value;
    if (!layerName) {
      layerName = `Layer${index + 1}`;
    }
    const modifiedLayer = { ...layer };
    modifiedLayer.layerName = layerName;
    modifiedLayer.isCompleted = true;
    dispatch(updateUserLayer({ index, modifiedLayer }));
  }

  function cancelLayerCreation() {
    openLayerMap.removeLayer(layer.layerId);
    openLayerMap.removeDrawInteraction();
    dispatch(deleteUserLayer(layer.layerId));
  }

  function handleColorChange(text: string) {
    setSelectedColor(text);
    openLayerMap.changeLayerColor(layer.layerId,selectedColor)
    dispatch(
      updateLayerColor({ layerId: layer.layerId, newColor: selectedColor })
    );
    console.log(layer);
  }

  return (
    <div className={styles.container}>
      <div className={styles.input_container}>
        <button onClick={toggleLayerVisibility}>
          <div className={styles.btn_icon_container}>
            {visible ? <FaRegEye size={15} /> : <FaRegEyeSlash size={15} />}
          </div>
        </button>
        {layer.isCompleted ? (
          <div className={styles.layer_title_container}>
            <p className={styles.layer_title}>{layer.layerName}</p>
          </div>
        ) : (
          <input
            placeholder={`default name - Layer${index + 1}`}
            ref={layerNameRef}
            autoFocus
            type="text"
          />
        )}
      </div>
      <div className={styles.btn_container}>
        {layer.isCompleted ? (
          <div className={styles.layer_controllers}>
            <input
              type="color"
              className={styles.color_picker}
              defaultValue={selectedColor}
              color={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
            />
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
        ) : (
          <>
            <button>
              <div
                onClick={cancelLayerCreation}
                className={styles.btn_icon_container}
              >
                <IoIosCloseCircle size={25} />
              </div>
            </button>
            <button onClick={completeLayerCreation}>
              <div className={styles.btn_icon_container}>
                <IoIosCheckmarkCircle size={25} />
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default LayerTile;
