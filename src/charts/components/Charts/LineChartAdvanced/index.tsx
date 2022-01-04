import React, { FC, useRef } from "react";
import styled from "styled-components";
import { scaleBand, scaleLinear } from "@visx/scale";
import { GridRows } from "@visx/grid";
import { defaultConfig, getPolygonString } from "../../../helpers";
import { Label, TickPlain, TickYear } from "../../Axes";
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis";
import { LinePath } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import colorsDefault from "../../../constants/colors";
import { localPoint } from "@visx/event";
import { DateValue } from "../LineChart";
import { select, selectAll } from "d3-selection";
import { defaultStyles, useTooltip, useTooltipInPortal } from "@visx/tooltip";
import Tooltip, { ITooltipTrendProps } from "../../Tooltips/TooltipTrendv2";
import { timeFormat } from "d3-time-format";
import Cross from "../../DataPoint/Cross";

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
    axesLabel: {
      y1: string | React.ReactNode;
      y2: string | React.ReactNode;
    },
    scaleFormat: {
      b: string,
      m: string,
      k: string,
      n: string,
    },
    colors: object;
    disabledItems: string[];
    tickFormat: object;
    isScaled: boolean;
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
      storke-opacity: 0.9;
      pointer-events: auto;
    }

    &-cross {
      &.highlight {
        stroke-width: 3px;
      }
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

export const LineChartAdvanced: FC<LineAndVerticalBarChartProps> = ({
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
  const tickFormat = conf?.tickFormat ? {
    ...defaultConfig.tickFormat,
    ...conf?.tickFormat
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
  const y2AxisValues = series2.reduce((result: number[], cur: any) => [...result, ...cur.data.map((d) => d?.value)], []);

  const maxY1 = Math.max(...y1AxisValues.map((d) => Math.abs(d)));
  const maxY2 = Math.max(...y2AxisValues.map((d) => Math.abs(d)));

  const y1Scale = scaleLinear<number>({
    domain: [0, maxY1],
    zero: true,
    nice: true,
    clamp: true,
  });

  const y2Scale = scaleLinear<number>({
    domain: [0, maxY2],
    zero: true,
    nice: true,
    clamp: true,
  });

  xScale.range([padding.left, width - padding.right]);
  y1Scale.range([height - 50, 50]);
  y2Scale.range([height - 50, 50]);


  const highlight = (node, index) => {
    select(node.parentNode).raise();
    select(node.parentNode.parentNode).raise();

    selectAll(`${className ? `.${className}` : ""} .data-point`).each(function() {
      (this as HTMLElement)?.classList.remove("highlight");
    });

    selectAll(`${className ? `.${className}` : ""} .data-point-${index}`).each(function() {
      (this as HTMLElement)?.classList.add("highlight");
    });
  };


  // @ts-ignore
  return (
    <Styled>
      <svg
        className={className}
        width={width}
         height={height} style={{
        fontSize: width > 600 ? "1em" : "0.75em",
        overflow: "visible"
      }}
       ref={containerRef}
      >
        <g>
          <rect x={0} y={0} width={width} height={height} fill="#fff" />
          {conf?.axesLabel?.y1 && (
            <Label x={5} y={25}>
              {conf?.axesLabel?.y1}
            </Label>
          )}

          {conf?.axesLabel?.y2 && (
            <Label x={width - padding.right / 2} y={25} textAnchor="end">
              {conf?.axesLabel?.y2}
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
          numTicks={Math.min(Math.max(y1AxisValues.length, y2AxisValues.length), 7)}
        />

        {series2.length > 0 && (
          <AxisRight
            top={0}
            left={width - padding.right + 15}
            scale={y2Scale}
            stroke="transparent"
            hideTicks
            tickComponent={TickPlain}
            tickFormat={(v) => formatDataByScale(scaleFormat, v)}
            numTicks={Math.min(Math.max(y1AxisValues.length, y2AxisValues.length), 7)}
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
        {series1 &&
          series1.map(({ data, label, color, dataPoint: { visibility, shape } }, i) => (
            <g key={`g-lined-path-${i}`}>
              <DataGroup key={`g-line-path-${i}`}>
                <LinePath<DateValue>
                  style={{
                    pointerEvents: disabledItems.includes(label) ? "none" : "stroke",
                    transition: "all 0.3s ease-out",
                    opacity: disabledItems.includes(label) ? 0 : 1
                  }}
                  key={`line-path-${i}`}
                  className={`data-segment data-segment-${i}-1`}
                  data={data}
                  data-index={i}
                  // @ts-ignore
                  x={(d) => xScale(getX(d)) + xScale.bandwidth() / 2}
                  y={(d) => y1Scale(getY(d) ? y1Scale(getY(d)) : 0)}
                  curve={curveMonotoneX}
                  stroke={color !== null ? color : colorsDefault[i % 10]}
                  strokeWidth={3}
                  strokeLinecap="square"
                  onMouseMove={(event) => {
                    event.preventDefault();
                    highlight(event.target, `${i}-1`);
                  }}
                />
                <g key={`g-segment-${i}`} className="e1235"
                   style={{
                     pointerEvents: disabledItems.includes(label) ? "none" : "auto",
                     opacity: disabledItems.includes(label) ? 0 : 1
                   }}
                >
                  {data.map((dp, j) => (
                    <g
                      key={`g-${i}&${j}`}
                      style={{
                        pointerEvents: disabledItems.includes(label) ? "none" : "auto",
                        opacity: disabledItems.includes(label) ? 0 : 1
                      }}
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
                            label: `${label} - ${conf?.axesLabel?.y1}`,
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
                    >
                      {shape === "circle" && (
                        <circle
                          className={`data-point data-point-${i}-1`}
                          key={`${i}&${j}`}
                          r={6}
                          // @ts-ignore
                          cx={xScale(getX(dp)) + xScale.bandwidth() / 2}
                          cy={y1Scale(getY(dp))}
                          stroke="#fff"
                          strokeOpacity={0.9}
                          strokeWidth={5}
                          fill={color ? color : colorsDefault[i]}

                        />
                      )}
                      {shape === "rect" && (
                        <rect
                          className={`data-point data-point-rect data-point-${i}-1`}
                          key={`${i}&${j}`}
                          // @ts-ignore
                          x={xScale(getX(dp)) + xScale.bandwidth() / 2 - 6}
                          y={y1Scale(getY(dp)) - 6}
                          width={12}
                          height={12}
                          strokeWidth={5}
                          stroke="#fff"
                          strokeOpacity={0.9}
                          fill={color ? color : colorsDefault[i]}
                        />
                      )}
                      {shape === "triangle" && (
                        <polygon
                          // @ts-ignore
                          points={getPolygonString(xScale(getX(dp)) + xScale.bandwidth() / 2, y1Scale(getY(dp)), 6)}
                          strokeWidth={4}
                          stroke="#fff"
                          strokeOpacity={0.9}
                          fill={color ? color : colorsDefault[i]}
                          className={`data-point data-point-triangle data-point-${i}-1`} />
                      )}
                      {shape === "cross" && (
                        // @ts-ignore
                        <Cross x={xScale(getX(dp)) + xScale.bandwidth() / 2}
                               y={y1Scale(getY(dp))}
                               size={6}
                               strokeWidth={3}
                               color={color ? color : colorsDefault[i]}
                               className={`data-point data-point-cross data-point-${i}-1`}

                        />
                      )}
                    </g>
                  ))}
                </g>
              </DataGroup>

            </g>
          ))}
        {series2 &&
          series2.map(({ data, label, color, dataPoint: { visibility, shape } }, i) => (
            <g key={`g-lined-path-${i}`}>
              <DataGroup key={`g-line-path-${i}`}>
                <LinePath<DateValue>
                  style={{
                    pointerEvents: disabledItems.includes(label) ? "none" : "stroke",
                    transition: "all 0.3s ease-out",
                    opacity: disabledItems.includes(label) ? 0 : 1
                  }}
                  key={`line-path-${i}`}
                  className={`data-segment data-segment-${i}`}
                  data={data}
                  data-index={i}
                  // @ts-ignore
                  x={(d) => xScale(getX(d)) + xScale.bandwidth() / 2}
                  y={(d) => y2Scale(getY(d) ?? 0)}
                  curve={curveMonotoneX}
                  stroke={color !== null ? color : colorsDefault[i % 10]}
                  strokeWidth={3}
                  strokeLinecap="square"
                  onMouseMove={(event) => {
                    event.preventDefault();
                    highlight(event.target, `${i}-2`);
                  }}
                />
                <g key={`g-segment-${i}&`}
                   style={{
                     pointerEvents: disabledItems.includes(label) ? "none" : "auto",
                     opacity: disabledItems.includes(label) ? 0 : 1
                   }}>
                  {data.map((dp, j) => (
                    <g
                      key={`g-${i}&${j}`}
                      style={{
                        pointerEvents: disabledItems.includes(label) ? "none" : "auto",
                        opacity: disabledItems.includes(label) ? 0 : 1
                      }}
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
                            label: `${label} - ${conf?.axesLabel?.y2}`,
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
                    >
                      {shape === "circle" && (
                        <circle
                          className={`data-point data-point-${i}-2`}
                          key={`${i}&${j}`}
                          r={6}
                          // @ts-ignore
                          cx={xScale(getX(dp)) + xScale.bandwidth() / 2}
                          cy={y2Scale(getY(dp))}
                          stroke="#fff"
                          strokeOpacity={0.9}
                          strokeWidth={5}
                          fill={color ? color : colorsDefault[i]}

                        />
                      )}
                      {shape === "rect" && (
                        <rect
                          className={`data-point data-point-rect data-point-${i}-2`}
                          key={`${i}&${j}`}
                          // @ts-ignore
                          x={xScale(getX(dp)) + xScale.bandwidth() / 2 - 6}
                          y={y2Scale(getY(dp)) - 6}
                          width={12}
                          height={12}
                          strokeWidth={5}
                          strokeOpacity={0.9}
                          stroke="#fff"
                          fill={color ? color : colorsDefault[i]}
                        />
                      )}
                      {shape === "triangle" && (
                        <polygon
                          // @ts-ignore
                          points={getPolygonString(xScale(getX(dp)) + xScale.bandwidth() / 2, y2Scale(getY(dp)), 6)}
                          strokeWidth={4}
                          stroke="#fff"
                          strokeOpacity={0.9}
                          fill={color ? color : colorsDefault[i]}
                          className={`data-point data-point-triangle data-point-${i}-2`} />
                      )}
                      {shape === "cross" && (
                        // @ts-ignore
                        <Cross x={xScale(getX(dp)) + xScale.bandwidth() / 2}
                               y={y1Scale(getY(dp))}
                               size={6}
                               strokeWidth={1}
                               color={color ? color : colorsDefault[i]}
                               className={`data-point data-point-cross data-point-${i}-2`}
                        />
                      )}
                    </g>
                  ))}
                </g>
              </DataGroup>
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

export default LineChartAdvanced;
