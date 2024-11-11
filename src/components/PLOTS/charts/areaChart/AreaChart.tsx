import * as echarts from 'echarts';
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
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((item) => item[xAxis]),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'arrivalQuantity',
        type: 'line',
        stack: 'Total',
        data: data.map((item) => item[yAxis]),
      },
    ],
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
        width: '90vw',
        height: '100vh',
        top: '1.5rem',
        overflow: 'auto',
      }}
    ></div>
  );
}

export default AreaChart;
