import * as echarts from 'echarts';
import { camelCaseToSpaceSeparated } from '../../../../utils/CamelCaseToSpaceSeparated';
import { EchatrColors } from '../../../../utils/EchartColors';
import { useEffect } from 'react';

function getNestedValue(obj: Object, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function generatePieChart(data: object[], xAxis: string, yAxis: string) {
  let chartDom = document.getElementById('pie-chart');
  if (!chartDom) {
    console.error('Pie chart DOM not found');
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

  // **Aggregate Data by `xAxis` (Sum `yAxis` field)**
  let aggregatedData: { [key: string]: number } = {};

  data.forEach((item) => {
    const category = getNestedValue(item, xAxis);
    const quantity = getNestedValue(item, yAxis);

    if (category in aggregatedData) {
      aggregatedData[category] += quantity;
    } else {
      aggregatedData[category] = quantity;
    }
  });

  // **Convert to ECharts Format**
  let pieData = Object.keys(aggregatedData).map((key) => ({
    name: key,
    value: aggregatedData[key],
  }));

  let option: echarts.EChartsOption = {
    color: EchatrColors(),
    title: { text: 'Pie Chart', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      left: '20',
      bottom: 10,
      formatter: (name: string) => camelCaseToSpaceSeparated(name),
    },
    series: [
      {
        name: camelCaseToSpaceSeparated(xAxis),
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  setTimeout(() => {
    myChart.hideLoading();
    myChart.setOption(option);
  }, 500);
}

function PieChart({
  dataforPlot,
  xAxis,
  yAxis,
  aggregation,
}: {
  dataforPlot: object[];
  xAxis: string;
  yAxis: string;
  aggregation?: string;
}) {
  useEffect(() => {
    if (dataforPlot.length > 0) {
      setTimeout(() => {
        generatePieChart(dataforPlot, xAxis, yAxis);
      }, 1000);
    }
  }, [dataforPlot, xAxis, yAxis]);

  return (
    <>
      <div
        id="pie-chart"
        style={{
          width: '95vw',
          height: '50vh',
          marginTop: '1.5rem',
        }}
      ></div>
    </>
  );
}

export default PieChart;
