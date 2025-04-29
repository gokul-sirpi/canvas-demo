import * as echarts from 'echarts';
import { useEffect } from 'react';
import { camelCaseToSpaceSeparated } from '../../../../utils/CamelCaseToSpaceSeparated';
import { EchatrColors } from '../../../../utils/EchartColors';

function getNestedValue(obj: Object, path: string) {
  // Check if path is a single string or a nested path
  if (typeof path === 'string' && path.includes('.')) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  } else {
    return obj && obj[path]; // Direct access for flat values
  }
}

function generateStackedBarChart(
  data: object[],
  xAxis: string,
  yAxis: string[]
) {
  let chartDom = document.getElementById('stacked-bar-chart');
  if (!chartDom) {
    console.error('Stacked Bar Chart DOM not found');
    return;
  }

  echarts.dispose(chartDom); // Prevent duplicate charts
  let myChart = echarts.init(chartDom);

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

  let categories = [
    ...new Set(data.map((item) => getNestedValue(item, xAxis))),
  ];

  let seriesData = yAxis.map((key) => ({
    name: camelCaseToSpaceSeparated(key),
    type: 'bar',
    stack: 'total',
    data: categories.map((category) => {
      let filteredItem = data.find(
        (item) => getNestedValue(item, xAxis) === category
      );
      return filteredItem ? getNestedValue(filteredItem, key) || 0 : 0;
    }),
  }));

  let option: echarts.EChartsOption = {
    color: EchatrColors(),
    title: {
      text: 'Stacked Bar Chart',
      //   left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: yAxis.map(camelCaseToSpaceSeparated),
      top: 10,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 0, // Rotate for better readability
      },
    },
    yAxis: {
      type: 'value',
    },
    series: seriesData,
  };

  setTimeout(() => {
    myChart.hideLoading();
    myChart.setOption(option);
  }, 500);
}

function StackedBarChart({
  dataforPlot,
  xAxis,
  yAxis,
}: {
  dataforPlot: object[];
  xAxis: string;
  yAxis: string[];
}) {
  useEffect(() => {
    if (dataforPlot.length > 0) {
      setTimeout(() => {
        generateStackedBarChart(dataforPlot, xAxis, yAxis);
      }, 1000);
    }
  }, [dataforPlot, xAxis, yAxis]);

  return (
    <>
      <div
        id="stacked-bar-chart"
        style={{
          width: '95vw',
          height: '50vh',
          marginTop: '1.5rem',
        }}
      ></div>
    </>
  );
}

export default StackedBarChart;
