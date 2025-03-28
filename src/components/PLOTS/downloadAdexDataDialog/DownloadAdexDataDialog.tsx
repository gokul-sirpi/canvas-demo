import { MdDownloadForOffline } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import styles from './styles.module.css';
import TooltipWrapper from '../../tooltipWrapper/TooltipWrapper';
import { plotResource } from '../../../types/plotResource';
import { getAccessToken } from '../../../lib/getAllUgixFeatures';
import axios from 'axios';
import { emitToast } from '../../../lib/toastEmitter';
import getResourceServerRegURL from '../../../utils/ResourceServerRegURL';

export default function DownloadAdexDataDialog({
  name,
  item,
}: {
  name: string;
  item: plotResource;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterDates, setFilterDates] = useState({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
  });
  const [isDateRangeDialogOpen, setIsDateRangeDialogOpen] = useState(false);

  const resetDialogState = () => {
    setIsDialogOpen(false);
    setIsDateRangeDialogOpen(false);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setFilterDates((prev) => ({
      ...prev,
      startDate: newStartDate,
      endDate: newStartDate > prev.endDate ? newStartDate : prev.endDate,
    }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setFilterDates((prev) => ({
      ...prev,
      endDate: newEndDate,
      startDate: newEndDate < prev.startDate ? newEndDate : prev.startDate,
    }));
  };

  async function downloadData() {
    const { error, token } = await getAccessToken(item);
    if (error) {
      emitToast('error', 'Unable to get access token');
      return;
    }

    const serverUrl = await getResourceServerRegURL(item);

    try {
      const res = await axios.get(
        `https://${serverUrl}/ngsi-ld/v1/async/search?id=${item.id}&timerel=during&time=${filterDates.startDate}&endtime=${filterDates.endDate}`,
        { headers: { Token: `${token}` } }
      );

      if (res.status === 201) {
        const searchId = res.data.result[0].searchId;
        console.log(`Search ID: ${searchId}`);

        const getDownloadUrl = async () => {
          try {
            const statusRes = await axios.get(
              `https://${serverUrl}/ngsi-ld/v1/async/status?searchId=${searchId}`,
              { headers: { Token: `${token}` } }
            );

            const { status, fileDownloadUrl } = statusRes.data.result;

            if (status === 'COMPLETE') {
              console.log(`Download URL: ${fileDownloadUrl}`);
              window.open(fileDownloadUrl, '_blank');
            } else {
              console.log(`Status: ${status}. Retrying in 5 seconds...`);
              setTimeout(getDownloadUrl, 5000);
            }
          } catch (err) {
            emitToast('error', 'Failed to fetch download status');
          }
        };

        getDownloadUrl();
      }
    } catch (err) {
      emitToast('error', 'Failed to initiate download');
    }
  }

  const downloadToday = () => {
    setIsDateRangeDialogOpen(false);
    setFilterDates({
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    });
    downloadData();
  };

  const downloadYesterday = () => {
    setIsDateRangeDialogOpen(false);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setFilterDates({
      startDate: yesterday.toISOString(),
      endDate: yesterday.toISOString(),
    });
    downloadData();
  };

  return (
    <div>
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Trigger asChild>
          <TooltipWrapper content="Download resource">
            <button onClick={() => setIsDialogOpen(true)}>
              <div className={styles.icon_wrapper}>
                <MdDownloadForOffline />
              </div>
            </button>
          </TooltipWrapper>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialog_overlay} />
          <Dialog.Content className={styles.dialog_content}>
            <Dialog.Title className={styles.dialog_title}>
              Download Data
              <button className={styles.close_btn} onClick={resetDialogState}>
                <div className={styles.btn_icon_container}>
                  <IoMdClose size={20} />
                </div>
              </button>
            </Dialog.Title>
            <div className={styles.dialog_body}>
              <div className={styles.dialog_description}>
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    borderBottom: '1px solid #e0e0e0',
                    fontWeight: 'inherit',
                  }}
                >
                  {name}
                </div>
              </div>
              <p style={{ marginBottom: '1rem' }}>Download criteria</p>

              <div className={styles.query_criteria}>
                <button onClick={downloadToday} className={styles.criteria_btn}>
                  Download by today
                </button>
                <button
                  onClick={downloadYesterday}
                  className={styles.criteria_btn}
                >
                  Download by yesterday
                </button>
                <button
                  onClick={() =>
                    setIsDateRangeDialogOpen(!isDateRangeDialogOpen)
                  }
                  className={styles.criteria_btn}
                >
                  Download by during
                </button>
              </div>
              {isDateRangeDialogOpen && (
                <div className={styles.date_field_container}>
                  {/* <button
                    className={styles.close_btn}
                    onClick={resetDialogState}
                  >
                    <div className={styles._date_btn_icon_container}>
                      <IoMdClose size={20} />
                    </div>
                  </button> */}
                  <div className={styles.date_container}>
                    <div className={styles.input_container}>
                      <label>Start date</label>
                      <input
                        type="date"
                        value={filterDates.startDate.split('T')[0]}
                        onChange={handleStartDateChange}
                        max={filterDates.endDate.split('T')[0]}
                        className={styles.dynamic_select}
                      />
                    </div>
                    <div className={styles.input_container}>
                      <label>End date</label>
                      <input
                        type="date"
                        value={filterDates.endDate.split('T')[0]}
                        onChange={handleEndDateChange}
                        min={filterDates.startDate.split('T')[0]}
                        className={styles.dynamic_select}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '2rem',
                    }}
                  >
                    <button
                      onClick={() => downloadData()}
                      className={styles.date_submit_button}
                    >
                      Submit
                    </button>
                    {/* <button
                      onClick={() => setIsDateRangeDialogOpen(false)}
                      className={styles.date_submit_button}
                    >
                      Close
                    </button> */}
                  </div>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
