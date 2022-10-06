import React, { FC, useRef } from "react";
import styled from "styled-components";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { GridRows } from "@visx/grid";
import { defaultConfig } from "../../../helpers";
import { Label, TickPlain, TickYear } from "../../Axes";
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis";
import { BarGroup, LinePath } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import colorsDefault from "../../../constants/colors";
import { localPoint } from "@visx/event";
import { DateValue } from "../LineChart";
import { select, selectAll } from "d3-selection";
import { defaultStyles, useTooltip, useTooltipInPortal } from "@visx/tooltip";
import Tooltip, { ITooltipTrendProps } from "../../Tooltips/TooltipTrendv2";
import { timeFormat } from "d3-time-format";
import { Group } from "@visx/group";
import Stack from "../VerticalBarChart/Stack";

export interface LineAndVerticalBarChartProps {
  className: string;
  series1: any[];
  series2: any[];
  series2Total: any[];
  title: string | React.ReactNode;
  conf: {
    width?: number,
    height?: number,
    padding: {
      top: number,
      right: number,
      bottom: number,
      left: number,
    },
 /*   scaleFormat: {
      b: string,
      m: string,
      k: string,
      n: string,
    },
    colors: object;
    disabledItems: string[];
    tickFormat: object;
    isScaled: boolean;*/
  },
}

const Styled = styled.div`
  display: flex;
  flex-direction: column;

  .base-line {
    line {
      stroke-dasharray: none;
    }
  }

  .data-point {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out, stroke-width 0.1s ease-in-out;

    &.highlight {
      opacity: 1;
      stroke-width: 5px;
      pointer-events: auto;
    }
  }
`;

const DataGroup = styled.g`
  path {
    position: relative;
  }

  path + g {
    opacity: 0;
  }

  path:hover {
    z-index: 1;
  }

  path:hover + g {
    opacity: 1;
  }
`;


const SCALE = {
  N: "n",
  K: "k",
  M: "m",
  B: "b"
};

let tooltipTimeout: number;

const formatDataByScale = (scaleFormat, data) => {
  const scale = Math.round(Math.log10(data));

  let scaledData = data;

  if (scale >= 9) {
    scaledData = data / 1000000000;
    return scaleFormat[SCALE.B].replace("{v}", scaledData.toFixed(Number.isInteger(scaledData) ? 0 : 2));
  }

  if (scale >= 6) {
    scaledData = data / 1000000;
    return scaleFormat[SCALE.M].replace("{v}", scaledData.toFixed(Number.isInteger(scaledData) ? 0 : 2));
  }

  if (scale >= 3) {
    scaledData = data / 1000;
    return scaleFormat[SCALE.K].replace("{v}", scaledData.toFixed(Number.isInteger(scaledData) ? 0 : 2));
  }

  return data;
};

