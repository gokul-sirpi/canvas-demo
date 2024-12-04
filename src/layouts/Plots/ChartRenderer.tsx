import React from 'react';
import MultiLineChart from '../../components/PLOTS/charts/multiLineChart/MultiLineChart';
import AreaChart from '../../components/PLOTS/charts/areaChart/AreaChart';

interface ChartRendererProps {
  plotType: string;
  data: Object[];
  xAxis: string[];
  yAxis: string[];
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
  }
  return null;
};

export default ChartRenderer;
