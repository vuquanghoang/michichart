import React, { FC, useRef } from 'react';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import styled from 'styled-components';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { select } from 'd3-selection';
import colorsDefault from '../../../constants/colors';
import { Label } from '../../Axes';
import { TooltipContentProps } from '../../Tooltips/ToolipContent';
import { defaultConfig } from '../../../helpers';
import { CLASS_NAME } from '../../../constants/utils';

export interface DateValue {
  date: Date | string;
  value: number;
}

export interface LineChartProps {
  className: string;
  series: any[];
  tickFormat: { value: string; date: string };
  title: string | React.ReactNode;
  width: number;
  height: number;
  padding: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  } | null;
  colors: string[] | null;
  domainAxisX: number[] | null;
  domainAxisY: number[] | null;
  showAxisX: boolean;
  showAxisY: boolean;
  stretching: boolean;
  minifyAxisX: boolean;
  minifyAxisY: boolean;
  hideNegativeAxisY: boolean;
  disabledItems: string[];
  conf?: any;
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

let tooltipTimeout: number;

export const LineChart: FC<LineChartProps> = ({
  className = '',
  series = [],
  title = '',
  height = defaultConfig.height,
  width = defaultConfig.width,
  colors = null,
  padding = null,
  domainAxisX = null,
  domainAxisY = null,
  showAxisX = true,
  showAxisY = true,
  stretching = true,
  minifyAxisX = false,
  minifyAxisY = false,
  hideNegativeAxisY = false,
  disabledItems = [],
  conf = {},
}) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipContentProps>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  const refinedPadding = padding ? { ...defaultConfig.padding, ...padding } : { ...defaultConfig.padding };

  const getX = (d: DateValue) => d.date;
  const getY = (d: DateValue) => d.value;

  const yAxisValues = series.reduce((result: number[], cur: any) => [...result, ...cur.data.map((d) => d?.value)], []);

  const xAxisValues = Array.from(
    new Set(series.reduce((result: any[], cur: any) => [...result, ...cur.data.map((d) => d?.date)], [])),
  ).sort();

  const xScale = scaleBand<number>({
    domain: domainAxisX || xAxisValues,
    paddingOuter: 0,
    paddingInner: stretching ? 1 : 0,
    padding: 0.1,
  });

  const maxY = Math.max(...yAxisValues.map((d) => Math.abs(d)));

  const yScale = scaleLinear<number>({
    domain: domainAxisY || (hideNegativeAxisY ? [0, maxY] : [maxY * -1, maxY]),
    zero: true,
    nice: true,
    clamp: true,
  });

  const ref = useRef(null);

  xScale.range([refinedPadding.left, width - refinedPadding.right]);
  yScale.range([height - 50, 50]);

  const highlight = (node, index) => {
    const root = node.closest('svg');

    select(node.parentNode).raise();
    Array.from(root.querySelectorAll('.data-point')).forEach(el => (el as HTMLElement).classList.remove(CLASS_NAME.HIGHLIGHT));
    Array.from(root.querySelectorAll(`.data-point-${index}`)).forEach(el => (el as HTMLElement).classList.add(CLASS_NAME.HIGHLIGHT));
  };

  const resetHighlight = (node) => {
    const root = node.closest('svg');

    Array.from(root.querySelectorAll('.data-point')).forEach(el => (el as HTMLElement).classList.remove(CLASS_NAME.HIGHLIGHT));
  };

  // @ts-ignore

  return (
    <Styled>
      <svg
        className={className}
        ref={containerRef}
        width={width}
        height={height}
        style={{
          fontSize: width > 600 ? '1em' : '0.75em',
          overflow: 'visible',
        }}
        onMouseLeave={event => resetHighlight(event.target as HTMLElement)}
      >
        <g ref={ref}>
          {width> 0 && height> 0 && <rect x={0} y={0} width={width} height={height} fill="#fff" />}
          <Label x={5} y={25}>
            {title}
          </Label>

          <GridRows
            innerRef={ref}
            scale={yScale}
            width={width - refinedPadding.right - refinedPadding.left}
            strokeDasharray="2,2"
            top={0}
            left={refinedPadding.left}
            stroke="#d3d3d3"
          />

          <GridRows
            className="base-line"
            scale={yScale}
            width={width - refinedPadding.right - refinedPadding.left}
            top={0}
            left={refinedPadding.left}
            stroke="#000000"
            strokeWidth={1}
            strokeDasharray="none"
            tickValues={[0]}
          />

          {showAxisY && (
            <AxisLeft
              top={0}
              left={refinedPadding.left - 15}
              scale={yScale}
              stroke="transparent"
              hideTicks
              tickFormat={(v) => conf?.axes?.y?.formatter ? conf?.axes?.y?.formatter(v, yScale.ticks()) : v}
              tickComponent={(v) => {
                if (!conf?.axes?.y?.tickComponent) {
                  const { formattedValue, ...otherProps } = v;
                  return <text {...otherProps}>{formattedValue}</text>;
                }
                return <text dangerouslySetInnerHTML={{__html: conf?.axes?.y?.tickComponent(v)}}/>
              }}
            />
          )}

          {showAxisX && (
            <AxisBottom
              top={height - refinedPadding.bottom}
              left={0}
              scale={xScale}
              stroke="transparent"
              hideTicks
              numTicks={minifyAxisX ? undefined : xAxisValues.length}
              tickComponent={(v) => {
                if (!conf?.axes?.x?.tickComponent) {
                  const { formattedValue, ...otherProps } = v;
                  return <text {...otherProps}>{formattedValue}</text>;
                }
                return <text dangerouslySetInnerHTML={{__html: conf?.axes?.x?.tickComponent(v)}}/>
              }}
              tickFormat={(v) => conf?.axes?.x?.formatter ? conf?.axes?.x?.formatter(v) : v}
            />
          )}

          {series &&
            series.map(({ data, label }, i) => (
              <DataGroup key={`g-line-path-${i}`}>
                <LinePath<DateValue>
                  style={{
                    pointerEvents: disabledItems.includes(label) ? 'none' : 'stroke',
                    transition: 'all 0.3s ease-out',
                    opacity: disabledItems.includes(label) ? 0 : 1,
                  }}
                  key={`line-path-${i}`}
                  className={`data-segment data-segment-${i}`}
                  data={data}
                  data-index={i}
                  // @ts-ignore
                  x={(d) => xScale(getX(d)) + xScale.bandwidth() / 2}
                  y={(d) => yScale(getY(d) ?? 0)}
                  curve={curveMonotoneX}
                  stroke={colors !== null ? colors[label] : colorsDefault[i]}
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
        {series &&
          series.map(({ data, label }, i) => (
            <g key={`g-segment-${i}`}>
              {data.map((dp, j) => (
                <g
                  key={`g-${i}&${j}`}
                  style={{
                    pointerEvents: disabledItems.includes(label) ? 'none' : 'auto',
                    opacity: disabledItems.includes(label) ? 0 : 1,
                  }}
                >
                  <circle
                    className={`data-point data-point-${i}`}
                    key={`${i}&${j}`}
                    r={6}
                    // @ts-ignore
                    cx={xScale(getX(dp)) + xScale.bandwidth() / 2}
                    cy={yScale(getY(dp))}
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
                        // @ts-ignore
                        tooltipData: {
                          item: {
                            label,
                            date: dp.date,
                            value: dp.value,
                          },
                          series: data,
                        },
                        tooltipTop: eventSvgCoords?.y,
                        tooltipLeft: left,
                      });
                    }}
                  />
                </g>
              ))}
            </g>
          ))}
      </svg>
      {tooltipOpen && tooltipData && conf?.tooltipContent && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, boxShadow: 'none', padding: 0 }}
        >
          <div dangerouslySetInnerHTML={{ __html: conf.tooltipContent(tooltipData) }} />
        </TooltipInPortal>
      )}
    </Styled>
  );
};
