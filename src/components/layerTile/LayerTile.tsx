import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { RootState } from '../../context/store';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io';
import { UserLayer } from '../../types/UserLayer';
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteCanvasLayer,
  updateCanvasLayerColor,
  updateCanvasLayer,
} from '../../context/canvasLayers/canvasLayerSlice';
import { UgixLayer } from '../../types/UgixLayers'; // Include StacLayer
import { StacLayer } from '../../types/StacLayer'; // Import StacLayer
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import LayerMorePopover from '../layerMorePopover/LayerMorePopover';
import { GoCircle } from 'react-icons/go';
import { IoShapesOutline, IoSquareOutline } from 'react-icons/io5';
import { PiLineSegments, PiPolygon } from 'react-icons/pi';
import MarkerPicker from '../markerPicker/MarkerPicker';
import Loader from '../loader/Loader';
import { updateDrawingTool } from '../../context/drawingTool/drawingToolSlice';

function LayerTile({
  layer,
  index,
  isTile = true,
}: {
  layer: UserLayer | UgixLayer | StacLayer; // Support both UgixLayer and StacLayer
  index: number;
  isTile?: boolean;
}) {
  const canvasLayers = useSelector(
    (state: RootState) => state.canvasLayer.layers
  );
  const ugixResources: string[] = [];
  const stacResources: string[] = [];

  canvasLayers.map((layer: UserLayer | UgixLayer | StacLayer) => {
    if (layer.layerType === 'UgixLayer') {
      ugixResources.push(layer.layerId);
    } else if (layer.layerType === 'StacLayer') {
      stacResources.push(layer.layerId); // Collect StacLayer resources
    }
  });

  const layerNameRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState<boolean | undefined>(
    openLayerMap.getLayerVisibility(layer.layerId)
  );
  const [selectedColor, setSelectedColor] = useState<string>(layer.layerColor);
  const [useEffIndex, setUseEffIndex] = useState(index);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const swiperShown = useSelector(
    (state: RootState) => state.swipeShown.swipeShown
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      (layer.layerType === 'UgixLayer' || layer.layerType === 'StacLayer') &&
      layer.isCompleted &&
      !layer.fetching &&
      useEffIndex === index
    ) {
      setUseEffIndex(useEffIndex + 1);
    }
  }, [layer, ugixResources, stacResources, useEffIndex, index]);

  function toggleLayerVisibility() {
    openLayerMap.toggleLayerVisibility(layer.layerId, !visible);
    setVisible(!visible);
  }

  function completeLayerCreation() {
    openLayerMap.removeDrawInteraction();
    dispatch(updateDrawingTool('None'));
    const layerName = layerNameRef.current?.value || `Layer${index + 1}`;
    const modifiedLayer = { ...layer, layerName, isCompleted: true };
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
    dispatch(updateDrawingTool('None'));
    dispatch(deleteCanvasLayer(layer.layerId));
  }
  function handleColorChange(event: ChangeEvent<HTMLInputElement>) {
    const newColor = event.target.value;
    const changedStyle = openLayerMap.changeLayerColor(layer.layerId, newColor);
    dispatch(
      updateCanvasLayerColor({
        layerId: layer.layerId,
        newColor,
        style: changedStyle,
      })
    );
    setSelectedColor(newColor);
  }

  function handleOpacityChange(value: number) {
    const newOpacity = value / 100;
    openLayerMap.setLayerOpacity(layer.layerId, newOpacity);

    const modifiedLayer = { ...layer, opacity: newOpacity };
    dispatch(updateCanvasLayer({ index, modifiedLayer }));
  }

  return (
    <div className={styles.container} data-layer={layer.layerType}>
      <div
        className={`${styles.layer_badge} ${
          layer.layerType === 'UserLayer' ? styles.userTile : ''
        }`}
      ></div>
      <div className={styles.input_container}>
        {isTile && (
          <button className={styles.eye_btn} onClick={toggleLayerVisibility}>
            <div className={styles.btn_icon_container}>
              {visible ? <FaRegEye size={15} /> : <FaRegEyeSlash size={15} />}
            </div>
          </button>
        )}
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
      {swiperShown && isTile && (
        <div>
          {layer.side === 'left' && 'L'}
          {layer.side === 'right' && 'R'}
        </div>
      )}
      <div className={styles.btn_container}>
        {layer.isCompleted ? (
          <div className={styles.layer_controllers}>
            {(layer.layerType === 'UgixLayer' ||
              layer.layerType === 'StacLayer') &&
              layer.fetching && <Loader />}
            {layer.editable && (
              <>
                {'featureType' in layer && layer.featureType === 'Point' ? (
                  <>
                    <div className={styles.empty_box}></div>
                    <MarkerPicker
                      disable={!isTile}
                      index={index}
                      layer={layer}
                    />
                  </>
                ) : layer.layerType === 'StacLayer' ? (
                  <div className={styles.opacity_slider_container}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={((layer as StacLayer).opacity ?? 1) * 100}
                      onChange={(e) =>
                        handleOpacityChange(Number(e.target.value))
                      }
                      className={styles.opacity_slider}
                    />
                    <label className={styles.opacity_label}>
                      {Math.round(((layer as StacLayer).opacity ?? 1) * 100)}%
                    </label>
                  </div>
                ) : (
                  <div className={styles.color_picker_container}>
                    <input
                      disabled={!isTile}
                      type="color"
                      className={styles.color_picker}
                      defaultValue={selectedColor}
                      color={selectedColor}
                      onChange={handleColorChange}
                      id={layer.layerId + isTile}
                      tabIndex={-1}
                    />
                    <label
                      htmlFor={layer.layerId + isTile}
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
            {isTile && (
              <LayerMorePopover
                layer={layer}
                onDeleteLayer={(layerId: string) =>
                  dispatch(deleteCanvasLayer(layerId))
                }
              />
            )}
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
