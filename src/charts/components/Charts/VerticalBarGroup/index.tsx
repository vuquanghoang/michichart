import React, { FC, Fragment } from 'react';
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
import { defaultConfig } from '../../../helpers';

let tooltipTimeout: number;

export interface VerticalBarGroupChartProps {
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

export const VerticalBarGroupChart: FC<VerticalBarGroupChartProps> = ({
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


  const yValues = series.map(d =>
    Object.keys(d).filter(k => k !== "date" && k !== "label").map(k => d[k])).flat();


  // @ts-ignore
  const maxY = Math.max(...yValues);

  const keys = Array.from(new Set(series.map((d) => Object.keys(d).filter((k) => !['date', 'label'].includes(k))).flat()));


  // accessors
  const getDate = (d: { label: any; }) => d.label;

  // scales
  // @ts-ignore
  const dateScale = scaleBand<string>({
    domain: series.map(d => d.label),
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
              return conf?.axes?.y?.tickComponent(v);
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
            data={series}
            keys={keys}
            height={height - 100}
            x0={getDate}
            x0Scale={dateScale}
            x1Scale={directionScale}
            yScale={objectScale}
            color={colorScale}
          >
            {barGroups =>
              barGroups.map(barGroup => (
                <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
                  {barGroup.bars.map(bar => (
                    <Fragment>
                    <rect
                      key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                      x={ bar.x }
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={bar.color}
                      rx={4}
                      onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip();
                        }, 100);
                      }}
                      onMouseMove={(event) => {
                        event.preventDefault();
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);
                        const eventSvgCoords = localPoint(event);

                        showTooltip({
                          tooltipData: {
                            item: bar,
                            series: series,
                          },
                          tooltipTop: eventSvgCoords?.y,
                          tooltipLeft: eventSvgCoords?.x,
                        });
                      }}
                    />
                    </Fragment>
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
            // numTicks={20}
            hideAxisLine
            tickComponent={(v) => {
              if (!conf?.axes?.x?.tickComponent) {
                const { formattedValue, ...otherProps } = v;
                return <text {...otherProps}>{formattedValue}</text>;
              }

              return conf?.axes?.x?.tickComponent(v);
            }}
            tickFormat={(v) => {
              return conf?.axes?.x?.formatter ? conf?.axes?.x?.formatter(v) : v
            }}
          />
        )}
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
    </div>
  );
};
