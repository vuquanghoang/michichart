import React, { FC } from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { GridRows } from '@visx/grid';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Label } from '../../Axes';
import colorsDefault from '../../../constants/colors';
import { TooltipContentProps } from '../../Tooltips/ToolipContent';
import Stack from './Stack';
import { defaultConfig } from '../../../helpers';

let tooltipTimeout: number;

export interface VerticalBarChartProps {
  series: any[];
  seriesTotal: any[];
  title: string | React.ReactNode;
  width: number;
  height: number;
  colors: any | null;
  padding: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  } | null;
  domainAxisX: number[] | null;
  domainAxisY: number[] | null;
  showAxisX: boolean;
  showAxisY: boolean;
  isScaled: boolean;
  scaleFormat: {
    b: string;
    m: string;
    k: string;
    n: string;
  };
  conf?: any;
}

export const VerticalBarChart: FC<VerticalBarChartProps> = ({
  series = [],
  seriesTotal = [],
  title = '',
  height = defaultConfig.height,
  width = defaultConfig.width,
  colors = null,
  padding = null,
  domainAxisX = null,
  domainAxisY = null,
  showAxisX = true,
  showAxisY = true,
  conf = {},
}) => {
  const refinedPadding = padding
    ? {
        ...defaultConfig.padding,
        ...padding,
      }
    : {
        ...defaultConfig.padding,
      };

  const filteredSeries = series.filter((d) => d.data.length > 0);

  const keyAbbr = filteredSeries.reduce(
    (result, d) => ({
      ...result,
      [d.key]: d.abbr,
    }),
    {},
  );

  const maxY = Math.max(...seriesTotal.map((d) => Math.max(d?.export || 0, d?.import || 0, d?.trade || 0)));


  const keys = filteredSeries.map((d) => d.key);


  // accessors
  const getDate = (d) => d.date;

  // scales
  const dateScale = scaleBand<string>({
    domain: domainAxisX || seriesTotal.map(getDate),
    padding: 0.1,
  });

  const directionScale = scaleBand<string>({
    domain: keys,
    padding: 0.1,
  });

  const objectScale = scaleLinear<number>({
    domain: domainAxisY || [0, maxY],
    range: [50, height - 50],
    nice: true,
    clamp: true,
  });

  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: colorsDefault,
  });

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipContentProps>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });
  dateScale.rangeRound([refinedPadding.left, width - refinedPadding.right]);
  objectScale.range([height - 100, 0]);
  directionScale.rangeRound([0, dateScale.bandwidth()]);

  return (
    <div>
      <svg
        ref={containerRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          fontSize: width > 600 ? '1em' : '0.75em',
          overflow: 'visible',
        }}
      >
        <rect x={0} y={0} width={width} height={height} fill="#fff" />
        <Label x={5} y={25}>
          {title}
        </Label>
        {showAxisY && (
          <AxisLeft
            top={50}
            left={refinedPadding.left - 18}
            scale={objectScale}
            strokeWidth={0}
            hideTicks
            tickComponent={(v) => {
              if (!conf?.axes?.y?.tickComponent) {
                const { formattedValue, ...otherProps } = v;
                return <text {...otherProps}>{formattedValue}</text>;
              }
              return <text dangerouslySetInnerHTML={{ __html: conf?.axes?.y?.tickComponent(v) }} />;
            }}
            tickFormat={(v) => conf?.axes?.y?.formatter ? conf?.axes?.y?.formatter(v, objectScale.ticks()) : v}
          />
        )}

        <GridRows
          scale={objectScale}
          width={width - refinedPadding.left - refinedPadding.right}
          height={10}
          // numTicks={5}
          strokeDasharray="2,2"
          top={50}
          left={refinedPadding.left}
          stroke="#d3d3d3"
        />
        <Group top={refinedPadding.top}>
          <BarGroup
            data={seriesTotal}
            keys={keys}
            height={height - 100}
            x0={getDate}
            x0Scale={dateScale}
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
                      width={bar.width}
                      key={`group-${barGroup.index}-${bar.index}`}
                    >
                      <Stack
                        keys={keys}
                        key={`stack-${barGroup.index}-${bar.index}`}
                        containerTop={bar.y}
                        containerLeft={bar.x}
                        containerHeight={bar.height}
                        containerWidth={bar.width}
                        date={seriesTotal[barGroup.index]?.date}
                        colors={colors}
                        dataKey={bar.key}
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
                                item: {
                                  label: bar.key,
                                  date: seriesTotal[barGroup.index]?.date,
                                  value: bar.value,
                                },
                                series: seriesTotal.map((d: any) => ({
                                  date: d?.date,
                                  value: parseFloat(d[bar.key]).toFixed(4),
                                })),

                              },
                              tooltipTop: eventSvgCoords?.y,
                              tooltipLeft: left,
                            });
                          }
                        }}
                        series={filteredSeries}
                      />
                      <foreignObject x={bar.x} y={bar.y + bar.height + 5} width={bar.width} height={20}>
                        <div style={{ textAlign: 'center' }}>{keyAbbr[bar.key]}</div>
                      </foreignObject>
                    </g>
                  ))}
                </Group>
              ))
            }
          </BarGroup>
        </Group>
        {showAxisX && (
          <AxisBottom
            top={height - refinedPadding.bottom + 15}
            left={0}
            scale={dateScale}
            stroke="transparent"
            tickStroke="transparent"
            numTicks={20}
            hideAxisLine
            tickComponent={(v) => {
              if (!conf?.axes?.x?.tickComponent) {
                const { formattedValue, ...otherProps } = v;
                return <text {...otherProps}>{formattedValue}</text>;
              }
              return <text dangerouslySetInnerHTML={{ __html: conf?.axes?.x?.tickComponent(v) }} />;
            }}
            tickFormat={(v) => conf?.axes?.x?.formatter ? conf?.axes?.x?.formatter(v) : v}
          />
        )}
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, boxShadow: 'none', padding: 0 }}
        >
          <div dangerouslySetInnerHTML={{ __html: conf ? conf?.tooltipContent(tooltipData) : '' }} />
        </TooltipInPortal>
      )}
    </div>
  );
};
