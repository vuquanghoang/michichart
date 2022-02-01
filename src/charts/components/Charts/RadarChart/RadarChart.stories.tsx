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
  width: 500,
  height: 500,
  seriesData: mockData2,
  // seriesData: mockData,
  conf: {
    padding: 50,
    gridAngleLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    tooltipContent: ({label, date, value}) => `<div>${label}</div><div>${date}: ${value}</div>`,
    radialScale: {
      range: [0, Math.PI * 3],
      domain: [360, 0]
    },
    yScale: {
      domain: [0 , 1680]
    },
    gridAngle: {
      style: {
        stroke: '#c1c1c1',
        strokeWidth: 1,
      },
      numTicks: 12
    },
    gridRadial: {
      style: {
        stroke: '#c1c1c1',
        strokeWidth: 1,
        numTicks: undefined,
        fill: 'transparent',
        fillOpacity: 0,
        strokeDasharray: '2,2',
      },
      label: {
        style: {
          color: '#ccc',
          fontWeight: 'bold',
        }
      }
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
        formatter: (value) =>  value
      }
    },
    seriesData: [
      // line:
    ]
  }
}
