import React, { FC, useRef } from "react";
import styled from "styled-components";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { GridColumns } from "@visx/grid";
import { defaultConfig } from "../../../helpers";
import { Label } from "../../Axes";
import { AxisLeft, AxisTop } from '@visx/axis';
import { DateValue } from "../LineChart";
import { defaultStyles, useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { TooltipContentProps } from '../../Tooltips/ToolipContent';
import { BarStackHorizontal } from "@visx/shape";
import { Group } from "@visx/group";
import { localPoint } from "@visx/event";


export interface BarBellChartProps {
  className: string;
  series: any[];
  title: string | React.ReactNode;
  conf: {
    axes?: any;
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
    tooltipContent?: any;
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


let tooltipTimeout: number;

export const BarBellChart: FC<BarBellChartProps> = ({
                                                      className = "",
                                                      series = [],
                                                      conf = {}

                                                    }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipContentProps>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true
  });
  const getX = (d: DateValue) => d.value;
  const getY = (d: any) => d.date;
  const ref = useRef(null);
  const width = conf?.width ? conf?.width : defaultConfig.width;
  const height = conf?.height ? conf?.height : defaultConfig.height;
  const padding = {
    left: conf?.padding?.left ? conf?.padding?.left : defaultConfig.padding.left,
    right: conf?.padding?.right ? conf?.padding?.right : defaultConfig.padding.right,
    bottom: conf?.padding?.bottom ? conf?.padding?.bottom : defaultConfig.padding.bottom,
    top: conf?.padding?.top ? conf?.padding?.top : defaultConfig.padding.top

  };
  const disabledItems = conf?.disabledItems ? conf?.disabledItems : [];
  const colors = conf.colors || [];

  const xAxisKeys = Array.from(new Set(series.reduce((result: number[], cur: any) => [...result, ...cur.data.map(d => Math.ceil(d?.date))], [])));
  const xAxisValuesFlatten = series.reduce((result: number[], cur: any) => [...result, ...cur.data.map(d => ({ [d.date]: Math.ceil(d?.value) }))], []);
  const xAxisValuesFlatten1 = series.reduce((result: number[], cur: any) => [...result, ...cur.data.map(d => ({
    date: d.date,
    [cur.label]: Math.ceil(d?.value)
  }))
  ], []);

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
          {width > 0 && <rect x={0} y={0} width={width} height={height} fill="#fff" />}
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
          tickComponent={(v) => {
            if (!conf?.axes?.x?.tickComponent) {
              const { formattedValue, ...otherProps } = v;
              return <text {...otherProps}>{formattedValue}</text>;
            }
            return <text dangerouslySetInnerHTML={{__html: conf?.axes?.x?.tickComponent(v)}}/>
          }}
          tickFormat={(v) => conf?.axes?.x?.formatter ? conf?.axes?.x?.formatter(v) : v}
        />

        <AxisLeft
          top={0}
          left={padding.left - 15}
          scale={yScale}
          stroke="transparent"
          hideTicks
          numTicks={yAxisValues.length}
          tickFormat={(v) => conf?.axes?.y?.formatter ? conf?.axes?.y?.formatter(v) : v}
          tickComponent={(v) => {
            if (!conf?.axes?.y?.tickComponent) {
              const { formattedValue, ...otherProps } = v;
              return <text {...otherProps}>{formattedValue}</text>;
            }
            return <text dangerouslySetInnerHTML={{__html: conf?.axes?.y?.tickComponent(v)}}/>
          }}
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
                               item: {
                                 label: bar.key,
                                 date: bar.bar.data.date,
                                 value: bar.bar.data[bar.key],
                               },
                               series: series,
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
                  {bar.width > 0 && <rect
                      x={bar.x}
                      y={bar.y + bar.height / 2 - 5}
                      width={bar.width}
                      height={2}
                      fill={bar.color}

                    />
                  }
                  </Group>
                ))
              )
            }
          </BarStackHorizontal>
        </Group>
      </svg>
      {tooltipOpen && tooltipData && conf?.tooltipContent && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, boxShadow: 'none', padding: 0 }}
        >
          {/*// @ts-ignore*/}
          <div dangerouslySetInnerHTML={{ __html: conf?.tooltipContent(tooltipData) }} />
        </TooltipInPortal>
      )}
    </Styled>
  );
};

export default BarBellChart;
