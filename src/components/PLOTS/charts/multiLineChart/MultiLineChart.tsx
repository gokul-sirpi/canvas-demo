import * as echarts from 'echarts';
import { formatDate } from '../../../../utils/FormatDate';
import { camelCaseToSpaceSeparated } from '../../../../utils/CamelCaseToSpaceSeparated';
import { EchatrColors } from '../../../../utils/EchartColors';

function getNestedValue(obj: Object, path: string) {
  // @ts-ignore
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function generateGraph(data: object[], xAxis: string[], yAxis: string[]) {
  let chartDom = document.getElementById('line-chart');
  let myChart = echarts.init(chartDom);
  let option = {
    color: EchatrColors(),
    animationDuration: 2500,
    height: '80%',
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

  option && myChart.setOption(option);
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
  setTimeout(() => {
    generateGraph(dataforPlot, xAxis, yAxis);
  }, 1000);

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
