import axios from 'axios';
import PlotsTab from '../../components/PLOTS/plotsTab/PlotsTab';
import Header from '../../layouts/header/Header';
import { plotResource } from '../../types/plotResource';
import { UserProfile } from '../../types/UserProfile';
import styles from './styles.module.css';
import { Fragment, useEffect, useState } from 'react';
import envurls from '../../utils/config';
import FilterInputs from '../../components/PLOTS/filterInputs/FilterInputs';
import { emitToast } from '../../lib/toastEmitter';
import { getAccessToken } from '../../lib/getAllUgixFeatures';
import { updateLoadingState } from '../../context/loading/LoaderSlice';
import { useDispatch } from 'react-redux';
import { getDateRange } from '../../utils/getDateRange';
import { progressiveFetch } from '../../utils/Plots/progressiveFetch';
import ChartRenderer from '../../layouts/Plots/ChartRenderer';

export default function Plots({
  changePage,
  profileData,
  currentPage,
}: {
  changePage: Function;
  profileData?: UserProfile | undefined;
  currentPage: string;
}) {
  const dispatch = useDispatch();
  const { startDate, endDate } = getDateRange();
  const [tabs, setTabs] = useState<plotResource[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [dataforPlot, setDataForPlot] = useState<Object[]>([]);
  const [filteredDataForPlot, setFilteredDataForPlot] = useState<Object[]>([]);
  const [filterDates, SetFilterDates] = useState({
    startDate: startDate,
    endDate: endDate,
  });
  const [allResources, setAllResources] = useState<plotResource[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeResource, setActiveResource] = useState<plotResource | null>(
    null
  );
  const [noAccess, setNoAccess] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<string | null>(
    'plotType_1'
  );
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  const toggleDialog = () => setIsDialogOpen((prev) => !prev);

  useEffect(() => {
    getAllResourceData();
  }, []);

  // gets all the resource data
  async function getAllResourceData() {
    try {
      const response = await axios.get(
        `${envurls.ugixServer}cat/v1/search?property=[plot]&value=[[true]]`
      );
      if (response.status === 200 && response.data.results.length > 0) {
        const sortedData = sortResources(response.data.results);
        setAllResources(sortedData);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      emitToast('error', 'Failed to fetch resources');
    }
  }

  function showNoAccessText() {
    setNoAccess(true);
    setTimeout(() => {
      setNoAccess(false);
    }, 5000);
  }

  function sortResources(allResrources: plotResource[]) {
    return allResrources.sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      } else if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
  }

  async function getResourceServerRegURL(resource: plotResource) {
    try {
      const regURL = await axios.get(
        `${envurls.ugixServer}cat/v1/item?id=${resource.resourceServer}`
      );
      // console.log(regURL);
      return regURL;
    } catch (error) {
      emitToast('error', 'Failed to get server ID');
      console.log(error);
    }
  }

  async function handleAdd(resource: plotResource) {
    setActiveResource(resource);
    setActiveChartTab(`plotType_1`);
    const dataAccumulator: Object[] = [];
    const ServerRegURL = await getResourceServerRegURL(resource);
    try {
      if (
        ServerRegURL?.status === 200 &&
        ServerRegURL.data.results[0].resourceServerRegURL
      ) {
        const regBaseUrl = ServerRegURL.data.results[0].resourceServerRegURL;
        const baseUrl = `https://${regBaseUrl}/ngsi-ld/v1/temporal/entities?id=${encodeURIComponent(
          resource.id
        )}`;
        dispatch(updateLoadingState(true));
        await progressiveFetch(
          baseUrl,
          resource,
          new Date(filterDates.startDate),
          new Date(filterDates.endDate),
          30,
          dataAccumulator,
          showNoAccessText,
          setIsDialogOpen,
          regBaseUrl
        );

        plotData(dataAccumulator);
        addTab(resource);
      }
      // setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(updateLoadingState(false));
    }
  }

  // console.log(activeResource);

  useEffect(() => {
    if (!isTabSwitching && activeResource) {
      handleOnFilterChange();
    }
  }, [filterDates.startDate, filterDates.endDate]);

  async function handleOnFilterChange() {
    if (activeResource) {
      const ServerRegURL = await getResourceServerRegURL(activeResource);

      try {
        if (
          ServerRegURL?.status === 200 &&
          ServerRegURL.data.results[0].resourceServerRegURL
        ) {
          dispatch(updateLoadingState(true));
          const regBaseUrl = ServerRegURL.data.results[0].resourceServerRegURL;
          const { error, token } = await getAccessToken(activeResource);
          if (error) {
            emitToast('error', `Unable to get access token`);
            throw new Error(`no-access: ${error}`);
          }
          if (!token) {
            throw new Error('Unable to get access token');
          }
          let url = `https://${regBaseUrl}/ngsi-ld/v1/temporal/entities?id=${encodeURIComponent(activeResource.id)}&timerel=during&time=${encodeURIComponent(filterDates.startDate)}&endtime=${encodeURIComponent(filterDates.endDate)}`;
          const res = await axios.get(url, { headers: { token } });

          if (res.status === 200 && res.data.results) {
            plotData(res.data.results);
          } else if (res.status === 204) {
            plotData([]);
            emitToast('info', 'No content available');
          }
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 413) {
            emitToast(
              'error',
              `${`A large amount of data was found. Please try changing the date range.`}`
            );
          } else {
            emitToast(
              'error',
              `A large amount of data was found. Please try changing the date range.`
            );
            console.log(error);
          }
        } else {
          emitToast('error', 'No access to data');
          console.log(error);
        }
      } finally {
        dispatch(updateLoadingState(false));
      }
    }
  }

  async function onTabSwitching(resource: plotResource) {
    setIsTabSwitching(true);
    if (activeResource) {
      SetFilterDates({ startDate, endDate });
      setActiveChartTab(`plotType_1`);
      const dataAccumulator: Object[] = [];

      const ServerRegURL = await getResourceServerRegURL(resource);

      try {
        if (
          ServerRegURL?.status === 200 &&
          ServerRegURL.data.results[0].resourceServerRegURL
        ) {
          const regBaseUrl = ServerRegURL.data.results[0].resourceServerRegURL;
          const baseUrl = `https://${regBaseUrl}/ngsi-ld/v1/temporal/entities?id=${encodeURIComponent(
            resource.id
          )}`;

          dispatch(updateLoadingState(true));
          await progressiveFetch(
            baseUrl,
            resource,
            new Date(filterDates.startDate),
            new Date(filterDates.endDate),
            30,
            dataAccumulator,
            showNoAccessText
          );

          plotData(dataAccumulator);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsTabSwitching(false);
        dispatch(updateLoadingState(false));
      }
    }
  }

  const addTab = (newTab: plotResource) => {
    const uniqueResourceId = `${newTab.id}_${Date.now()}`;

    setTabs((prevTabs) => [
      ...prevTabs,
      { ...newTab, uniqueResourceId: uniqueResourceId },
    ]);
    setActiveTab(uniqueResourceId);
  };

  const removeTab = (tabValue: string) => {
    const filteredTabs = tabs.filter(
      (tab) => tab.uniqueResourceId !== tabValue
    );
    setTabs(filteredTabs);
    if (activeTab === tabValue && filteredTabs.length > 0) {
      const neighourId = filteredTabs[filteredTabs.length - 1];
      onTabSwitching(neighourId);
      setActiveTab(neighourId.uniqueResourceId);
    } else if (filteredTabs.length === 0) {
      setActiveTab(null);
    }
  };

  // get data returned for the selected resource which is array of initial data
  const plotData = (data: Object[]) => {
    setDataForPlot(data);
    setFilteredDataForPlot(data);
  };

  // array of displayed resources
  const plotTypes =
    (tabs.length > 0 && tabs.map((reso) => reso).map((item) => item)) || [];
  // console.log(plotTypes, filterDates.startDate, dataforPlot, 'plot types');

  return (
    <div className={styles.container}>
      <Header
        profileData={profileData}
        changePage={changePage}
        currentPage={currentPage}
        resourceList={[]}
      />
      <div className={styles.tabContianer}>
        <div>
          <PlotsTab
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            removeTab={removeTab}
            allResources={allResources}
            isOpen={isDialogOpen}
            toggleDialog={toggleDialog}
            onAddResource={handleAdd}
            onTabSwitching={onTabSwitching}
            setAllResources={setAllResources}
            noAccess={noAccess}
          />

          <div className={styles.tab_content}>
            {tabs.length > 0 && activeTab !== null ? (
              <>
                <div className={styles.title_container}>
                  <h3 className={styles.chart_title}>
                    {' '}
                    {
                      tabs.find((tab) => tab.uniqueResourceId === activeTab)
                        ?.label
                    }
                  </h3>{' '}
                </div>

                {plotTypes.map((item, ind) => {
                  if (item.uniqueResourceId === activeTab) {
                    const dynamicValues = item.plotSchema[0].dynamic || [];
                    return (
                      <Fragment key={ind}>
                        <FilterInputs
                          dynamicValues={dynamicValues}
                          filterDates={filterDates}
                          SetFilterDates={SetFilterDates}
                          dataforPlot={dataforPlot}
                          setDataForPlot={setDataForPlot}
                          setFilteredDataForPlot={setFilteredDataForPlot}
                          // allResources={tabs}
                          // activeResource={activeResource}
                        />
                      </Fragment>
                    );
                  }
                })}
                <div>
                  {plotTypes.map((item, ind) => {
                    if (item.uniqueResourceId === activeTab) {
                      return (
                        <div
                          key={item.id + ind}
                          className={styles.chart_tab_container}
                        >
                          {item.plotSchema.map((_, index) => {
                            const plotKey = `plotType_${index + 1}`;
                            return (
                              <button
                                key={plotKey}
                                className={`${styles.chart_tab} ${
                                  activeChartTab === plotKey
                                    ? styles.active_chart_tab
                                    : ''
                                }`}
                                onClick={() => setActiveChartTab(plotKey)}
                              >
                                Plot {index + 1}
                              </button>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                {/* charts */}
                {plotTypes.map((item) =>
                  item.uniqueResourceId === activeTab &&
                  item.plotSchema.length > 0
                    ? item.plotSchema.map((plotItem, plotIndex) => {
                        const plotKey = `plotType_${plotIndex + 1}`;
                        if (activeChartTab === plotKey) {
                          const xAxis = plotItem.xAxis;
                          const yAxis = plotItem.yAxis;
                          return (
                            <>
                              {dataforPlot.length === 0 ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    height: '50vh',
                                    alignItems: 'center',
                                  }}
                                >
                                  <span style={{ color: 'red' }}>
                                    No content is available for the selected
                                    date range. Please try changing the date
                                    range above.
                                  </span>
                                </div>
                              ) : (
                                <ChartRenderer
                                  key={plotIndex}
                                  // @ts-ignore
                                  plotType={plotItem[plotKey]}
                                  data={filteredDataForPlot}
                                  xAxis={xAxis}
                                  yAxis={yAxis}
                                />
                              )}
                            </>
                          );
                        }
                        return null;
                      })
                    : null
                )}
              </>
            ) : (
              <div className={styles.no_tabs}>
                Browse datasets from ADeX catalogue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
