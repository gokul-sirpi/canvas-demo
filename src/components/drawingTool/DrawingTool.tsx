import { GoCircle } from 'react-icons/go';
import { IoSquareOutline } from 'react-icons/io5';
import { SlLocationPin } from 'react-icons/sl';
//
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
      openLayerMap.addMarkerFeature(newLayer, () => {
        if (firstLayer) {
          dispatch(addCanvasLayer(newLayer));
        }
        firstLayer = false;
      });
    } else if (type === 'Measure') {
      openLayerMap.addDrawFeature(type, newLayer);
    } else {
      openLayerMap.addDrawFeature(type, newLayer, () => {
        if (firstLayer) {
          dispatch(addCanvasLayer(newLayer));
        }
        firstLayer = false;
      });
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
          <button
            className="header_button"
            onClick={() => drawFeature('Circle')}
          >
            <div>
              <GoCircle size={25} />
            </div>
          </button>
        </Popover.Close>
      )}
      {toolType === 'Rectangle' && (
        <Popover.Close asChild>
          <button
            className="header_button"
            onClick={() => drawFeature('Rectangle')}
          >
            <div>
              <IoSquareOutline size={25} />
            </div>
          </button>
        </Popover.Close>
      )}
      {toolType === 'Point' && (
        <button className="header_button" onClick={() => drawFeature('Point')}>
          <div>
            <SlLocationPin size={23} />
          </div>
        </button>
      )}
      {toolType === 'Polygon' && (
        <Popover.Close asChild>
          <button
            className="header_button"
            onClick={() => drawFeature('Polygon')}
          >
            <div>
              <PiPolygon size={26} />
            </div>
          </button>
        </Popover.Close>
      )}
      {toolType === 'Measure' && (
        <button
          className="header_button"
          onClick={() => drawFeature('Measure')}
        >
          <div>
            <RxRulerHorizontal size={25} />
          </div>
        </button>
      )}
      {toolType === 'Cursor' && (
        <button className="header_button" onClick={clearAllEvents}>
          <div>
            <LuMousePointer2 size={25} />
          </div>
        </button>
      )}
      {toolType === 'Line' && (
        <Popover.Close asChild>
          <button className="header_button" onClick={() => drawFeature('Line')}>
            <div>
              <PiLineSegments size={25} />
            </div>
          </button>
        </Popover.Close>
      )}
    </>
  );
}

export default DrawingTool;
