
import { Story, Meta } from '@storybook/react';
import { VerticalBarGroupChart, VerticalBarGroupChartProps } from './index';
import mockDataTrade from './mockData/trade2.json';

export default {
  title: 'Charts/Vertical Bar Group Chart',
  components: VerticalBarGroupChart,
} as Meta;

const Template: Story<VerticalBarGroupChartProps> = (args) => <VerticalBarGroupChart {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  width: 900,
  height: 400,
  series: mockDataTrade,
  title: '%',
  colors: {
    'All Africa': '#1F77B4',
    'Central Africa': '#FF7F0E',
  },
  conf: {
    // @ts-ignore
    tooltipContent: ({item, series}) => {
      return `<div>${JSON.stringify(item)}</div>`
    },
    axes: {
      y: {
        formatter: (value: number | bigint) =>  {
          return new Intl.NumberFormat('en-US', { notation: "compact",
            compactDisplay: "short"}).format(value)
        },
      },
      x: {
        formatter: (value: any) => value,
        tickComponent: (value: { x: any; y: any; formattedValue: any; }) => {
          return <text textAnchor="middle" x={value.x} y={value.y}>{value.formattedValue}</text>
        }
      }
    },
  },
};
