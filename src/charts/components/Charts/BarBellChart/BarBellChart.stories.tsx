import React from "react";
import { Meta, Story } from "@storybook/react";
import { BarBellChart, BarBellChartProps } from "./index";
import mockData from "./mockData.json";

export default {
  title: "Charts/BarBellChart",
  components: BarBellChart
} as Meta;

const Template: Story<BarBellChartProps> = (args) => <BarBellChart {...args} />;
export const Primary = Template.bind({});


Primary.args = {
  className: "",
  series: mockData,
  // @ts-ignore
  conf: {
    keys: ["EAC", "Botswana"],
    width: 900,
    height: 500,
    padding: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    },
    axesLabel: {
      x: "Hours"
    },
    scaleFormat: {
      b: "$ {v}b",
      m: "$ {v}m",
      k: "$ {v}k",
      n: "$ {v}"
    },
    precision: 2,
    tickFormat: {
      date: "%m-%Y"
    },
    isScaled: true,
    colors: [
      { "EAC": "#1F77B4" },
      { "Botswana": "#FF7F0E" }
    ],

  }
};