import React from 'react';
import { Story, Meta } from '@storybook/react';
import { ScatterPlotChart, ScatterPlotChartProps } from './index';
import mockData from './mockData3.json';

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
  domainAxisY: [ 23, 0],
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
  conf: {
    tooltipContent: ({item, series}) => `<div>${ new Intl.NumberFormat('en-GB', {
      notation: "compact",
      compactDisplay: "short"
    }).format(item.d)}</div>`,
    axes: {
      y: {
        formatter: (value) =>  {
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
    legend: {
      isEnabled: true,
      content: '',
      value: {
        formatter: (value) => value
      }
    }
  },
};
