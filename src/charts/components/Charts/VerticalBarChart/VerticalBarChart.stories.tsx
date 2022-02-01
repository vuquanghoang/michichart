import React from 'react';
import { Story, Meta } from '@storybook/react';
import { VerticalBarChart, VerticalBarChartProps } from './index';
import mockDataExport from './mockData/export.json';
import mockDataImport from './mockData/import.json';
import mockDataTotal from './mockData/total2.json';
import mockDataTrade from './mockData/trade2.json';

export default {
  title: 'Charts/Vertical Bar Chart',
  components: VerticalBarChart,
} as Meta;

const Template: Story<VerticalBarChartProps> = (args) => <VerticalBarChart {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  width: 900,
  height: 400,
  seriesTotal: mockDataTotal,
  series: [
    // {
    //   data: mockDataImport,
    //   label: 'Import',
    //   key: 'import',
    //   abbr: 'I',
    // },
    // {
    //   data: mockDataExport,
    //   label: 'Export',
    //   key: 'export',
    //   abbr: 'X',
    // },
    {
      data: mockDataTrade,
      label: 'Trade',
      key: 'import',
      abbr: 'T',
    },
  ],
  title: 'In $ mn',
  colors: {
    'All Africa': '#1F77B4',
    'Central Africa': '#FF7F0E',
  },
  conf: {
    tooltipContent: ({label, date, value, series}) => `<div>${label}</div><div>${date}: ${ new Intl.NumberFormat('en-GB', {
      notation: "compact",
      compactDisplay: "short"
    }).format(value)}</div>`,
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
  },
};
