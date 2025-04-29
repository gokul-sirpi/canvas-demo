import * as echarts from 'echarts';
import { useEffect } from 'react';
import { camelCaseToSpaceSeparated } from '../../../../utils/CamelCaseToSpaceSeparated';
import { EchatrColors } from '../../../../utils/EchartColors';
import { formatDate } from '../../../../utils/FormatDate';

function getNestedValue(obj: Object, path: string) {
  if (typeof path === 'string' && path.includes('.')) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  } else {
    return obj && obj[path]; // Direct access for flat values
  }
}

function generateLargeScaleBarChart(
  data: object[],
  xAxis: string,
  yAxis: string
) {
  let chartDom = document.getElementById('large-scale-bar-chart');
  if (!chartDom) {
    console.error('Large Scale Bar Chart DOM not found');
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

  // **Extract Unique Dates & Grades**
  let categories = [
    ...new Set(data.map((item) => formatDate(getNestedValue(item, xAxis)))),
  ];
  let productGrades = [
    ...new Set(data.map((item) => getNestedValue(item, yAxis))),
  ];

  let seriesData = productGrades.map((grade) => ({
    name: camelCaseToSpaceSeparated(grade),
    type: 'bar',
    large: true, // Optimized for large data
    data: categories.map((category) => {
      let filteredItem = data.find(
        (item) => formatDate(getNestedValue(item, xAxis)) === category
      );
      return filteredItem ? 1 : 0; // Mark presence of the grade
    }),
  }));

  let option: echarts.EChartsOption = {
    color: EchatrColors(),
    title: {
      text: 'Large Scale Bar Chart',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: productGrades.map(camelCaseToSpaceSeparated),
      bottom: 10,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 0,
      },
    },
    yAxis: {
      type: 'category',
      data: productGrades,
    },
    series: seriesData,
  };

  setTimeout(() => {
    myChart.hideLoading();
    myChart.setOption(option);
  }, 500);
}

function LargeScaleBarChart({
  dataforPlot,
  xAxis,
  yAxis,
}: {
  dataforPlot: object[];
  xAxis: string;
  yAxis: string;
}) {
  useEffect(() => {
    if (dataforPlot.length > 0) {
      setTimeout(() => {
        generateLargeScaleBarChart(dataforPlot, xAxis, yAxis);
      }, 1000);
    }
  }, [dataforPlot, xAxis, yAxis]);

  return (
    <>
      <div
        id="large-scale-bar-chart"
        style={{
          width: '95vw',
          height: '50vh',
          marginTop: '1.5rem',
        }}
      ></div>
    </>
  );
}

export default LargeScaleBarChart;
