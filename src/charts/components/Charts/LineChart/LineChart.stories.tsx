import React from 'react';
import { Story, Meta } from '@storybook/react';
import { LineChart, LineChartProps } from './index';
import mockData from './mockData.json';

export default {
  title: 'Charts/Line Chart',
  components: LineChart,
} as Meta;

const Template: Story<LineChartProps> = (args) => <LineChart {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  className: '',
  tickFormat: {
    value: '{v}%',
    date: '%Y',
  },
  isScaled:true,
  scaleFormat:{
    b: '$b{v}',
    m: '$m{v}',
    k: '$k{v}',
    n: '${v}',
  },
  padding: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
  width: 900,
  height: 500,
  series: mockData,
  title: 'Percentage',
  stretching: true,
  minifyAxisX: true,
  minifyAxisY: true,
  // domainAxisY: [-20, 100],
};
