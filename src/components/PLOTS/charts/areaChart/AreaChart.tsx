import * as echarts from 'echarts';

import { formatDate } from '../../../../utils/FormatDate';
import { camelCaseToSpaceSeparated } from '../../../../utils/CamelCaseToSpaceSeparated';
import { EchatrColors } from '../../../../utils/EchartColors';
import { useEffect } from 'react';

function generateGraph(data: object[], xAxis: string[], yAxis: string[]) {
  let chartDom = document.getElementById('area-chart');
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

  let option = {
    animationDuration: 2500,

    title: {
      text: 'Area Chart',
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
    },
    color: EchatrColors(),
    height: '60%',
    legend: {
      data: yAxis,
      formatter: (name: string) => camelCaseToSpaceSeparated(name),
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      // @ts-ignore
      data: data.map((item) => item[xAxis]),
      axisLabel: {
        formatter: (value: string) => formatDate(value),
      },
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
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
    series: yAxis.map((key) => ({
      name: key,
      type: 'line',
      stack: 'Total',
      smooth: true,
      areaStyle: {
        color: EchatrColors(),
        opacity: 0.5,
      },
      // @ts-ignore
      data: data.map((item) => item[key]),
    })),
  };

  // option && myChart.setOption(option);
  setTimeout(() => {
    myChart.hideLoading(); // Hide loading after data is ready
    myChart.setOption(option);
  }, 1000);
}

function AreaChart({
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
  // console.log(dataforPlot, xAxis, yAxis);

  return (
    <div
      id="area-chart"
      style={{
        width: '95vw',
        height: '50vh',
        top: '1.5rem',
        overflow: 'auto',
      }}
    ></div>
  );
}

export default AreaChart;
