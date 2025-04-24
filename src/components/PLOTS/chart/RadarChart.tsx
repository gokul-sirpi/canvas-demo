// src/components/RadarChart.tsx
import { useEffect } from 'react';
import * as echarts from 'echarts';

function generateGraph(data: object[], xAxis: string[], yAxis: string[]) {
  let chartDom = document.getElementById('radar-chart');
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

  // Prepare radar indicators from yAxis (each yAxis field becomes an axis)
  const indicators = yAxis.map((key) => ({
    name: key,
    max: Math.max(...data.map((item) => Number(item[key as keyof object]) || 0)) * 1.2, // Dynamic max with buffer
  }));

  // Prepare series data (one series per xAxis value or aggregated if xAxis is a single field)
  const radarData = xAxis.length === 1
    ? [
        {
          name: 'Data',
          value: yAxis.map((key) =>
            data.reduce((sum, item) => sum + (Number(item[key as keyof object]) || 0), 0) / data.length // Average if single xAxis
          ),
        },
      ]
    : data.map((item) => ({
        name: String(item[xAxis[0] as keyof object]),
        value: yAxis.map((key) => Number(item[key as keyof object]) || 0),
      }));

  let option: echarts.EChartsOption = {
    animationDuration: 2000,
    title: {
      text: 'Radar Chart',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      data: radarData.map((d) => d.name),
      top: '10%',
    },
    radar: {
      indicator: indicators,
      radius: '65%', // Size of the radar
      axisName: {
        color: '#333',
      },
    },
    series: [
      {
        name: 'Radar Data',
        type: 'radar',
        data: radarData,
        areaStyle: { opacity: 0.1 }, // Optional filled area
        emphasis: {
          focus: 'series',
        },
      },
    ],
  };

  setTimeout(() => {
    myChart.hideLoading();
    myChart.setOption(option);
  }, 1000);
}

function RadarChart({
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
      id="radar-chart"
      style={{
        width: '95vw',
        height: '50vh',
        marginTop: '1.5rem',
        overflow: 'auto',
      }}
    ></div>
  );
}

export default RadarChart;