export const LineAndVerticalBarChart: FC<LineAndVerticalBarChartProps> = ({
                                                                            className = "",
                                                                            series1 = [],
                                                                            series2 = [],
                                                                            series2Total = [],
                                                                            title = "",
                                                                            conf = {}

                                                                          }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<ITooltipTrendProps>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true
  });
  const getX = (d: DateValue) => d.date;
  const getY = (d: DateValue) => d.value;
  const ref = useRef(null);
  let scale = SCALE.N;
  const width = conf?.width ? conf?.width : defaultConfig.width;
  const height = conf?.height ? conf?.height : defaultConfig.height;
  const padding = {
    left: conf?.padding?.left ? conf?.padding?.left : defaultConfig.padding.left,
    right: conf?.padding?.right ? conf?.padding?.right : defaultConfig.padding.right,
    bottom: conf?.padding?.bottom ? conf?.padding?.bottom : defaultConfig.padding.bottom,
    top: conf?.padding?.top ? conf?.padding?.top : defaultConfig.padding.top

  };
  const disabledItems = conf?.disabledItems ? conf?.disabledItems : [];
  const colors = conf?.colors ? conf?.colors : null;
  const tickFormat = conf?.tickFormat ? {
    ...defaultConfig.tickFormat,
    ...conf?.tickFormat,
} : defaultConfig.tickFormat;
  const isScaled = conf?.isScaled ? conf?.isScaled : false;
  const scaleFormat = conf?.scaleFormat ? conf?.scaleFormat : {
    b: "",
    m: "",
    k: "",
    n: ""
  };

  const xAxisValues = Array.from(
    new Set(series1.reduce((result: any[], cur: any) => [...result, ...cur.data.map((d) => d?.date)], []))
  ).sort();

  const xScale = scaleBand<number>({
    domain: xAxisValues,
    paddingOuter: 0,
    paddingInner: 0,
    padding: 0.1
  });

  const y1AxisValues = series1.reduce((result: number[], cur: any) => [...result, ...cur.data.map((d) => d?.value)], []);

  const maxY1 = Math.max(...y1AxisValues.map((d) => Math.abs(d)));

  const y1Scale = scaleLinear<number>({
    domain: [0, maxY1],
    zero: true,
    nice: true,
    clamp: true
  });

  const y2AxisValues = series2Total.reduce((result: number[], cur: any) => [...result, cur.value], []);

  const maxY2 = Math.max(...y2AxisValues.map((d) => Math.abs(d)));

  const y2Scale = scaleLinear<number>({
    domain: [0, maxY2],
    zero: true,
    nice: true,
    clamp: true
  });

  const keys = ["value"];

  const getDate = (d) => d.date;

  xScale.range([padding.left, width - padding.right]);
  y1Scale.range([padding.left, width - padding.right]);
  y1Scale.range([height - 50, 50]);
  y2Scale.range([padding.left, width - padding.right]);
  y2Scale.range([height - 50, 50]);

  const highlight = (node, index) => {
    select(node.parentNode).raise();

    selectAll(`${className ? `.${className}` : ""} .data-point`).each(function() {
      (this as HTMLElement)?.classList.remove("highlight");
    });

    selectAll(`${className ? `.${className}` : ""} .data-point-${index}`).each(function() {
      (this as HTMLElement)?.classList.add("highlight");
    });
  };

  const directionScale = scaleBand<string>({
    domain: keys,
    padding: 0.1
  });

  const objectScale = scaleLinear<number>({
    domain: [0, maxY2],
    range: [50, height - 50]
  });

  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: colorsDefault
  });

  const keyAbbr = series2?.reduce(
    (result, d) => ({
      ...result,
      [d.key]: d.abbr
    }),
    {}
  );
  objectScale.range([height - 100, 0]);

  directionScale.rangeRound([0, xScale.bandwidth()]);

  return (
    <Styled>
      <svg className={className} width={width}
           height={height} style={{
        fontSize: width > 600 ? "1em" : "0.75em",
        overflow: "visible"
      }}>
        <g>
          <rect x={0} y={0} width={width} height={height} fill="#fff" />
          <Label x={5} y={25}>
            {title}
          </Label>
          {series2.length > 0 && (
            <Label x={width - padding.right / 2} y={25} textAnchor="end">
              {title}
            </Label>)}
        </g>

        <GridRows
          innerRef={ref}
          scale={y1Scale}
          width={width - padding.right - padding.left}
          strokeDasharray="2,2"
          top={0}
          left={padding.left}
          stroke="#d3d3d3"
        />
        <AxisLeft
          top={0}
          left={padding.left - 15}
          scale={y1Scale}
          stroke="transparent"
          hideTicks
          tickComponent={TickPlain}
          tickFormat={(v) => formatDataByScale(scaleFormat, v)}
        />

        {series2.length > 0 && (
          <AxisRight
            top={0}
            left={width - padding.right}
            scale={y2Scale}
            stroke="transparent"
            hideTicks
            tickComponent={TickPlain}
            tickFormat={(v) => formatDataByScale(scaleFormat, v)}
            labelProps={{ textAnchor: "end" }}
          />
        )}
        <AxisBottom
          top={height - padding.bottom}
          left={0}
          scale={xScale}
          stroke="transparent"
          tickComponent={TickYear}
          hideTicks
          numTicks={xAxisValues.length}
          tickFormat={(v: any) =>
            timeFormat(tickFormat?.date)(
              v.length === 6 ? new Date(v.substring(0, 4), parseInt(v.substring(4, 6)) - 1) : new Date(v)
            )
          }
          tickLabelProps={() => ({
            fill: "#000",
            fontSize: 11,
            textAnchor: "middle",
            width
          })}
        />
        <g className="group-2">
          <Group top={padding.top}>
            <BarGroup
              data={series2Total}
              keys={keys}
              height={height - 100}
              x0={getDate}
              x0Scale={xScale}
              x1Scale={directionScale}
              yScale={objectScale}
              color={colorScale}
            >
              {(barGroups) =>
                barGroups.map((barGroup) => (
                  <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
                    {barGroup.bars.map((bar) => (
                      <g
                        x={bar.x}
                        y={bar.y}
                        height={bar.height}
                        width={100}
                        key={`group-${barGroup.index}-${bar.index}`}
                      >
                        <Stack
                          keys={keys}
                          key={`stack-${barGroup.index}-${bar.index}`}
                          containerTop={bar.y}
                          containerLeft={bar.x}
                          containerHeight={bar.height}
                          containerWidth={50}
                          date={series2Total[barGroup.index]?.date}
                          colors={""}
                          dataKey={"value"}
                          value={bar.value}
                          onMouseLeave={() => {
                            tooltipTimeout = window.setTimeout(() => {
                              hideTooltip();
                            }, 300);
                          }}
                          onMouseMove={(event) => {
                            if (barGroup !== undefined) {
                              if (tooltipTimeout) clearTimeout(tooltipTimeout);
                              const eventSvgCoords = localPoint(event);
                              const left = eventSvgCoords ? eventSvgCoords?.x - bar.width / 2 : bar.x;

                              showTooltip({
                                tooltipData: {
                                  label: bar.key,
                                  date: series2Total[barGroup.index]?.date,
                                  value: bar.value,
                                  dataSeries: series2Total.map((d: any) => ({
                                    date: d?.date,
                                    value: parseFloat(d[bar.key]).toFixed(4)
                                  })),
                                  tickFormat,
                                  isScaled: isScaled,
                                  scale: scale,
                                  scaleFormat: scaleFormat
                                },
                                tooltipTop: eventSvgCoords?.y,
                                tooltipLeft: left
                              });
                            }
                          }}
                          series={series2}
                        />
                      </g>
                    ))}
                  </Group>
                ))
              }
            </BarGroup>
          </Group>
        </g>
        <g className="series-1">
          {series1 &&
          series1.map(({ data, label }, i) => (
            <DataGroup key={`g-line-path-${i}`}>
              <LinePath<DateValue>
                style={{
                  pointerEvents: disabledItems.includes(label) ? "none" : "stroke",
                  transition: "all 0.3s ease-out",
                  opacity: disabledItems.includes(label) ? 0 : 1,
                  filter: "drop-shadow( 1px 1px 1px rgba(0, 0, 0, .7))"
                }}
                key={`line-path-${i}`}
                className={`data-segment data-segment-${i}`}
                data={data}
                data-index={i}
                // @ts-ignore
                x={(d) => xScale(getX(d)) + xScale.bandwidth() / 2}
                y={(d) => y1Scale(getY(d) ?? 0)}
                curve={curveMonotoneX}
                stroke={colors !== null ? colors[label] : colorsDefault[i % 10]}
                strokeWidth={3}
                strokeLinecap="square"
                onMouseMove={(event) => {
                  event.preventDefault();
                  highlight(event.target, i);
                }}
              />
            </DataGroup>
          ))}
        </g>
        {series1 &&
        series1.map(({ data, label }, i) => (
          <g key={`g-segment-${i}&`}>
            {data.map((dp, j) => (
              <g
                key={`g-${i}&${j}`}
                style={{
                  pointerEvents: disabledItems.includes(label) ? "none" : "auto",
                  opacity: disabledItems.includes(label) ? 0 : 1
                }}
              >
                <circle
                  className={`data-point data-point-${i}`}
                  key={`${i}&${j}`}
                  r={6}
                  // @ts-ignore
                  cx={xScale(getX(dp)) + xScale.bandwidth() / 2}
                  cy={y1Scale(getY(dp))}
                  stroke="#fff"
                  strokeWidth={5}
                  fill={colors ? colors[label] : colorsDefault[i]}
                  onMouseLeave={(event) => {
                    tooltipTimeout = window.setTimeout(() => {
                      hideTooltip();
                    }, 300);
                  }}
                  onMouseMove={(event) => {
                    event.preventDefault();
                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                    const eventSvgCoords = localPoint(event);
                    // @ts-ignore
                    const left = xScale(getX(dp));

                    showTooltip({
                      tooltipData: {
                        label,
                        date: dp.date,
                        value: dp.value,
                        dataSeries: data,
                        tickFormat,
                        isScaled: isScaled,
                        scale: scale,
                        scaleFormat: scaleFormat
                      },
                      tooltipTop: eventSvgCoords?.y,
                      tooltipLeft: left
                    });
                  }}
                />
              </g>
            ))}
          </g>
        ))}
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, boxShadow: "none", padding: 0 }}
        >
          <Tooltip
            label={tooltipData.label}
            date={tooltipData.date}
            value={tooltipData.value}
            dataSeries={tooltipData.dataSeries}
            isScaled={isScaled}
            scale={scale}
            scaleFormat={scaleFormat}
            tickFormat={tickFormat}
          />
        </TooltipInPortal>
      )}
    </Styled>
  );
};

export default LineAndVerticalBarChart;
