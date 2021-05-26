import React from 'react';
import { Story, Meta } from '@storybook/react';
import { VerticalBarChart, VerticalBarChartProps } from './index';
import mockDataExport from './mockData/export.json';
import mockDataImport from './mockData/import.json';
import mockDataTotal from './mockData/total.json';

export default {
  title: 'Charts/Vertical Bar Chart',
  components: VerticalBarChart,
} as Meta;

const Template: Story<VerticalBarChartProps> = (args) => <VerticalBarChart {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  tickFormat: {
    value: '${v} mn',
    date: '%Y',
  },
  width: 900,
  height: 400,
  seriesTotal: mockDataTotal,
  series: [
    {
      data: mockDataImport,
      label: 'Import',
      key: 'import',
      abbr: 'I',
    },
    {
      data: mockDataExport,
      label: 'Export',
      key: 'export',
      abbr: 'X',
    },
  ],
  title: 'In $ mn',
  colors: {
    'All Africa': '#1F77B4',
    'Central Africa': '#FF7F0E',
  },
};
