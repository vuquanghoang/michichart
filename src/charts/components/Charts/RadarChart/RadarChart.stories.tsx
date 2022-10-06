import React from 'react';
import { Story, Meta } from '@storybook/react';
import { RadarChart, RadarChartProps } from "./index";
// import mockData from './mockData.json';
import mockData2 from './mockData2.json';

export default {
  title: 'Charts/Radar Chart',
  components: RadarChart,
} as Meta;

const Template: Story<RadarChartProps> = (args) => <RadarChart {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  width: 360,
  height: 360,
  seriesData: mockData2,
  // seriesData: mockData,
  conf: {
    padding: 30,
    gridAngleLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    tooltipContent: ({item}) => (
      <>
        {JSON.stringify(item)}
      </>),
    radialScale: {
      range: [0, Math.PI * 3],
      domain: [360, 0],
    },
    yScale: {
      domain: [0, Math.max(...(mockData2.map(d => d.data).flat().map(d => d.value)))],
    },
    gridAngle: {
      style: {
        stroke: '#c1c1c1',
        strokeWidth: 1,
      },
      numTicks: 12,
    },
    gridRadial: {
      style: {
        stroke: '#c1c1c1',
        strokeWidth: 0,
        numTicks: 5,
        fill: 'transparent',
        fillOpacity: 0,
        strokeDasharray: '2,2',
      },
      label: {
        style: {
          color: '#ccc',
          fontWeight: 'bold',
        },
      },
    },
    axes: {
      topVertical: {
        style: {
          fontSize: 12,
          dx: 15,
          dy: 3,
          textAnchor: 'end',
          stroke: 'red',
          strokeWidth: 0.5,
        },
        formatter: (value) => value,
      },
    },
    seriesData: [
      // line:
    ],
  },
};
