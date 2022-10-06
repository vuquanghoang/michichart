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
  series2: [],
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
      y1: "National tariff line (%)",
      y2: "",
    },
    tooltipContent: ({item, series}) => {
      console.log(series)
      return `<div>${JSON.stringify(item)}</div>`
    },
    axes: {
      y1: {
        formatter: (value) =>  value,
      },
      y2: {
        formatter: (value) =>  value,
      },
      x: {
        formatter: (value) => value,
      /*  tickComponent: (value) => {
          return <tspan x={value.x} y={value.y}>{value.formattedValue}</tspan>
        }*/
      }
    },
  }
}
