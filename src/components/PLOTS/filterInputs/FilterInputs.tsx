import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { plotResource } from '../../../types/plotResource';
import { camelCaseToSpaceSeparated } from '../../../utils/CamelCaseToSpaceSeparated';

export default function FilterInputs({
  dynamicValues,
  SetFilterDates,
  filterDates,
  dataforPlot,
  setFilteredDataForPlot,
  allResources,
  activeResource,
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
  setDataForPlot: React.Dispatch<React.SetStateAction<Object[]>>;
  setFilteredDataForPlot: React.Dispatch<React.SetStateAction<Object[]>>;
  allResources: plotResource[];
  activeResource: plotResource | null;
}) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    {}
  );
  const [filteredOptions, setFilteredOptions] = useState<
    Record<string, string[]>
  >({});

  // Helper function to format date to the desired format
  const formatToCustomISOString = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace('Z', '+00:00');
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  // Function to update options for the dropdown based on current selections
  const updateFilteredOptions = (currentData: Object[]) => {
    const newOptions: Record<string, string[]> = {};
    dynamicValues.forEach((key) => {
      newOptions[key] = Array.from(
        new Set(currentData.map((item) => item[key]))
      );
    });
    setFilteredOptions(newOptions);
  };

  // Handle select change for any dropdown
  const handleSelectChange = (key: string, value: string) => {
    const updatedSelectedValues = { ...selectedValues, [key]: value };
    setSelectedValues(updatedSelectedValues);
    const filteredData = dataforPlot.filter((item) =>
      Object.entries(updatedSelectedValues).every(
        ([selectedKey, selectedValue]) =>
          selectedValue === '' || item[selectedKey] === selectedValue
      )
    );
    console.log(filteredData, 'fildata');

    updateFilteredOptions(filteredData as []);
    setFilteredDataForPlot(filteredData as []);
  };

  useEffect(() => {
    updateFilteredOptions(dataforPlot);
  }, [dataforPlot]);

  console.log(filteredOptions);

  // let datarecpKey = dataforPlot.length > 0 && dataforPlot;
  // const dataDescriptor = activeResource && activeResource.dataDescriptor;

  // console.log(datarecpKey);

  return (
    <div className={styles.container}>
      <div className={styles.date_container}>
        <div className={styles.input_container}>
          <label>Start date</label>
          <input
            className={styles.dynamic_select}
            type="date"
            defaultValue={formatDate(filterDates.startDate)}
            onChange={handleStartDateChange}
          />
        </div>
        <div className={styles.input_container}>
          <label>End date</label>
          <input
            className={styles.dynamic_select}
            type="date"
            defaultValue={formatDate(filterDates.endDate)}
            onChange={handleEndDateChange}
          />
        </div>
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
              <option
                value=""
                onClick={() => updateFilteredOptions(dataforPlot)}
              >
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

        <div className={styles.reset_button_container}>
          <button
            onClick={() => {
              setFilteredDataForPlot(dataforPlot);
              setSelectedValues({});
              updateFilteredOptions(dataforPlot);
            }}
            className={styles.reset_button}
          >
            Reset
          </button>
        </div>
      </div>

      {/* <button>Info</button> */}
    </div>
  );
}
