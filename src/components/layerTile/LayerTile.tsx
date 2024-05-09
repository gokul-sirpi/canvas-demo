import { ChangeEvent, useRef, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io';
import { UserLayer } from '../../types/UserLayer';
//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import {
  deleteCanvasLayer,
  updateCanvasLayerColor,
  updateCanvasLayer,
} from '../../context/canvasLayers/canvasLayerSlice';
import { UgixLayer } from '../../types/UgixLayers';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import LayerMorePopover from '../layerMorePopover/LayerMorePopover';
import { GoCircle } from 'react-icons/go';
import { IoShapesOutline, IoSquareOutline } from 'react-icons/io5';
import { PiLineSegments, PiPolygon } from 'react-icons/pi';
import MarkerPicker from '../markerPicker/MarkerPicker';
import Loader from '../loader/Loader';

function LayerTile({
  layer,
  index,
}: {
  layer: UserLayer | UgixLayer;
  index: number;
}) {
  const layerNameRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState<boolean | undefined>(
    openLayerMap.getLayerVisibility(layer.layerId)
  );
  const [selectedColor, setSelectedColor] = useState<string>(layer.layerColor);
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
    dispatch(updateCanvasLayer({ index, modifiedLayer }));
    openLayerMap.updateFeatureProperties(
      modifiedLayer.layerId,
      'layer',
      layerName
    );
  }

  function cancelLayerCreation() {
    openLayerMap.removeLayer(layer.layerId);
    openLayerMap.removeDrawInteraction();
    dispatch(deleteCanvasLayer(layer.layerId));
  }

  function handleColorChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    const changedStyle = openLayerMap.changeLayerColor(layer.layerId, text);
    dispatch(
      updateCanvasLayerColor({
        layerId: layer.layerId,
        newColor: text,
        style: changedStyle,
      })
    );
    setSelectedColor(text);
  }

  return (
    <div className={styles.container} data-layer={layer.layerType}>
      <div
        className={`${styles.layer_badge} ${layer.layerType === 'UserLayer' ? styles.userTile : null}`}
      >
        {/* {layer.layerType == 'UgixLayer' ? 'UGIX' : 'User'} */}
      </div>
      <div className={styles.input_container}>
        <button onClick={toggleLayerVisibility}>
          <div className={styles.btn_icon_container}>
            {visible ? <FaRegEye size={15} /> : <FaRegEyeSlash size={15} />}
          </div>
        </button>
        {layer.isCompleted ? (
          <TooltipWrapper content={layer.layerName}>
            <div className={styles.layer_title_container}>
              <p ref={titleRef} className={styles.layer_title}>
                {layer.layerName}
              </p>
            </div>
          </TooltipWrapper>
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
            {layer.layerType === 'UgixLayer' && layer.fetching && <Loader />}
            {layer.editable && (
              <>
                {layer.featureType === 'Point' ? (
                  <MarkerPicker layerId={layer.layerId} />
                ) : (
                  <div className={styles.color_picker_container}>
                    <input
                      type="color"
                      className={styles.color_picker}
                      defaultValue={selectedColor}
                      color={selectedColor}
                      onChange={handleColorChange}
                      id={layer.layerId}
                      tabIndex={-1}
                    />
                    <label
                      htmlFor={layer.layerId}
                      style={{ backgroundColor: `${selectedColor}` }}
                      className={styles.color_label}
                    ></label>
                  </div>
                )}
              </>
            )}
            {layer.layerType === 'UserLayer' && (
              <>
                {layer.featureType === 'Circle' && <GoCircle size={13} />}
                {layer.featureType === 'Rectangle' && (
                  <IoSquareOutline size={13} />
                )}
                {layer.featureType === 'Polygon' && <PiPolygon size={13} />}
                {layer.featureType === 'Line' && <PiLineSegments size={13} />}
                {layer.featureType === 'GeometryCollection' && (
                  <IoShapesOutline size={13} />
                )}
              </>
            )}
            <LayerMorePopover layer={layer} />
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
