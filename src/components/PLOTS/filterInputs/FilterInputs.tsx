import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { camelCaseToSpaceSeparated } from '../../../utils/CamelCaseToSpaceSeparated';
import { useDispatch } from 'react-redux';
import { updateLoadingState } from '../../../context/loading/LoaderSlice';
import { canDrillDown } from '../../../utils/drill-down-analyzer';
import { emitToast } from '../../../lib/toastEmitter';

export default function FilterInputs({
  dynamicValues,
  SetFilterDates,
  filterDates,
  dataforPlot,
  setFilteredDataForPlot,
  onFilterChange,
  onDrillDownConfirm,
}: {
  dynamicValues: string[];
  SetFilterDates: React.Dispatch<
    React.SetStateAction<{
      startDate: string;
      endDate: string;
    }>
  >;
  filterDates: {
    startDate: string;
    endDate: string;
  };
  dataforPlot: Object[];
  setFilteredDataForPlot: React.Dispatch<React.SetStateAction<Object[]>>;
  onFilterChange: (startDate: string, endDate: string) => void;
  onDrillDownConfirm: (xLevels: string[], yMetric: string) => void;
}) {
  const dispatch = useDispatch();

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [filteredOptions, setFilteredOptions] = useState<Record<string, string[]>>({});
  const [hasShownAlert, setHasShownAlert] = useState<string>('');
  const [drillDownResult, setDrillDownResult] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedXLevels, setSelectedXLevels] = useState<string[]>([]);
  const [selectedYMetric, setSelectedYMetric] = useState<string>('');

  // Helper function to format date to the desired format
  const formatToCustomISOString = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace('Z', '+00:00');
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatToCustomISOString(event.target.value);
    SetFilterDates((prev) => ({
      ...prev,
      startDate: formattedDate,
    }));
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatToCustomISOString(event.target.value);
    SetFilterDates((prev) => ({
      ...prev,
      endDate: formattedDate,
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const updateFilteredOptions = (currentData: Object[]) => {
    dispatch(updateLoadingState(true));
    const newOptions: Record<string, string[]> = {};
    dynamicValues.forEach((key) => {
      newOptions[key] = Array.from(
        // @ts-ignore
        new Set(currentData.map((item) => item[key]))
      );
    });
    setFilteredOptions(newOptions);
    dispatch(updateLoadingState(false));
  };

  const handleSelectChange = (key: string, value: string) => {
    const updatedSelectedValues = { ...selectedValues, [key]: value };
    setSelectedValues(updatedSelectedValues);
    const filteredData = dataforPlot.filter((item) =>
      Object.entries(updatedSelectedValues).every(
        ([selectedKey, selectedValue]) =>
          // @ts-ignore
          selectedValue === '' || item[selectedKey] === selectedValue
      )
    );
    updateFilteredOptions(filteredData as []);
    setFilteredDataForPlot(filteredData as []);
    dispatch(updateLoadingState(false));
  };

  useEffect(() => {
    if (dataforPlot && dataforPlot.length > 0) {
      const dataKey = JSON.stringify(dataforPlot.slice(0, 1));
      if (hasShownAlert !== dataKey) {
        const result = canDrillDown(dataforPlot);
        setDrillDownResult(result);
        const message = result.drillDownPossible
          ? 'YES ✅ This data is drill down capable, you can configure this plot using Configure Drill-Down Button Above'
          : `Drill-Down Capable: NO ❌ (Reason: ${result.reason})`;
        emitToast(result.drillDownPossible ? 'info' : 'error', message);
        // setHasShownAlert(dataKey);
      }
    } else {
      // setDrillDownResult(null);
    }
  }, [dataforPlot]);

  useEffect(() => {
    updateFilteredOptions(dataforPlot);
  }, [dataforPlot]);

  const handleXLevelChange = (fieldName: string) => {
    setSelectedXLevels((prev) =>
      prev.includes(fieldName)
        ? prev.filter((f) => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const handleYMetricChange = (fieldName: string) => {
    setSelectedYMetric(fieldName);
  };

  const handleConfirm = () => {
    if (selectedXLevels.length > 0 && selectedYMetric) {
      onDrillDownConfirm(selectedXLevels, selectedYMetric);
      console.log('Selected X-Axis Levels:', selectedXLevels);
      console.log('Selected Y-Axis Metric:', selectedYMetric);
    }
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setSelectedXLevels([]);
    setSelectedYMetric('');
    setIsDialogOpen(false);
  };

  console.log("drilldownresult variable", drillDownResult);

  return (
    <div className={styles.container}>
      <div className={styles.date_field_container}>
        <div className={styles.date_container}>
          <div className={styles.input_container}>
            <label>Start date</label>
            <input
              className={styles.dynamic_select}
              type="date"
              defaultValue={formatDate(filterDates.startDate)}
              onChange={handleStartDateChange}
              max={formatDate(filterDates.endDate)}
            />
          </div>
          <div className={styles.input_container}>
            <label>End date</label>
            <input
              className={styles.dynamic_select}
              type="date"
              defaultValue={formatDate(filterDates.endDate)}
              onChange={handleEndDateChange}
              min={formatDate(filterDates.startDate)}
            />
          </div>
        </div>
        <button
          onClick={() => onFilterChange(filterDates.startDate, filterDates.endDate)}
          className={styles.date_submit_button}
        >
          Submit
        </button>
      </div>

      <div className={styles.dynamic_container}>
        {dynamicValues.map((key) => (
          <div key={key} className={styles.input_container}>
            <label>{camelCaseToSpaceSeparated(key)}</label>
            <select
              className={styles.dynamic_select}
              value={selectedValues[key] || ''}
              onChange={(e) => handleSelectChange(key, e.target.value)}
            >
              <option value="" onClick={() => updateFilteredOptions(dataforPlot)}>
                All
              </option>
              {filteredOptions[key]?.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <button
            onClick={() => {
              setFilteredDataForPlot(dataforPlot);
              setSelectedValues({});
              updateFilteredOptions(dataforPlot);
            }}
            className={styles.reset_button}
          >
            Reset now
          </button>
        </div>
      </div>

      <div className={styles.drill_down_container}>
        <button
          className={styles.drill_down_button}
          onClick={() => setIsDialogOpen(true)}
          disabled={!drillDownResult?.drillDownPossible}
          title={
            !drillDownResult?.drillDownPossible
              ? drillDownResult?.reason || 'Drill-down not possible'
              : 'Configure drill-down settings'
          }
        >
          Configure Drill-Down
        </button>
      </div>

      {isDialogOpen && (
        <div className={styles.dialog_overlay}>
          <div className={styles.dialog}>
            <h2>Drill-Down Configuration</h2>
            <div className={styles.dialog_content}>
              <h3>X-Axis Drill-Down Levels</h3>
              <p>Select one or more levels:</p>
              {drillDownResult?.drillDownLevels?.map((level: any) => (
                <label key={level.fieldName} className={styles.checkbox_label}>
                  <input
                    type="checkbox"
                    checked={selectedXLevels.includes(level.fieldName)}
                    onChange={() => handleXLevelChange(level.fieldName)}
                  />
                  {level.displayName} ({level.uniqueValues} unique values)
                </label>
              ))}

              <h3>Y-Axis Metric</h3>
              <p>Select one metric:</p>
              {drillDownResult?.bestMetrics?.map((metric: any) => (
                <label key={metric.fieldName} className={styles.radio_label}>
                  <input
                    type="radio"
                    name="yMetric"
                    value={metric.fieldName}
                    checked={selectedYMetric === metric.fieldName}
                    onChange={() => handleYMetricChange(metric.fieldName)}
                  />
                  {metric.displayName}
                </label>
              ))}
            </div>
            <div className={styles.dialog_actions}>
              <button onClick={handleCancel} className={styles.cancel_button}>
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={styles.confirm_button}
                disabled={!selectedYMetric}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}