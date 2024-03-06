import { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io';
import { UserLayer } from '../../types/UserLayer';
//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import {
  deleteUserLayer,
  updateUserLayerColor,
  updateUserLayer,
} from '../../context/userLayers/userLayerSlice';
import { GsixLayer } from '../../types/gsixLayers';
import { updateGsixLayerColor } from '../../context/gsixLayers/gsixLayerSlice';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import LayerMorePopover from '../layerMorePopover/LayerMorePopover';
import { GoCircle } from 'react-icons/go';
import { IoShapesOutline, IoSquareOutline } from 'react-icons/io5';
import { PiLineSegments, PiPolygon } from 'react-icons/pi';

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
  const [isTextOverflowing, setIsTextOverflowing] = useState(false);
  const titleRef = useRef<HTMLParagraphElement>(null);
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
    openLayerMap.changeLayerColor(layer.layerId, selectedColor);
    if (layer.layerType === 'GsixLayer') {
      dispatch(
        updateGsixLayerColor({ layerId: layer.layerId, newColor: text })
      );
    } else {
      dispatch(
        updateUserLayerColor({
          layerId: layer.layerId,
          newColor: text,
        })
      );
    }
    setSelectedColor(text);
  }

  useEffect(() => {
    const layerTitle = titleRef.current;
    if (layerTitle) {
      const isOverflowing = layerTitle.scrollWidth > layerTitle.clientWidth;
      setIsTextOverflowing(isOverflowing);
    }
  }, [layer.layerName]);

  return (
    <div className={styles.container}>
      <div className={styles.input_container}>
        <button onClick={toggleLayerVisibility}>
          <div className={styles.btn_icon_container}>
            {visible ? <FaRegEye size={15} /> : <FaRegEyeSlash size={15} />}
          </div>
        </button>
        {layer.isCompleted ? (
          isTextOverflowing ? (
            <TooltipWrapper content={layer.layerName}>
              <div className={styles.layer_title_container}>
                <p ref={titleRef} className={styles.layer_title}>
                  {layer.layerName}
                </p>
              </div>
            </TooltipWrapper>
          ) : (
            <>
              <div className={styles.layer_title_container}>
                <p ref={titleRef} className={styles.layer_title}>
                  {layer.layerName}
                </p>
              </div>
            </>
          )
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
            {layer.layerType === 'UserLayer' &&
            layer.featureType === 'Marker' ? null : (
              <>
                <input
                  type="color"
                  className={styles.color_picker}
                  defaultValue={selectedColor}
                  color={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  id={layer.layerId}
                  tabIndex={-1}
                />
                <label
                  htmlFor={layer.layerId}
                  style={{ backgroundColor: `${selectedColor}` }}
                  className={styles.color_label}
                ></label>
              </>
            )}
            {layer.layerType === 'UserLayer' && (
              <>
                {layer.featureType === 'Marker' && <FaMapMarkerAlt size={13} />}
                {layer.featureType === 'Circle' && <GoCircle size={13} />}
                {layer.featureType === 'Box' && <IoSquareOutline size={13} />}
                {layer.featureType === 'Polygon' && <PiPolygon size={13} />}
                {layer.featureType === 'Line' && <PiLineSegments size={13} />}
                {layer.featureType === 'GeometryCollection' && (
                  <IoShapesOutline size={13} />
                )}
              </>
            )}

            <LayerMorePopover layer={layer} />
            {/* <button>
              <div className={styles.btn_icon_container}>
                <IoSettingsOutline size={20} />
              </div>
            </button> */}
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
