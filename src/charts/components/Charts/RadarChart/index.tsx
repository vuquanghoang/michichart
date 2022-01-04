/**
 * Animated radial line example using svg dash offset trick. See here for more
 * https://www.visualcinnamon.com/2016/01/animating-dashed-line-d3.html
 */
import React from "react";
import { Group } from "@visx/group";
import { NumberLike, scaleLinear } from "@visx/scale";
import { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { AxisLeft } from "@visx/axis";
import { GridAngle, GridRadial } from "@visx/grid";

const green = "#e5fd3d";
export const blue = "#aeeef8";
export const background = "#744cca";
const strokeColor = "#744cca";

// utils
function extent<Datum>(data: Datum[], value: (d: Datum) => number) {
  const values = data.map(value);
  return [Math.min(...values), Math.max(...values)];
}

// accessors
const date = (d: AppleStock) => new Date(d.date).valueOf();
const close = (d: AppleStock) => d.close;
const formatTicks = (val: NumberLike) => String(val);
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


const padding = 20;

export type RadarChartProps = {
  width: number;
  height: number;
};

export const RadarChart = ({ width, height }: RadarChartProps) => {
  // scales
  const xScale = scaleLinear({
    range: [0, Math.PI * 3],
    domain: [360, 0]
  });
  const yScale = scaleLinear<number>({
    // domain: extent(appleStock, close),
    // domain: [0, height]
    domain: [0, 30]
  });


  if (width < 10) return null;

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  const reverseYScale = yScale.copy().range(yScale.range().reverse());

  const genPoints = (length: number, radius: number) => {
    const step = (Math.PI * 2) / length;

    return [...new Array(length)].map((_, i) => ({
      x: radius * Math.sin(i * step) * 1,
      y: radius * Math.cos(i * step) * -1
    }));
  };
  const points = genPoints(12, height / 2);

  // const getValuePosition = (currentVal: number, currentIndex: number, step: number = (Math.PI * 2) / length, radius: number) => {
  //
  //   // const scaledRadius =
  //   return {
  //     x: radius * Math.sin(i * step) * 1,
  //     y: radius * Math.cos(i * step) * -1
  //   };
  // };

  return (
    <>
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <rect width={width} height={height} fill={background} rx={14} />
        <Group top={height / 2} left={width / 2}>
          <GridAngle
            scale={xScale}
            outerRadius={height / 2 - padding}
            stroke={green}
            strokeWidth={1}
            strokeOpacity={0.3}
            numTicks={12}
          />
          <GridRadial
            scale={yScale}
            numTicks={5}
            stroke={blue}
            strokeWidth={1}
            fill={blue}
            fillOpacity={0.1}
            strokeOpacity={0.2}
          />
          <AxisLeft
            top={-height / 2 + padding}
            scale={reverseYScale}
            numTicks={5}
            tickStroke="none"
            tickLabelProps={(val) => ({
              fontSize: 12,

              fillOpacity: 1,
              textAnchor: "start",
              dx: "1em",
              dy: "0",
              stroke: strokeColor,
              strokeWidth: 0.5,
              paintOrder: "stroke"
            })}
            tickFormat={formatTicks}
            hideAxisLine
          />
          {
            points.map((point, i) => (
              <g>
                <text x={point.x} y={point.y} color={"#eee"} textAnchor="middle">{months[i]}</text>
                <circle cx={pointsVal[i].x} cy={pointsVal[i].y} r={5} color={"#eee"} />
              </g>
            ))
          }
        </Group>
      </svg>
    </>
  );
};
