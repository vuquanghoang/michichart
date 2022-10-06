import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AreaStack } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { defaultConfig } from '../../../helpers';
import { Label } from '../../Axes';
import { TooltipContentProps } from '../../Tooltips/ToolipContent';
import { extent } from 'd3-array';
import sum from 'lodash/sum';
import { SeriesPoint } from 'd3-shape';

const Styled = styled.div`
  contain: layout;
`;

const Area = styled.path`
  stroke: #fff;
  stroke-width: 1px;
  transition: opacity 0.1s ease-in-out;

  &.disabled {
    opacity: 0.2;
  }
`;

const DataPoints = styled.g`
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
  pointer-events: none;

  &.highlighted {
    opacity: 1;
    pointer-events: auto;
  }
`;

const DataPoint = styled.rect`
  stroke: rgba(255, 255, 255, 1);
  stroke-width: 5px;
  stroke-opacity: 0;
  fill: #fff;
`;

let tooltipTimeout: number;

export interface AreaChartProps {
  seriesData: Record<string, any>[];
  className: string;
  width: number;
  height: number;
  padding: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  domainAxisX?: number[] | null;
  domainAxisY?: number[] | null;
  showAxisX: boolean;
  showAxisY: boolean;
  title?: string | ReactNode | null;
  tickFormat: { value: string; date: string; currency?: string };
  tooltip: string | ReactNode | null;
  tooltipDefaultStyle: boolean;
  dataKeys: string[];
  colors: Record<string, string>;
  isScaled: boolean;
  scaleFormat: {
    b: string;
    m: string;
    k: string;
    n: string;
  };
  conf?: any;
}


