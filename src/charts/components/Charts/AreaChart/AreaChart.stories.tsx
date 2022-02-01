import React from "react";
import { Meta, Story } from "@storybook/react";
import { AreaChart, AreaChartProps } from "./index";
import dataYearly from "./mockData/yearly.json";
import dataMonthly from "./mockData/monthly.json";
import { defaultConfig } from "../../../helpers";

export default {
  title: "Charts/Area Chart",
  components: AreaChart
} as Meta;

const Template: Story<AreaChartProps> = (args) => <AreaChart {...args} />;

export const Yearly = Template.bind({});
Yearly.args = {
  className: "",
  width: 900,
  height: 500,
  seriesData: dataYearly,
  padding: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  },
  // domainAxisY: [0, 100],
  domainAxisX: null,
  title: "",
  showAxisX: true,
  showAxisY: true,
  tickFormat: {
    ...defaultConfig.tickFormat,

    value: "{v}%"
  },
  tooltip: null,
  tooltipDefaultStyle: true,
  dataKeys: ["Processed", "Raw", "Semi-processed"],
  colors: {
    Processed: "red",
    "Semi-processed": "green",
    Raw: "blue"
  },
  conf: {
    tooltipContent: ({item, series}) => `<div>${JSON.stringify(item)}</div>`,
    axes: {
      y: {
        style: {
          position: 'relative',
          fontFamily: 'var(--font-sans-serif-primary)',
          fontSize: '0.8em',
          fontWeight: 'bold',
          fill: '#7e7a7a',
          textAnchor: 'start'
        },
        formatter: (value) =>  {
          return new Intl.NumberFormat('en-US', { notation: "compact",
            compactDisplay: "short"}).format(value)
        },
      },
      x: {
        style: {

        },
        formatter: (value) => value,
        tickComponent: (value) => {
          return `<tspan text-anchor="middle" x=${value.x} y=${value.y}>${value.formattedValue}</tspan>`
        }
      }
    },
  },
};

export const Monthly = Template.bind({});
Monthly.args = {
  className: "",
  width: 900,
  height: 500,
  seriesData: dataMonthly,
  padding: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  },
  domainAxisX: null,
  title: "",
  showAxisX: true,
  showAxisY: true,
  tickFormat: {
    ...defaultConfig.tickFormat,
    value: "${v}",
    date: "%m-%Y"
  },
  tooltip: null,
  tooltipDefaultStyle: true,
  dataKeys: ["Processed", "Raw", "Semi-processed"],
  colors: {
    Processed: "red",
    "Semi-processed": "green",
    Raw: "blue"
  },
  isScaled:true,
  scaleFormat:{
    b: '$ {v}b',
    m: '$ {v}m',
    k: '$ {v}k',
    n: '$ {v}',
  },
  conf: {
    tooltipContent: ({item, series}) => `<div>${JSON.stringify(item)}</div>`,
    axes: {
      y: {
        style: {
          position: 'relative',
          fontFamily: 'var(--font-sans-serif-primary)',
          fontSize: '0.8em',
          fontWeight: 'bold',
          fill: '#7e7a7a',
          textAnchor: 'start'
        },
        formatter: (value) =>  {
          return new Intl.NumberFormat('en-US', { notation: "compact",
            compactDisplay: "short"}).format(value)
        },
      },
      x: {
        style: {

        },
        formatter: (value) => value,
        tickComponent: (value) => {
          return `<tspan text-anchor="middle" x=${value.x} y=${value.y}>${value.formattedValue}</tspan>`
        }
      }
    },
  },
};
