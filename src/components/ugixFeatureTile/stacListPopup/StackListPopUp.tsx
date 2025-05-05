import styles from './styles.module.css';
import { Resource } from '../../../types/resource';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { StacAsset, StacItem } from '../../../types/UgixLayers';

// ✅ Helper function to check for thumbnail role
const hasThumbnailAsset = (assets: any): boolean => {
  return Object.values(assets || {}).some(
    (asset: any) =>
      Array.isArray(asset.roles) && asset.roles.includes('thumbnail')
  );
};
const getOverviewAssetUrl = (assets: StacAsset): string | null => {
  const overviewAsset = Object.values(assets || {}).find(
    (asset: any) =>
      Array.isArray(asset.roles) && asset.roles.includes('overview')
  );
  return overviewAsset?.href || null;
};

function StacItemsPopup({
  resource,
  stacItems,
  onClose,
  onPlotStac,
  setPreviewImageUrl,
}: {
  resource: Resource;
  stacItems: any[];
  onClose: () => void;
  onPreviewStac: (item: any) => void;
  onPlotStac: (item: any, bbox: any) => void;
  setPreviewImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePreviewStac = (item: StacItem) => {
    setIsDialogOpen(true);
    const thumbnailAsset = Object.values(item.assets || {}).find(
      (asset: any) =>
        Array.isArray(asset.roles) && asset.roles.includes('thumbnail')
    );

    if (thumbnailAsset && thumbnailAsset.href) {
      setPreviewImageUrl(thumbnailAsset.href);
    }
  };
  const handlePlotStac = (item: StacItem) => {
    const overviewUrl = getOverviewAssetUrl(
      item.assets as unknown as StacAsset
    );

    console.log(overviewUrl);
    if (overviewUrl) {
      onPlotStac(overviewUrl, item.bbox);
    } else {
      console.warn('No overview asset found for item:', item);
    }
  };

  return (
    <div className={styles.popup_overlay}>
      <div className={styles.popup_container}>
        <div className={styles.popup_header}>
          <h3>{resource.label} </h3>
          <button className={styles.popup_close_btn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.date_filter_section}>
          <h3 className={styles.date_filter_title}>Filter Date by</h3>
          <div className={styles.date_filter_inputs}>
            <input type="date" className={styles.date_input} />
            <span>To</span>
            <input type="date" className={styles.date_input} />
          </div>
        </div>

        <div className={styles.popup_content}>
          <table className={styles.stac_table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>ID</th>
                <th>Preview</th>
                <th>Plot</th>
              </tr>
            </thead>
            <tbody>
              {stacItems.map((item: any, index: number) => (
                <tr key={index} className={styles.stac_table_row}>
                  <td className={styles.stac_table_date}>
                    {item?.properties?.datetime}
                  </td>
                  <td className={styles.stac_table_id}>{item?.id}</td>
                  <td className={styles.stac_table_action}>
                    <button
                      className={
                        !hasThumbnailAsset(item.assets)
                          ? styles.popup_close_btn
                          : styles.extra_button
                      }
                      onClick={() => handlePreviewStac(item)}
                      disabled={!hasThumbnailAsset(item.assets)}
                    >
                      Preview Stack
                    </button>
                  </td>
                  <td className={styles.stac_table_action}>
                    <button
                      className={styles.extra_button}
                      onClick={() => handlePlotStac(item)}
                    >
                      Plot Stac
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Radix Dialog for Thumbnail Preview */}
        {/* <Dialog.Root
          open={isDialogOpen}
          onOpenChange={() => setPreviewImageUrl(null)}
        >
          <Dialog.Portal>
            <Dialog.Overlay className={styles.dialog_overlay} />
            <Dialog.Content className={styles.dialog_content}>
              <Dialog.Title className={styles.dialog_title}>
                Thumbnail Preview
              </Dialog.Title>
              <img
                src={previewImageUrl || ''}
                alt="Thumbnail"
                className={styles.dialog_image}
              />
              <Dialog.Close
                onClick={() => setIsDialogOpen(false)}
                className={styles.dialog_close_btn}
              >
                Close
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root> */}
      </div>
    </div>
  );
}

export default StacItemsPopup;
