import styles from './styles.module.css';
import { Resource } from '../../types/resource';
import { useState } from 'react';

interface Props {
  resource: Resource;
  stacItems: any[];
  onClose: () => void;
  onPreviewStac: (item: any) => void;
  onPlotStac: (item: any) => void;
  /** Parent callback that actually hits `/items?datetime=start/end` */
  handleStacDateDateFilterChange: (startISO: string, endISO: string) => void;
}

function StacItemsPopup({
  resource,
  stacItems,
  onClose,
  onPreviewStac,
  onPlotStac,
  handleStacDateDateFilterChange,
}: Props) {
  /* ───────────────────────────────────────────────
     Local state for the two <input type="date">s
     ─────────────────────────────────────────────── */
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  /** Convert `yyyy-mm-dd` → the full ISO string STAC expects.
      endOfDay=true gives 23:59:59 so the range is inclusive. */
  const toISO = (d: string, endOfDay = false) =>
    d ? `${d}T${endOfDay ? '23:59:59' : '00:00:00'}.000Z` : '';

  /** Called when the user presses “Apply filter”. */
  const submitDateFilter = () => {
    if (!fromDate || !toDate) return;
    handleStacDateDateFilterChange(toISO(fromDate), toISO(toDate, true));
  };

  /* ──────────────────────────────── markup ──────────────────────────────── */
  return (
    <div className={styles.popup_overlay}>
      <div className={styles.popup_container}>
        {/* ——— Header ——— */}
        <div className={styles.popup_header}>
          <h3>
            {resource.label}{' '}
            <span style={{ fontWeight: 400 }}>— STAC Items</span>
          </h3>
          <button className={styles.popup_close_btn} onClick={onClose}>
            ×
          </button>
        </div>

        {/* ——— Date‑filter UI ——— */}
        <div className={styles.date_filter_section}>
          <h3 className={styles.date_filter_title}>Filter by date</h3>
          <div className={styles.date_filter_inputs}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={styles.date_input}
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={styles.date_input}
            />
            {/* Submit button – API hits only on click */}
            <button
              className={styles.extra_button}
              disabled={!fromDate || !toDate}
              onClick={submitDateFilter}
            >
              Apply filter
            </button>
          </div>
        </div>

        {/* ——— STAC list ——— */}
        <div className={styles.popup_content}>
          <table className={styles.stac_table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Preview</th>
                <th>Plot</th>
              </tr>
            </thead>
            <tbody>
              {stacItems.map((item, idx) => (
                <tr key={idx} className={styles.stac_table_row}>
                  <td className={styles.stac_table_date}>
                    {item?.properties?.datetime ?? '—'}
                  </td>
                  <td className={styles.stac_table_id}>{item?.id}</td>
                  <td className={styles.stac_table_action}>
                    <button
                      className={styles.extra_button}
                      onClick={() => onPreviewStac(item)}
                    >
                      Preview
                    </button>
                  </td>
                  <td className={styles.stac_table_action}>
                    <button
                      className={styles.extra_button}
                      onClick={() => onPlotStac(item)}
                    >
                      Plot
                    </button>
                  </td>
                </tr>
              ))}
              {stacItems.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: 'center', padding: '1rem' }}
                  >
                    No items for selected range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ——— Optional paging (placeholder) ——— */}
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'row-reverse',
            gap: '1rem',
          }}
        >
          <button className={styles.extra_button}>Next</button>
          <button className={styles.extra_button}>Prev</button>
        </div>
      </div>
    </div>
  );
}

export default StacItemsPopup;
