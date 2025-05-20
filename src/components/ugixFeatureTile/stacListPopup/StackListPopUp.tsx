import styles from './styles.module.css';
import { Resource } from '../../../types/resource';
import { StacAsset, StacItem } from '../../../types/UgixLayers';

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
  onPreviewStac,
  setPreviewImageUrl,
  fetchNextPage,
  fetchPreviousPage,
  hasMoreStacItems,
  isFirstPage,
  paginationHistory,
}: {
  resource: Resource;
  stacItems: any[];
  onClose: () => void;
  onPreviewStac: (item: any) => void;
  onPlotStac: (item: any, bbox: any) => void;
  setPreviewImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  hasMoreStacItems: boolean;
  isFirstPage: boolean;
  paginationHistory: string[];
}) {
  const handlePreviewStac = (item: StacItem) => {
    onPreviewStac(item);
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

  // Calculate current page number (1-based for display)
  const currentPage = paginationHistory.length;

  return (
    <div className={styles.popup_overlay}>
      <div className={styles.popup_container}>
        <div className={styles.popup_header}>
          <h3>{resource.label}</h3>
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
          {/* <div className={styles.page_info}>
            Page {currentPage} (Showing {stacItems.length} items)
          </div> */}
          <table className={styles.stac_table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>ID</th>
                <th>Preview</th>
                <th>Plot</th>
              </tr>
            </thead>
            <tbody className={styles.body_table_data} >
              {stacItems.map((item: any, index: number) => (
                <tr key={`${item.id}-${index}`} className={styles.stac_table_row}>
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
                      Preview Stac
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
          <div className={styles.pagination_container}>
            <button
              className={styles.extra_button}
              onClick={fetchPreviousPage}
              disabled={isFirstPage}
            >
              Previous
            </button>
            <button
              className={styles.extra_button}
              onClick={fetchNextPage}
              disabled={!hasMoreStacItems}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StacItemsPopup;