import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

function generateDrillDownChart(
  dataset: any[],
  xLevels: string[],
  yMetric: string,
  currentLevel: number,
  selectedParents: Record<number, string>,
  chartRef: React.RefObject<HTMLDivElement>,
  setCurrentLevel: (level: number) => void,
  setSelectedParents: (parents: Record<number, string>) => void
) {
  const chartDom = chartRef.current;
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  myChart.showLoading('default', {
    text: '',
    color: '#05aa99',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    zlevel: 0,
    fontSize: 12,
    showSpinner: true,
    spinnerRadius: 30,
    lineWidth: 5,
  });

  // Validate inputs
  if (!dataset.length || !xLevels.length || currentLevel >= xLevels.length) {
    console.warn('Invalid inputs:', { datasetLength: dataset.length, xLevels, currentLevel });
    myChart.hideLoading();
    myChart.setOption({
      title: { text: 'No Data Available' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    });
    return () => myChart.dispose();
  }

  // Filter dataset based on selected parent values
  let filteredData = dataset;
  for (let i = 0; i < currentLevel; i++) {
    const parentField = xLevels[i];
    const parentValue = selectedParents[i];
    if (parentValue && parentValue !== 'Unknown') {
      filteredData = filteredData.filter((item) => {
        const itemValue = item[parentField] ? String(item[parentField]).trim() : '';
        const match = itemValue === parentValue.trim();
        if (!match) {
          console.log(`Filter mismatch at ${parentField}:`, { itemValue, parentValue });
        }
        return match;
      });
    }
  }
  console.log('Filtered data length:', filteredData.length, 'Sample:', filteredData.slice(0, 2));

  // Prepare data for the current level
  const currentField = xLevels[currentLevel];
  const childField = currentLevel < xLevels.length - 1 ? xLevels[currentLevel + 1] : null;
  const aggregated = new Map<string, number>();
  filteredData.forEach((item: any, index: number) => {
    let key = item[currentField];
    if (key == null || key.toString().trim() === '') {
      key = 'Unknown';
      console.log(`Invalid key at index ${index} for ${currentField}:`, item[currentField]);
    } else {
      key = key.toString().trim();
    }
    const value = Number(item[yMetric]) || 0;
    aggregated.set(key, (aggregated.get(key) || 0) + value);
  });

  // Sort data by value in descending order
  const data = Array.from(aggregated.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => [
      key,
      value,
      currentField + 's',
      childField ? childField + 's' : '',
    ]);
  console.log('Aggregated data:', data);

  // Handle empty data
  if (!filteredData.length || !data.length) {
    console.warn('No data to display:', { filteredDataLength: filteredData.length, dataLength: data.length });
    myChart.hideLoading();
    myChart.setOption({
      title: { text: 'No Data Available' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    });
    return () => myChart.dispose();
  }

  const option: echarts.EChartsOption = {
    id: currentField + 's',
    animationDuration: 2500,
    title: {
      text: 'Drill Down Chart',
    },
    toolbox: {
      feature: {
        restore: {},
        saveAsImage: {},
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        show: true,
        fontSize: 12,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: {
      type: 'bar',
      dimensions: ['x', 'y', 'groupId', 'childGroupId'],
      encode: {
        x: 'x',
        y: 'y',
        itemGroupId: 'groupId',
        itemChildGroupId: 'childGroupId',
      },
      data,
      universalTransition: {
        enabled: true,
        divideShape: 'clone',
      },
      barWidth: '70%',
    },
    graphic: currentLevel > 0 ? [{
      type: 'text',
      left: 50,
      top: 40,
      style: {
        text: 'Back',
        fontSize: 18,
        fill: 'grey',
      },
      onclick: function () {
        console.log('Back button clicked, current level:', currentLevel);
        setCurrentLevel(currentLevel - 1);
        setSelectedParents((prev) => {
          const newParents = { ...prev };
          delete newParents[currentLevel - 1];
          return newParents;
        });
      },
    }] : [],
  };

  myChart.on('click', 'series', (params: any) => {
    console.log('Series click params:', params);
    const dataItem = params.data;
    if (dataItem && dataItem[3] && currentLevel < xLevels.length - 1) {
      const childGroupId = dataItem[3];
      const selectedValue = dataItem[0] === 'Unknown' ? '' : String(dataItem[0]).trim();
      console.log('Drilling down to', childGroupId, 'value:', selectedValue);
      setSelectedParents((prev) => ({
        ...prev,
        [currentLevel]: selectedValue,
      }));
      setCurrentLevel(currentLevel + 1);
    } else {
      console.warn('Drill-down skipped:', { dataItem, childGroupId: dataItem?.[3], currentLevel });
    }
  });

  setTimeout(() => {
    myChart.hideLoading();
    myChart.setOption(option, {
      notMerge: false,
      lazyUpdate: false,
    });
  }, 1000);

  return () => myChart.dispose();
}

function DrillDownChart({
  dataset,
  xLevels,
  yMetric,
  initialOptionId,
}: {
  dataset: any[];
  xLevels: string[];
  yMetric: string;
  initialOptionId: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedParents, setSelectedParents] = useState<Record<number, string>>({});

  useEffect(() => {
    if (dataset.length > 0 && chartRef.current && xLevels.length > 0) {
      return generateDrillDownChart(
        dataset,
        xLevels,
        yMetric,
        currentLevel,
        selectedParents,
        chartRef,
        setCurrentLevel,
        setSelectedParents
      );
    }
  }, [dataset, xLevels, yMetric, currentLevel, selectedParents]);

  return (
    <div
      id="drill-down-chart"
      ref={chartRef}
      style={{
        width: '95vw',
        height: '50vh',
        marginTop: '1.5rem',
        overflow: 'auto',
      }}
    ></div>
  );
}

export default DrillDownChart;