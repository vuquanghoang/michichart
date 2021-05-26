import React from 'react';
import { Story, Meta } from '@storybook/react';
import { RadarChart, RadarChartProps } from "./index";

export default {
  title: 'Charts/Radar Chart',
  components: RadarChart,
} as Meta;

const Template: Story<RadarChartProps> = (args) => <RadarChart {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  width: 900,
  height: 500,
  
}