import React from 'react';
import { Story, Meta } from '@storybook/react';
import { AreaChart, AreaChartProps } from './index';
import dataYearly from './mockData/yearly.json';
import dataMonthly from './mockData/monthly.json';
import { defaultConfig } from '../../../helpers';

export default {
  title: 'Charts/Area Chart',
  components: AreaChart,
} as Meta;

const Template: Story<AreaChartProps> = (args) => <AreaChart {...args} />;

export const Yearly = Template.bind({});
Yearly.args = {
  className: '',
  width: 900,
  height: 500,
  seriesData: dataYearly,
  padding: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
  domainAxisY: [0, 100],
  domainAxisX: null,
  title: '',
  showAxisX: true,
  showAxisY: true,
  tickFormat: {
    ...defaultConfig.tickFormat,

    value: '{v}%',
  },
  tooltip: null,
  tooltipDefaultStyle: true,
  dataKeys: ['Processed', 'Raw', 'Semi-processed'],
  colors: {
    Processed: ['#144F73', 'rgba(20,79,115,0.60)'],
    'Semi-processed': ['#AEC7E8', 'rgba(174,199,232,0.60)'],
    Raw: ['#FFAC00', 'rgba(255,172,0,0.60)'],
  },
};

export const Monthly = Template.bind({});
Monthly.args = {
  className: '',
  width: 900,
  height: 500,
  seriesData: dataMonthly,
  padding: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
  domainAxisX: null,
  title: '',
  showAxisX: true,
  showAxisY: true,
  tickFormat: {
    ...defaultConfig.tickFormat,
    value: '${v}',
    date: '%m-%Y',
  },
  tooltip: null,
  tooltipDefaultStyle: true,
  dataKeys: ['Processed', 'Raw', 'Semi-processed'],
  colors: {
    Processed: ['#144F73', 'rgba(20,79,115,0.60)'],
    'Semi-processed': ['#AEC7E8', 'rgba(174,199,232,0.60)'],
    Raw: ['#FFAC00', 'rgba(255,172,0,0.60)'],
  },
};
