import { GoCircle } from 'react-icons/go';
import { IoSquareOutline } from 'react-icons/io5';
import { SlLocationPin } from 'react-icons/sl';
//
import styles from './styles.module.css';
import openLayerMap from '../../lib/openLayers';
import { useDispatch } from 'react-redux';
import { addCanvasLayer } from '../../context/canvasLayers/canvasLayerSlice';
import { drawType } from '../../types/UserLayer';
import { PiLineSegments, PiPolygon } from 'react-icons/pi';
import { RxRulerHorizontal } from 'react-icons/rx';
import { LuMousePointer2 } from 'react-icons/lu';
import * as Popover from '@radix-ui/react-popover';

function DrawingTool({
  toolType,
  changeSelectedTool,
}: {
  toolType: drawType | 'Cursor';
  changeSelectedTool?: (tool: drawType) => void;
}) {
  const dispatch = useDispatch();

  function drawFeature(type: drawType) {
    const newLayer = openLayerMap.createNewUserLayer('', type);
    if (changeSelectedTool) {
      changeSelectedTool(type);
    }
    let firstLayer = true;
    if (type === 'Point') {
      openLayerMap.addMarkerFeature(
        newLayer.layerId,
        newLayer.layerName,
        () => {
          if (firstLayer) {
            dispatch(addCanvasLayer(newLayer));
          }
          firstLayer = false;
        }
      );
    } else if (type === 'Measure') {
      openLayerMap.addDrawFeature(type, newLayer.layerId, newLayer.style);
    } else {
      openLayerMap.addDrawFeature(
        type,
        newLayer.layerId,
        newLayer.style,
        () => {
          if (firstLayer) {
            dispatch(addCanvasLayer(newLayer));
          }
          firstLayer = false;
        }
      );
    }
  }
  function clearAllEvents() {
    openLayerMap.removeDrawInteraction();
    if (
      openLayerMap.latestLayer &&
      openLayerMap.latestLayer.layerType === 'UserLayer' &&
      openLayerMap.latestLayer.featureType === 'Measure'
    ) {
      openLayerMap.removeLayer(openLayerMap.latestLayer.layerId);
    }
  }
  return (
    <>
      {toolType === 'Circle' && (
        <Popover.Close asChild>
          <button onClick={() => drawFeature('Circle')}>
            <div className={styles.btn_icon_container}>
              <GoCircle size={25} />
            </div>
          </button>
        </Popover.Close>
      )}
      {toolType === 'Rectangle' && (
        <Popover.Close asChild>
          <button onClick={() => drawFeature('Rectangle')}>
            <div className={styles.btn_icon_container}>
              <IoSquareOutline size={25} />
            </div>
          </button>
        </Popover.Close>
      )}
      {toolType === 'Point' && (
        <button onClick={() => drawFeature('Point')}>
          <div className={styles.btn_icon_container}>
            <SlLocationPin size={25} />
          </div>
        </button>
      )}
      {toolType === 'Polygon' && (
        <Popover.Close asChild>
          <button onClick={() => drawFeature('Polygon')}>
            <div className={styles.btn_icon_container}>
              <PiPolygon size={25} />
            </div>
          </button>
        </Popover.Close>
      )}
      {toolType === 'Measure' && (
        <button onClick={() => drawFeature('Measure')}>
          <div className={styles.btn_icon_container}>
            <RxRulerHorizontal size={25} />
          </div>
        </button>
      )}
      {toolType === 'Cursor' && (
        <button onClick={clearAllEvents}>
          <div className={styles.btn_icon_container}>
            <LuMousePointer2 size={25} />
          </div>
        </button>
      )}
      {toolType === 'Line' && (
        <Popover.Close asChild>
          <button onClick={() => drawFeature('Line')}>
            <div className={styles.btn_icon_container}>
              <PiLineSegments size={25} />
            </div>
          </button>
        </Popover.Close>
      )}
    </>
  );
}

export default DrawingTool;