export const AreaChart: FC<AreaChartProps> = ({
                                                className = '',
                                                width = 900,
                                                height = 500,
                                                seriesData = [],
                                                padding = {},
                                                domainAxisY = null,
                                                domainAxisX = null,
                                                title = '',
                                                showAxisX = true,
                                                showAxisY = true,
                                                tickFormat = {
                                                  ...defaultConfig.tickFormat,
                                                  value: '{v}%',
                                                },
                                                dataKeys = [],
                                                colors = {},
                                                conf = {},
                                              }) => {
  const config = {
    padding: {
      ...defaultConfig.padding,
      ...padding,
    },
  };
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipContentProps>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  const getDate = (d: SeriesPoint<Record<string, any>>) => d.data.date;
  // @ts-ignore
  const getY0 = (d) => d[0];
  const getY1 = (d: any[]) => d[1];
  const xAxisValues = seriesData.map((d) => d.date);
  const yAxisValues = seriesData
    .map((d) => {
      const temp = { ...d };
      delete temp.date;
      return Object.values(temp);
    })
    .reduce((r, cur) => [...r, sum(cur)], []);


  const highlightArea = (e: any, key: string) => {
    const parentNode: HTMLElement = e.target.parentNode as HTMLElement;
    const areas: NodeListOf<SVGPathElement> = parentNode.querySelectorAll('path');
    const dataPointsGroups: NodeListOf<SVGCircleElement> = parentNode.querySelectorAll('.data-points');

    Array.from(areas).forEach((area) => {
      if (area.isSameNode(e.target)) {
        area.classList.remove('disabled');
        area.classList.add('highlighted');
      } else {
        area.classList.remove('highlighted');
        area.classList.add('disabled');
      }
    });

    Array.from(dataPointsGroups).forEach((group) => {
      if (group.classList.contains(`data-points-${key}`)) {
        group.classList.add('highlighted');
      } else {
        group.classList.remove('highlighted');
      }
    });
  };

  const resetHighlightArea = (e: any) => {
    const svgEl = e.currentTarget as SVGElement;

    Array.from(svgEl.querySelectorAll('.area-data')).forEach((area) => {
      area.classList.remove('disabled');
    });

    Array.from(svgEl.querySelectorAll('.data-points')).forEach((area) => {
      area.classList.remove('highlighted');
    });
  };

  const xScale = scaleBand<number>({
    domain: domainAxisX || xAxisValues,
    paddingOuter: 0,
    paddingInner: 1,
    padding: 0.1,
    range: [config.padding.left, width - config.padding.right],
  });


  const yScale = scaleLinear<number>({
    // @ts-ignore
    domain: extent(domainAxisY || yAxisValues),
    zero: true,
    nice: true,
    clamp: true,
    range: [height - config.padding.bottom, config.padding.top],
  });

  return (
    <Styled>
      <svg
        ref={containerRef}
        className={className}
        width={width}
        height={height}
        onMouseLeave={(e) => resetHighlightArea(e)}
        style={{ overflow: 'visible' }}
      >
        <rect x={0} y={0} width={width} height={height} fill="#fff" style={{ pointerEvents: 'none' }} />
        <Label x={5} y={25}>
          {title}
        </Label>
        {showAxisY && (
          <AxisLeft
            top={0}
            left={30}
            scale={yScale}
            stroke="transparent"
            hideTicks
            tickFormat={(v) => conf?.axes?.y?.formatter ? conf?.axes?.y?.formatter(v) : v}
            tickComponent={(v) => {
              if (!conf?.axes?.y?.tickComponent) {
                const { formattedValue, ...otherProps } = v;
                return <text {...otherProps}>{formattedValue}</text>;
              }
              return conf?.axes?.y?.tickComponent(v)
            }
            }
          />
        )}
        {showAxisX && (
          <AxisBottom
            top={height - 50}
            left={0}
            scale={xScale}
            stroke="transparent"
            hideTicks
            tickComponent={(v) => {
              if (!conf?.axes?.x?.tickComponent) {
                const { formattedValue, ...otherProps } = v;
                return <text {...otherProps}>{formattedValue}</text>;
              }
              return conf?.axes?.x?.tickComponent(v)
            }}
            tickFormat={(v) => conf?.axes?.x?.formatter ? conf?.axes?.x?.formatter(v) : v}
          />
        )}
        <GridRows
          scale={yScale}
          width={width - config.padding.right - config.padding.left + 10}
          strokeDasharray="2,2"
          top={0}
          left={config.padding.left - 5}
          stroke="#d3d3d3"
        />
        <g>
          <AreaStack
            curve={curveMonotoneX}
            top={config.padding.top}
            left={config.padding.left}
            keys={dataKeys}
            data={seriesData}
            x={(d) => xScale(getDate(d)) ?? 0}
            y0={(d) => yScale(getY0(d)) ?? 0}
            y1={(d) => yScale(getY1(d)) ?? 0}
          >
            {({ stacks, path }) => (
              <>
                {stacks.map((stack) => (
                  <Area
                    className="area-data"
                    key={`stack-${stack.key}`}
                    d={path(stack) || ''}
                    fill={colors[stack.key]}
                    onMouseMove={(e) => highlightArea(e, stack.key.replaceAll(' ', '-').toLowerCase())}
                  />
                ))}

                {stacks.map((stack) => (
                  <DataPoints
                    className={`data-points data-points-${stack.key.replaceAll(' ', '-').toLowerCase()}`}
                    key={`stack-group-${stack.key}`}
                  >
                    {stack.map((point, i) => (
                      <DataPoint
                        key={`point-${stack.key}-${i}`}
                        x={xScale(getDate(point)) ? xScale(getDate(point)) :  0}
                        y={yScale(getY1(point)) ? yScale(getY1(point)) : 0}
                        width={1}
                        height={(yScale(getY0(point)) ?? 0) - (yScale(getY1(point)) ?? 0)}
                        fill={colors[stack.key]}
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
                          const left = xScale(getDate(point));
                          showTooltip({
                            tooltipData: {
                              item: {
                                label: stack.key,
                                date: getDate(point),
                                value: point.data[stack.key],
                                data: point.data,
                              },
                              series: seriesData,
                            },
                            tooltipTop: eventSvgCoords?.y,
                            tooltipLeft: left,
                          });
                        }}
                      />
                    ))}
                  </DataPoints>
                ))}
              </>
            )}
          </AreaStack>
        </g>
      </svg>
      {tooltipOpen && tooltipData && conf?.tooltipContent && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, boxShadow: 'none', padding: 0 }}
        >
          {conf.tooltipContent(tooltipData)}
        </TooltipInPortal>
      )}
    </Styled>
  );
};
