import * as echarts from 'echarts';

import { formatDate } from '../../../../utils/FormatDate';
import { camelCaseToSpaceSeparated } from '../../../../utils/CamelCaseToSpaceSeparated';
import { EchatrColors } from '../../../../utils/EchartColors';

function generateGraph(data: object[], xAxis: string[], yAxis: string[]) {
  let chartDom = document.getElementById('area-chart');
  let myChart = echarts.init(chartDom);
  let option = {
    title: {
      text: 'Area Chart',
    },
    tooltip: {
      trigger: 'axis',
    },
    color: EchatrColors(),
    height: '50%',
    legend: {
      data: yAxis,
      formatter: (name: string) => camelCaseToSpaceSeparated(name),
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
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
      areaStyle: {
        color: EchatrColors(),
        opacity: 0.5,
      },
      data: data.map((item) => item[key]),
    })),
  };

  option && myChart.setOption(option);
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
  setTimeout(() => {
    generateGraph(dataforPlot, xAxis, yAxis);
  }, 1000);
  // console.log(dataforPlot, xAxis, yAxis);

  return (
    <div
      id="area-chart"
      style={{
        width: '100vw',
        height: '100vh',
        top: '1.5rem',
        overflow: 'auto',
      }}
    ></div>
  );
}

export default AreaChart;
