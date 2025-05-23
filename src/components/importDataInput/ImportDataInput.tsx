import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { TbFileImport } from 'react-icons/tb';
//
import styles from './styles.module.css';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';
import { GeoJsonObj } from '../../types/GeojsonType';
import openLayerMap from '../../lib/openLayers';
import { addCanvasLayer } from '../../context/canvasLayers/canvasLayerSlice';
import { updateLoadingState } from '../../context/loading/LoaderSlice';
import { emitToast } from '../../lib/toastEmitter';

function ImportDataInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  function handleSelectFile() {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }
  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      dispatch(updateLoadingState(true));
      const targetFile = event.target.files[0];
      const allNames = targetFile.name.split('.');
      const type = allNames[allNames.length - 1];
      if (type === 'json' || type === 'geojson') {
        const fr = new FileReader();
        fr.readAsText(targetFile);
        fr.onload = () => {
          const output = fr.result as string;
          const parsedData = JSON.parse(output) as GeoJsonObj;
          allNames.pop();
          const fileName = allNames.join();
          plotGeojsonData(parsedData, fileName);
          dispatch(updateLoadingState(false));
        };
        fr.onerror = () => {
          emitToast('error', 'Unable to load file');
          dispatch(updateLoadingState(false));
        };
      } else {
        emitToast('error', 'Invalid file format');
        dispatch(updateLoadingState(false));
      }
    }
  }
  function plotGeojsonData(data: GeoJsonObj, fileName: string) {
    const newLayer = openLayerMap.createNewUserLayer(
      fileName,
      'GeometryCollection'
    );
    newLayer.isCompleted = true;
    newLayer.editable = false;
    try {
      openLayerMap.addImportedGeojsonData(
        data,
        newLayer.layerId,
        newLayer.style
      );
      openLayerMap.zoomToFit(newLayer.layerId);
      dispatch(addCanvasLayer(newLayer));
    } catch (error) {
      emitToast('error', 'Invalid file format');
      dispatch(updateLoadingState(false));
    }
  }
  return (
    <>
      <TooltipWrapper content="Import json/geojson file">
        <button
          className="header_button"
          data-intro="import_as"
          onClick={handleSelectFile}
        >
          <div>
            <TbFileImport size={23} />
          </div>
        </button>
      </TooltipWrapper>
      <input
        type="file"
        ref={inputRef}
        accept=".json,.geojson"
        onChange={handleFileSelection}
        className={styles.invisible_input}
      />
    </>
  );
}

export default ImportDataInput;
