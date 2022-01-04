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
  isScaled:true,
  scaleFormat:{
    b: '$ {v}b',
    m: '$ {v}m',
    k: '$ {v}k',
    n: '$ {v}',
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
};
