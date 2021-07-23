import React from 'react';
import { Story, Meta } from '@storybook/react';
import { ScatterPlotChart, ScatterPlotChartProps } from './index';
import mockData from './mockData.json';

export default {
  title: 'Charts/Scatter Plot Chart',
  components: ScatterPlotChart,
} as Meta;

const Template: Story<ScatterPlotChartProps> = (args) => <ScatterPlotChart {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  className: '',
  seriesData: mockData,
  width: 900,
  height: 500,
  domainAxisX: null,
  domainAxisY: null,
  axisYLbl: 'Preferential margin',
  axisXLbl: 'Utilization rate',
  padding: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
  legendTitle: <>Trade value in UGX<br />(Uganda Shilling)</>,
  showAxisX: true,
  showAxisY: true,
  tickFormat: {
    value: '{v}%',
    date: '%Y',
    scale: 'bn',
  },
  tooltip: null,
  tooltipDefaultStyle: true,
};
