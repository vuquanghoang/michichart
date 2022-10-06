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
    keys: mockData.map(d => d.label),
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
    tooltipContent: ({item, series}) => `<div>${JSON.stringify(item)}</div>`,
    axes: {
      y: {
        formatter: value => `${value}`,
        tickComponent: value => (
          <text>
            <tspan
              style={{
                fontFamily: "var(--font-sans-serif-primary)",
                fontWeight: 600,
                fontSize: "0.8em",
                fill: "#918b86",
                textAnchor: "middle",
              }}
              x={value.x + 20}
              y={value.y}
            >
              {value.formattedValue}
            </tspan>
          </text>
        ),
      },
      x: {
        formatter: (value) => value,
        tickComponent: (value) => {
          return `<tspan text-anchor="middle" x=${value.x} y=${value.y}>${value.formattedValue}</tspan>`
        }
      }
    },
  }
};
