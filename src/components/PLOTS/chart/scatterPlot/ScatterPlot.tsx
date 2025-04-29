import { useEffect } from 'react';
import * as echarts from 'echarts';

function generateGraph(data: object[], xAxis: string[], yAxis: string[]) {
  let chartDom = document.getElementById('scatter-chart');
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
    animationDuration: 2000,
    title: {
      text: 'Scatter Plot',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross', // Helps to analyze scatter data
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
      type: 'category', // If x-axis is categorical (e.g., dates, labels)
      data: data.map((item) => item[xAxis]),
      axisLabel: {
        rotate: 45, // Rotate labels if they are too long
      },
    },
    yAxis: {
      type: 'value',
    },
    series: yAxis.map((key) => ({
      name: key,
      type: 'scatter',
      symbolSize: 10, // Adjust point size
      emphasis: {
        focus: 'series',
      },
      data: data.map((item) => item[key]), // Extract y-axis values dynamically
    })),
  };

  setTimeout(() => {
    myChart.hideLoading();
    myChart.setOption(option);
  }, 1000);
}

function ScatterPlot({
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
      id="scatter-chart"
      style={{
        width: '95vw',
        height: '50vh',
        marginTop: '1.5rem',
        overflow: 'auto',
      }}
    ></div>
  );
}

export default ScatterPlot;
