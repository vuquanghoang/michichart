import React from "react";
import { Story, Meta } from '@storybook/react';
import { LineAndVerticalBarChart, LineAndVerticalBarChartProps }  from './index';
import mockData from "./mockData.json";
import mockData2 from "./mock2.json";
import mockData2Total from "./mock2Total.json";

export default {
  title: "Charts/LineChartAdvanced",
  components: LineAndVerticalBarChart
} as Meta;

const Template: Story<LineAndVerticalBarChartProps> = (args) => <LineAndVerticalBarChart {...args} />;
export const Primary = Template.bind({});

Primary.args = {
  className: '',
  series1: mockData,
  series2Total: mockData2Total,
  series2: [{
    data: mockData2,
    label: 'Value',
    key: 'value',
    abbr: 'T',
  }],
  title: 'Percentage',
  conf: {
    width: 900,
    height: 500,
    padding: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    },
    scaleFormat:{
      b: '$ {v}b',
      m: '$ {v}m',
      k: '$ {v}k',
      n: '$ {v}',
    },
    isScaled: true,
    colors: {
      'All Africa': '#1F77B4',
      'Central Africa': '#FF7F0E',
    },
  }
}
