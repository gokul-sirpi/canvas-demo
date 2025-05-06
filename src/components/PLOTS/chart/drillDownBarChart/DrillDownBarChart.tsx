import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function generateDrillDownChart(dataSets: any[][], initialOptionId: string) {
  let chartDom = document.getElementById('drill-down-chart');
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

  const allOptions: { [key: string]: echarts.EChartsOption } = {};
  const optionStack: string[] = [];

  dataSets.forEach((data) => {
    const optionId = data[0][2];
    allOptions[optionId] = {
      id: optionId,
      animationDuration: 2500,
      title: {
        text: 'Drill Down Chart',
      },
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {},
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: {
        type: 'bar',
        dimensions: ['x', 'y', 'groupId', 'childGroupId'],
        encode: {
          x: 'x',
          y: 'y',
          itemGroupId: 'groupId',
          itemChildGroupId: 'childGroupId',
        },
        data,
        universalTransition: {
          enabled: true,
          divideShape: 'clone',
        },
        barWidth: '70%',
      },
      graphic: [
        {
          type: 'text',
          left: 50,
          top: 20,
          style: {
            text: 'Back',
            fontSize: 18,
            fill: 'grey',
          },
          onclick: function () {
            if (optionStack.length === 0) {
              console.log('Already at root level!');
            } else {
              myChart.setOption(allOptions[optionStack.pop()!]);
            }
          },
        },
      ],
    };
  });

  myChart.on('click', 'series', (params: any) => {
    const dataItem = params.data;
    if (dataItem[3]) {
      const childGroupId = dataItem[3];
      optionStack.push(myChart.getOption().id as string);
      myChart.setOption(allOptions[childGroupId]);
    }
  });

  setTimeout(() => {
    myChart.hideLoading();
    myChart.setOption(allOptions[initialOptionId]);
  }, 1000);
}

function DrillDownChart({
  dataSets,
  initialOptionId,
}: {
  dataSets: any[][];
  initialOptionId: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataSets.length > 0 && chartRef.current) {
      setTimeout(() => {
        generateDrillDownChart(dataSets, initialOptionId);
      }, 1000);
    }
  }, [dataSets, initialOptionId]);

  return (
    <div
      id="drill-down-chart"
      ref={chartRef}
      style={{
        width: '95vw',
        height: '50vh',
        marginTop: '1.5rem',
        overflow: 'auto',
      }}
    ></div>
  );
}

export default DrillDownChart;