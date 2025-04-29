import { useEffect } from 'react';
import * as echarts from 'echarts';

function generateGraph(data: object[], xAxis: string[], yAxis: string[]) {
  let chartDom = document.getElementById('bar-chart');
  if (!chartDom) return;

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

  let option: echarts.EChartsOption = {
    animationDuration: 2500,
    title: {
      text: 'Bar Chart',
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
        },
        restore: {},
        saveAsImage: {},
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow', // Improves bar chart usability
      },
    },
    legend: {
      data: yAxis,
    },
    dataZoom: [
      {
        type: 'slider',
        // type: 'inside',
        zoomOnMouseWheel: false,
        start: 0,
        end: 20,
      },
      {
        start: 0,
        end: 20,
      },
    ],
    xAxis: {
      type: 'category',
      data: data.map((item) => item[xAxis]), // Extracting xAxis values
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: yAxis.map((key) => ({
      name: key,
      type: 'bar',
      barWidth: '70%',
      data: data.map((item) => item[key]), // Extracting yAxis values
    })),
  };

  setTimeout(() => {
    myChart.hideLoading();
    myChart.setOption(option);
  }, 1000);
}

function BarChart({
  dataforPlot,
  xAxis,
  yAxis,
}: {
  dataforPlot: object[];
  xAxis: string[];
  yAxis: string[];
}) {
  useEffect(() => {
    if (dataforPlot.length > 0) {
      setTimeout(() => {
        generateGraph(dataforPlot, xAxis, yAxis);
      }, 1000);
    }
  }, [dataforPlot]);

  return (
    <div
      id="bar-chart"
      style={{
        width: '95vw',
        height: '50vh',
        marginTop: '1.5rem',
        overflow: 'auto',
      }}
    ></div>
  );
}

export default BarChart;
