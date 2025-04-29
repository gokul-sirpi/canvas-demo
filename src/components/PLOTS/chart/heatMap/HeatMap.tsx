import { useEffect } from 'react';
import * as echarts from 'echarts';

function generateHeatMap(
  data: object[],
  xAxis: string,
  yAxis: string,
  zAxis: string
) {
  let chartDom = document.getElementById('heat-map');
  if (!chartDom) {
    console.error('Heat-map DOM not found');
    return;
  }

  // Dispose of any existing ECharts instance to prevent duplicate rendering issues
  echarts.dispose(chartDom);
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

  let heatmapData = data.map((item) => [
    item[xAxis], // Longitude
    item[yAxis], // Latitude
    item[zAxis], // Intensity (e.g., humidity, temperature)
  ]);

  let option: echarts.EChartsOption = {
    animationDuration: 2500,
    title: { text: 'Heat Map' },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `Lat: ${params.value[1]}<br>Lon: ${params.value[0]}<br>Value: ${params.value[2]}`;
      },
    },
    visualMap: {
      min: Math.min(...heatmapData.map((d) => d[2])),
      max: Math.max(...heatmapData.map((d) => d[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
    },
    xAxis: {
      type: 'category',
      data: [...new Set(heatmapData.map((d) => d[0]))], // Unique x-axis values
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'category',
      data: [...new Set(heatmapData.map((d) => d[1]))], // Unique y-axis values
    },
    series: [
      {
        name: zAxis,
        type: 'heatmap',
        data: heatmapData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
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

function HeatMap({
  dataforPlot,
  xAxis,
  yAxis,
  zAxis,
}: {
  dataforPlot: object[];
  xAxis: string;
  yAxis: string;
  zAxis: string;
}) {
  useEffect(() => {
    console.log(xAxis, yAxis, zAxis);
    if (dataforPlot.length > 0) {
      setTimeout(() => {
        const chartDom = document.getElementById('heat-map');
        if (chartDom) {
          generateHeatMap(dataforPlot, xAxis, yAxis, zAxis);
        }
      }, 1000);
    }
  }, [dataforPlot, xAxis, yAxis, zAxis]);

  return (
    <div>
      <div
        id="heat-map"
        style={{
          width: '95vw',
          height: '50vh',
          marginTop: '1.5rem',
          overflow: 'auto',
        }}
      ></div>
    </div>
  );
}

export default HeatMap;
