import React from 'react';

import MultiLineChart from '../../components/PLOTS/chart/multiLineChart/MultiLineChart';
import AreaChart from '../../components/PLOTS/chart/areaChart/AreaChart';
import BarChart from '../../components/PLOTS/chart/barChart/BarChart';
import ScatterPlot from '../../components/PLOTS/chart/scatterPlot/ScatterPlot';
import PieChart from '../../components/PLOTS/chart/pieChart/PieChart';
import StackedBarChart from '../../components/PLOTS/chart/stackedBarChart/StackedBarChart';
import LargeScaleBarChart from '../../components/PLOTS/chart/largeScalwBarChart/LargeScaleBarChart';

interface ChartRendererProps {
  plotType: string;
  data: Object[];
  xAxis: string[];
  yAxis: string[];
  zAxis?: string[];
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  plotType,
  data,
  xAxis,
  yAxis,
}) => {
  if (plotType === 'multiLinePlot') {
    return <MultiLineChart dataforPlot={data} xAxis={xAxis} yAxis={yAxis} />;
  } else if (plotType === 'areaChart') {
    return <AreaChart dataforPlot={data} xAxis={xAxis} yAxis={yAxis} />;
  } else if (plotType === 'barChart') {
    return <BarChart dataforPlot={data} xAxis={xAxis} yAxis={yAxis} />;
  } else if (plotType === 'scatterPlot') {
    return <ScatterPlot dataforPlot={data} xAxis={xAxis} yAxis={yAxis} />;
  } else if (plotType === 'pieChart') {
    return (
      <PieChart
        dataforPlot={data}
        xAxis="commodityVarietyName"
        yAxis="arrivalQuantity"
        aggregation="sum"
      />
    );
  } else if (plotType === 'stackedBarChart') {
    return <StackedBarChart dataforPlot={data} xAxis={xAxis} yAxis={yAxis} />;
  } else if (plotType === 'largeScaleBarChart') {
    return (
      <LargeScaleBarChart dataforPlot={data} xAxis={xAxis} yAxis={yAxis} />
    );
  }

  return null;
};

export default ChartRenderer;
