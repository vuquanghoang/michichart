import React, { FC, useRef } from "react";
import styled from "styled-components";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { GridColumns } from "@visx/grid";
import { defaultConfig } from "../../../helpers";
import { Label, TickPlain, TickYear } from "../../Axes";
import { AxisLeft, AxisTop } from "@visx/axis";
import { DateValue } from "../LineChart";
import { select, selectAll } from "d3-selection";
import { defaultStyles, useTooltip, useTooltipInPortal } from "@visx/tooltip";
import Tooltip, { ITooltipTrendProps } from "../../Tooltips/TooltipTrendv2";
import { timeFormat } from "d3-time-format";
import { BarStackHorizontal } from "@visx/shape";
import { Group } from "@visx/group";
import { localPoint } from "@visx/event";


export interface BarBellChartProps {
  className: string;
  series: any[];
  title: string | React.ReactNode;
  conf: {
    keys: string[],
    width?: number,
    height?: number,
    padding: {
      top: number,
      right: number,
      bottom: number,
      left: number,
    },
    axesLabel: {
      x: string | React.ReactNode;
    },
    scaleFormat: {
      b: string,
      m: string,
      k: string,
      n: string,
      date?: string,
    },
    precision: number;
    colors: object[];
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
    // opacity: 0;
    // pointer-events: none;
    // transition: opacity 0.2s ease-in-out, stroke-width 0.1s ease-in-out;

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

export const BarBellChart: FC<BarBellChartProps> = ({
                                                      className = "",
                                                      series = [],
                                                      conf = {}

                                                    }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<ITooltipTrendProps>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true
  });
  const getX = (d: DateValue) => d.value;
  const getY = (d: any) => d.date;
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
  const colors = conf.colors || [];

  const xAxisKeys = Array.from(new Set(series.reduce((result: number[], cur: any) => [...result, ...cur.data.map(d => Math.ceil(d?.date))], [])));
  const xAxisValuesFlatten = series.reduce((result: number[], cur: any) => [...result, ...cur.data.map(d => ({ [d.date]: Math.ceil(d?.value) }))], []);
  const xAxisValuesFlatten1 = series.reduce((result: number[], cur: any) => [...result, ...cur.data.map(d => ({
    date: d.date,
    [cur.label]: Math.ceil(d?.value)
  }))
  ], []);

  const precision = conf.precision ?? 2;

  const data = xAxisValuesFlatten1.reduce((result: any, cur: any) => {
    if (result?.[Object.keys(cur)[0]]) {
      return result;
    }

    return [
      ...result,
      {
        date: Object.keys(cur)[0],
        ...xAxisValuesFlatten1.filter(d => d.date === Object.values(cur)[0]).reduce((r, c) => ({ ...r, ...c }), {})
      }
    ];

  }, []);

  // get summary value based on date
  const xAxisValues = Object.values(xAxisValuesFlatten.reduce((result: any, cur: any) => {
    if (result?.[Object.keys(cur)[0]]) {
      return result;
    }

    return {
      ...result,
      [Object.keys(cur)[0]]: (xAxisValuesFlatten.filter(d => {
        return Object.keys(d)[0] === Object.keys(cur)[0];
      })).reduce((sum: number, d: object) => sum + parseFloat(Object.values(d)[0]), 0)
    };
  }, {}));

  const xScale = scaleLinear<number>({
    // @ts-ignore
    domain: [Math.min(...xAxisValues), Math.max(...xAxisValues)],
    zero: true,
    nice: true,
    clamp: true
  });

  const yAxisValues = Array.from(
    new Set(series.reduce((result: any[], cur: any) => [...result, ...cur.data.map((d) => parseInt(d?.date))], []))
  )
    .sort();

  const yScale = scaleBand<number>({
    domain: yAxisValues,
    paddingOuter: 0,
    paddingInner: 0,
    padding: 0.1
  });

  xScale.range([padding.left, width - padding.right]);
  yScale.range([padding.bottom, height]);

  const colorScale = scaleOrdinal<string, string>({
    domain: colors.map(d => Object.keys(d)[0]),
    range: colors.map(d => Object.values(d)[0])
  });

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
          {conf?.axesLabel?.x && (
            <Label x={5} y={padding.top - 8}>
              {conf?.axesLabel?.x}
            </Label>
          )}
        </g>

        <GridColumns
          innerRef={ref}
          scale={xScale}
          width={width}
          strokeDasharray="2,2"
          top={padding.top}
          left={padding.left}
          stroke="#d3d3d3"
          height={height - padding.top}
        />

        <AxisTop
          top={padding.top}
          left={padding.left}
          scale={xScale}
          stroke="transparent"
          hideTicks
          tickComponent={TickPlain}
          tickFormat={(v) => formatDataByScale(scaleFormat, v)}
        />

        <AxisLeft
          top={0}
          left={padding.left - 15}
          scale={yScale}
          stroke="transparent"
          tickComponent={(props) => <TickYear dotAlignment={"right"} {...props} />}
          hideTicks
          numTicks={yAxisValues.length}
          tickFormat={(v: any) => {
            const formattedV = v.toString();
            return timeFormat(tickFormat?.date)(
              formattedV.length === 6 ? new Date(formattedV.substring(0, 4), parseInt(formattedV.substring(4, 6)) - 1) : new Date(formattedV)
            );
          }}
          tickLabelProps={() => ({
            fill: "#000",
            fontSize: 11,
            textAnchor: "middle",
            width
          })}
        />

        <Group top={0} left={padding.left}>
          // @ts-ignore
          <BarStackHorizontal data={data} keys={conf.keys} color={colorScale} xScale={xScale} y={getY} yScale={yScale}
                              left={padding.left} width={width}>
            {barStacks =>
              barStacks.map(barStack =>
                barStack.bars.map(bar => (
                  <Group key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                         onMouseMove={(event) => {
                           event.preventDefault();
                           if (tooltipTimeout) clearTimeout(tooltipTimeout);
                           const eventSvgCoords = localPoint(event);
                           // @ts-ignore
                           const left = xScale(bar.x);

                           showTooltip({
                             tooltipData: {
                               label: bar.key,
                               date: bar.bar.data.date,
                               // date:
                                 // bar.bar.data.date.length === 6 ? new Date(bar.bar.data.date.substring(0, 4), parseInt(bar.bar.data.date.substring(4, 6)) - 1) : new Date(bar.bar.data.date),
                               // ),
                               value: bar.bar.data[bar.key],
                               dataSeries: series.find(d => d.label === bar.key).data,
                               tickFormat,
                               isScaled: isScaled,
                               scale: scale,
                               scaleFormat: scaleFormat,

                             },
                             tooltipTop: eventSvgCoords?.y,
                             tooltipLeft: eventSvgCoords?.x
                           });
                         }}
                         onMouseLeave={() => {
                           tooltipTimeout = window.setTimeout(() => {
                             hideTooltip();
                           }, 300);
                         }}
                  >
                  {bar.width > 0 && <circle cx={bar.x} cy={bar.y + bar.height / 2 - 5} r={5} fill={bar.color} />}
                    <rect
                      x={bar.x}
                      y={bar.y + bar.height / 2 - 5}
                      width={bar.width}
                      height={2}
                      fill={bar.color}

                      // onMouseMove={() => {}
                    />
                  </Group>
                ))
              )
            }
          </BarStackHorizontal>
        </Group>
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
            precision={precision}
          />
        </TooltipInPortal>
      )}
    </Styled>
  );
};

export default BarBellChart;
