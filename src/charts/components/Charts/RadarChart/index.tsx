/**
 * Animated radial line example using svg dash offset trick. See here for more
 * https://www.visualcinnamon.com/2016/01/animating-dashed-line-d3.html
 */
import React from 'react';
import {Group} from '@visx/group';
import {NumberLike, scaleLog, scaleTime} from '@visx/scale';
import appleStock, {AppleStock} from '@visx/mock-data/lib/mocks/appleStock';
import {AxisLeft} from '@visx/axis';
import {GridAngle, GridRadial} from '@visx/grid';

const green = '#e5fd3d';
export const blue = '#aeeef8';
export const background = '#744cca';
const strokeColor = '#744cca';

// utils
function extent<Datum>(data: Datum[], value: (d: Datum) => number) {
  const values = data.map(value);
  return [Math.min(...values), Math.max(...values)];
}

// accessors
const date = (d: AppleStock) => new Date(d.date).valueOf();
const close = (d: AppleStock) => d.close;
const formatTicks = (val: NumberLike) => String(val);

// scales
const xScale = scaleTime({
  range: [0, Math.PI * 2],
  domain: extent(appleStock, date),
});
const yScale = scaleLog<number>({
  domain: extent(appleStock, close),
});

const padding = 20;

export type RadarChartProps = {
  width: number;
  height: number;
};

export const RadarChart = ({width, height}: RadarChartProps) => {
  if (width < 10) return null;
  
  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  const reverseYScale = yScale.copy().range(yScale.range().reverse());
  
  console.log(Math.PI * 2, extent(appleStock, close), reverseYScale);
  return (
    <>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill={background} rx={14}/>
        <Group top={height / 2} left={width / 2}>
          <GridAngle
            scale={xScale}
            outerRadius={height / 2 - padding}
            stroke={green}
            strokeWidth={1}
            strokeOpacity={0.3}
            numTicks={20}
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
              fontSize: 8,
              fill: blue,
              fillOpacity: 1,
              textAnchor: 'middle',
              dx: '1em',
              dy: '-0.5em',
              stroke: strokeColor,
              strokeWidth: 0.5,
              paintOrder: 'stroke',
            })}
            tickFormat={formatTicks}
            hideAxisLine
          />
        </Group>
      </svg>
    </>
  );
};
