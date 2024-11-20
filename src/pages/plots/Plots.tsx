import axios from 'axios';
import AreaChart from '../../components/PLOTS/charts/areaChart/AreaChart';
import MultiLineChart from '../../components/PLOTS/charts/multiLineChart/MultiLineChart';
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
  const [selectedPlotType, setSelectedPlotType] = useState<string | null>(
    `plotType_1`
  );

  const handlePlotTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPlotType(event.target.value);
  };

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
  // runs when user clicks add button in the dialog
  async function handleAdd(resource: plotResource) {
    setActiveResource(resource);
    setSelectedPlotType(`plotType_1`);

    console.log(resource.id);
    const { error, token } = await getAccessToken(resource);
    if (error) {
      emitToast('error', `Unable to get access token`);
      throw new Error(`no-access: ${error}`);
    }
    if (!token) {
      throw new Error('Unable to get access token');
    }
    try {
      dispatch(updateLoadingState(true));
      // let url = `${envurls.ugixOgcServer}/ngsi-ld/v1/temporal/entities?id=${encodeURIComponent(resource.id)}&timerel=during&time=${encodeURIComponent('2024-10-30T00:00:00+05:30')}&endtime=${encodeURIComponent('2024-11-14T12:15:45+05:30')}`;
      let url = `${envurls.ugixOgcServer}/ngsi-ld/v1/temporal/entities?id=${encodeURIComponent(resource.id)}&timerel=during&time=${encodeURIComponent(filterDates.startDate)}&endtime=${encodeURIComponent(filterDates.endDate)}`;
      const res = await axios.get(url, { headers: { token } });

      if (res.status === 200 && res.data.results) {
        addTab(resource);
        plotData(res.data.results);
        setIsDialogOpen(false);
      } else if (res.status === 204) {
        addTab(resource);
        plotData([]);
        setSelectedPlotType(`plotType_1`);
        emitToast('info', 'No content available');
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 413) {
          emitToast(
            'error',
            `${error.response.data.detail || `Payload too large`}`
          );
        } else {
          emitToast('error', `Payload too large`);
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
  // console.log(activeResource);

  useEffect(() => {
    if (activeResource) {
      handleOnFilterChange();
    }
  }, [filterDates.startDate, filterDates.endDate]);

  async function handleOnFilterChange() {
    if (activeResource) {
      try {
        dispatch(updateLoadingState(true));

        const { error, token } = await getAccessToken(activeResource);
        if (error) {
          emitToast('error', `Unable to get access token`);
          throw new Error(`no-access: ${error}`);
        }
        if (!token) {
          throw new Error('Unable to get access token');
        }
        let url = `${envurls.ugixOgcServer}/ngsi-ld/v1/temporal/entities?id=${encodeURIComponent(activeResource.id)}&timerel=during&time=${encodeURIComponent(filterDates.startDate)}&endtime=${encodeURIComponent(filterDates.endDate)}`;
        const res = await axios.get(url, { headers: { token } });

        if (res.status === 200 && res.data.results) {
          plotData(res.data.results);
        } else if (res.status === 204) {
          plotData([]);
          emitToast('info', 'No content available');
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 413) {
            emitToast(
              'error',
              `${error.response.data.detail || `Payload too large`}`
            );
          } else {
            emitToast('error', `Payload too large`);
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

  async function onTabSwitching(resourceId: plotResource) {
    if (activeResource) {
      try {
        setSelectedPlotType(`plotType_1`);
        dispatch(updateLoadingState(true));

        const { error, token } = await getAccessToken(resourceId);
        if (error) {
          emitToast('error', `Unable to get access token`);
          throw new Error(`no-access: ${error}`);
        }
        if (!token) {
          throw new Error('Unable to get access token');
        }
        let url = `${envurls.ugixOgcServer}/ngsi-ld/v1/temporal/entities?id=${encodeURIComponent(resourceId.id)}&timerel=during&time=${encodeURIComponent(filterDates.startDate)}&endtime=${encodeURIComponent(filterDates.endDate)}`;
        const res = await axios.get(url, { headers: { token } });

        if (res.status === 200 && res.data.results) {
          plotData(res.data.results);
        } else if (res.status === 204) {
          plotData([]);
          emitToast('info', 'No content available');
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 413) {
            emitToast(
              'error',
              `${error.response.data.detail || `Payload too large`}`
            );
          } else {
            emitToast('error', `Payload too large`);
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

  // functon adds the added plot-resource data to state named "tab" and make the tab active tab
  const addTab = (newTab: plotResource) => {
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTab(newTab.id);
  };

  // removes the resource from the "tab" state
  const removeTab = (tabValue: string) => {
    const filteredTabs = tabs.filter((tab) => tab.id !== tabValue);
    setTabs(filteredTabs);
    if (activeTab === tabValue && filteredTabs.length > 0) {
      const neighourId = filteredTabs[filteredTabs.length - 1];
      onTabSwitching(neighourId);
      setActiveTab(neighourId.id);
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
          />

          <div className={styles.tab_content}>
            {tabs.length > 0 && activeTab !== null ? (
              <>
                <div className={styles.title_container}>
                  <h3>{tabs.find((tab) => tab.id === activeTab)?.label}</h3>{' '}
                  <div className={styles.dropdownContainer}>
                    <label htmlFor="plotTypeDropdown">Select Plot: </label>
                    <select
                      id="plotTypeDropdown"
                      onChange={handlePlotTypeChange}
                      value={selectedPlotType || ''}
                      className={styles.dynamic_select}
                    >
                      <option disabled value="">
                        Select Plot{' '}
                      </option>

                      {plotTypes.map(
                        (schema) =>
                          schema.id === activeTab &&
                          schema.plotSchema.map((_, index) => (
                            <option
                              key={`${schema.id}-${index}`}
                              value={`plotType_${index + 1}`}
                            >
                              Plot {index + 1}
                            </option>
                          ))
                      )}
                    </select>
                  </div>
                </div>
                {dataforPlot.length === 0 && (
                  <span style={{ color: 'red' }}>
                    No content is available for the selected date range. Please
                    try changing the date range.
                  </span>
                )}
                {plotTypes.map((item, ind) => {
                  if (item.id === activeTab) {
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
                          allResources={tabs}
                          activeResource={activeResource}
                        />
                      </Fragment>
                    );
                  }
                })}

                {/* charts */}
                {plotTypes.map(
                  (item, ind) =>
                    item.id === activeTab &&
                    item.plotSchema.length > 0 && (
                      <Fragment key={ind}>
                        {item.plotSchema.map((plotItem, plotIndex) => {
                          const plotKey = `plotType_${plotIndex + 1}`;
                          if (
                            selectedPlotType === plotKey ||
                            !selectedPlotType
                          ) {
                            const xAxis = plotItem.xAxis;
                            const yAxis = plotItem.yAxis;

                            return (
                              <div key={plotIndex}>
                                {plotItem[plotKey] === 'multiLinePlot' && (
                                  <MultiLineChart
                                    dataforPlot={filteredDataForPlot}
                                    xAxis={xAxis}
                                    yAxis={yAxis}
                                  />
                                )}
                                {plotItem[plotKey] === 'areaChart' && (
                                  <AreaChart
                                    dataforPlot={filteredDataForPlot}
                                    xAxis={xAxis}
                                    yAxis={yAxis}
                                  />
                                )}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </Fragment>
                    )
                )}
              </>
            ) : (
              <div className={styles.no_tabs}>
                Browse ADEX to add and view tabs
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
