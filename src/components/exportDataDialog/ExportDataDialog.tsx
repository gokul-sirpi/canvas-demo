//
import styles from './styles.module.css';
import { LiaFileDownloadSolid } from 'react-icons/lia';
import openLayerMap from '../../lib/openLayers';
import { ChangeEvent, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import TooltipWrapper from '../tooltipWrapper/TooltipWrapper';

function ExportDataDialog() {
  const exportAnchor = useRef(null);
  const [exportName, setExportName] = useState('');
  const [exportType, setExportType] = useState('jpeg');
  const [dialogOpenStatus, setDialogOpenStatus] = useState(false);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setExportName(e.target.value);
  }
  function handleSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    setExportType(e.target.value);
  }
  function handleDataExport() {
    if (exportAnchor.current) {
      let name = 'Ugix_Map';
      if (exportName) {
        name = exportName;
      }
      if (exportType === 'jpeg') {
        openLayerMap.exportAsImage(exportAnchor.current, name);
      } else if (exportType === 'geojson') {
        openLayerMap.exportAsGeoJson(exportAnchor.current, name);
      }
      resetDialog();
    }
  }
  function resetDialog() {
    setExportName('');
    setExportType('jpeg');
    setDialogOpenStatus(false);
  }
  return (
    <>
      <Dialog.Root open={dialogOpenStatus}>
        <TooltipWrapper content="Export as">
          <Dialog.Trigger asChild>
            <button
              onClick={() => setDialogOpenStatus(true)}
              aria-label="Update dimensions"
            >
              <div className={styles.btn_icon_container}>
                <LiaFileDownloadSolid size={25} />
              </div>
            </button>
          </Dialog.Trigger>
        </TooltipWrapper>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialog_overlay} />
          <Dialog.Content className={styles.dialog_content}>
            <div>
              <label htmlFor="download-name">Name:</label>
              <input
                onChange={handleInputChange}
                className={styles.dialog_input}
                type="text"
                id="download-name"
                placeholder="default: Ugix_Map"
              />
            </div>
            <div>
              <label htmlFor="">Export as:</label>
              <select
                onChange={handleSelectChange}
                className={styles.dialog_select}
                name=""
                id=""
              >
                <option value="jpeg">jpeg</option>
                {/* <option value="png">png</option> */}
                <option value="geojson">geojson</option>
              </select>
            </div>
            <div className={styles.btn_container}>
              <button onClick={resetDialog} className={styles.export_btn}>
                Cancel
              </button>
              <button onClick={handleDataExport} className={styles.export_btn}>
                Export
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <a ref={exportAnchor} href=""></a>
    </>
  );
}

export default ExportDataDialog;
