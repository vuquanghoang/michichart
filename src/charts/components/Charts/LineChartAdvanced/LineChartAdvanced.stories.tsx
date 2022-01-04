import React from "react";
import { Story, Meta } from '@storybook/react';
import { LineChartAdvanced, LineAndVerticalBarChartProps }  from './index';
import mockData from "./mockData.json";
import mockData2 from "./mock2.json";

export default {
  title: "Charts/LineChartAdvanced",
  components: LineChartAdvanced
} as Meta;

const Template: Story<LineAndVerticalBarChartProps> = (args) => <LineChartAdvanced {...args} />;
export const Primary = Template.bind({});


Primary.args = {
  className: '',
  series1: mockData,
  series2: mockData2,
  // @ts-ignore
  conf: {
    width: 900,
    height: 500,
    padding: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    },
    axesLabel: {
      y1: "Percentage 1",
      y2: "Percentage 2",
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