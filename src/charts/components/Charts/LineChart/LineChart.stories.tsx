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
  conf: {
    tooltipContent: ({label, date, value, series}) => {
      console.log(series)
      return `<div>${label}</div><div>${date}: ${value}</div>`
    },
    axes: {
      y: {
        formatter: (value, value1) =>  {
          console.log({value}, value1)
          return new Intl.NumberFormat('en-US', { notation: "compact",
            compactDisplay: "short"}).format(value)
        },
      },
      x: {
        formatter: (value) => value,
        tickComponent: (value) => {
          return `<tspan x=${value.x} y=${value.y}>${value.formattedValue}</tspan>`
        }
      }
    },
  },
};
