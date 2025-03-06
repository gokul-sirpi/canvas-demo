import * as echarts from 'echarts';
import { formatDate } from '../../../../utils/FormatDate';
import { camelCaseToSpaceSeparated } from '../../../../utils/CamelCaseToSpaceSeparated';
import { EchatrColors } from '../../../../utils/EchartColors';
import { useEffect } from 'react';

function getNestedValue(obj: Object, path: string) {
  // @ts-ignore
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function generateGraph(data: object[], xAxis: string[], yAxis: string[]) {
  let chartDom = document.getElementById('line-chart');
  let myChart = echarts.init(chartDom);

  // dispatch(updateLoadingState(true));

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
    color: EchatrColors(),
    animationDuration: 2500,
    height: '70%',
    title: {
      text: 'MultiLine Plot',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: yAxis,
      formatter: (name: string) => camelCaseToSpaceSeparated(name),
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
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
    },
    series: yAxis.map((key) => ({
      name: key,
      type: 'line',
      stack: 'Total',
      // data: data.map((item) => item[key]),
      data: data.map((item) => getNestedValue(item, key)),
    })),
  };

  // option && myChart.setOption(option);
  // myChart.hideLoading(); // Hide loading after data is ready

  // dispatch(updateLoadingState(false));

  setTimeout(() => {
    myChart.hideLoading(); // Hide loading after data is ready
    myChart.setOption(option);
  }, 1000);
}

function MultiLineChart({
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
    <>
      <div
        id="line-chart"
        style={{
          width: '95vw',
          height: '55vh',
          top: '1.5rem',
        }}
      ></div>
    </>
  );
}

export default MultiLineChart;
