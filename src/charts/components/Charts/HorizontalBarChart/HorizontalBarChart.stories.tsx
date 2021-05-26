import React from 'react';
import { Story, Meta } from '@storybook/react';
import { HorizontalBarChart, HorizontalBarChartProps } from "./index";
import defaultModeData from './mockData/normal-mode.json';

export default {
  title: 'Charts/Horizontal Bar Chart',
  components: HorizontalBarChart,
} as Meta;

const Template: Story<HorizontalBarChartProps> = (args) => <HorizontalBarChart {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  className: '',
  seriesData: defaultModeData,
  width: 900,
  height: 500,
  padding: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
  domainAxisX: null,
  domainAxisY: null,
  showAxisX: true,
  showAxisY: true,
  tickFormat: {
    value: '{v}',
    date: '%Y',
  },
  direction: 'ltr',
};