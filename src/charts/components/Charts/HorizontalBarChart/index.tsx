import React, { FC, useRef } from 'react';
import { Bar } from '@visx/shape';
import styled from 'styled-components';
import { PatternLines } from '@visx/pattern';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { TooltipContentProps } from '../../Tooltips/ToolipContent';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { GridColumns } from '@visx/grid';

const Styled = styled.div`
  contain: layout;
`;

const TooltipStyled = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  .total,
  .remaining {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    text-align: center;
    font-family: var(--font-sans-serif-primary);
    line-height: 150%;
    > * {
      display: block;
    }
  }
  .total {
    em {
      font-weight: bold;
      font-style: normal;
      font-size: 2em;
      color: #554f44;
      text-align: center;
      line-height: 19px;
      margin: 0 5px;
    }
  }
`;

const BarStyled = styled(Bar)`
  transition: width 0.3s ease-out;
`;

interface IData {
  label: string;
  color?: string;
  valueHighlight: number;
  valueRemaining: number;
  valueTotal: number;
}

let tooltipTimeout: number;

export interface HorizontalBarChartProps {
  className: string;
  seriesData: IData[];
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  domainAxisX?: number[] | null;
  domainAxisY?: number[] | null;
  showAxisX: boolean;
  showAxisY: boolean;
  direction: 'rtl' | 'ltr';
  conf?: any;
}

export const HorizontalBarChart: FC<HorizontalBarChartProps> = ({
                                                                  className = '',
                                                                  width = 900,
                                                                  height = 500,
                                                                  seriesData = [],
                                                                  padding = {
                                                                    top: 50,
                                                                    right: 50,
                                                                    bottom: 50,
                                                                    left: 50,
                                                                  },
                                                                  domainAxisX = null,
                                                                  showAxisX = true,
                                                                  showAxisY = true,
                                                                  direction = 'ltr',
                                                                  conf = {},
                                                                }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipContentProps>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  const xScaleDomain = domainAxisX || [0, Math.max(...seriesData.map((d) => d.valueTotal))];
  const yScale = scaleBand({
    domain: seriesData.map((d) => d.label),
    range: [padding.top, height - (padding.bottom || 0)],
  });

  const xScale = scaleLinear({
    domain: direction === 'ltr' ? xScaleDomain : xScaleDomain.reverse(),
    range: [padding.left || 0, width - padding.right],
    nice: true,
    clamp: true,
  });

  const ref = useRef(null);

  return (
    <Styled>
      <svg
        className={className}
        width={width}
        height={height}
        ref={containerRef}
        style={{
          fontSize: width > 600 ? '1em' : '0.75em',
          overflow: 'visible',
        }}
      >
        <rect x={0} y={0} width={width} height={height} fill="#fff" />

        <GridColumns
          innerRef={ref}
          scale={xScale}
          top={0}
          height={height - padding.bottom}
          stroke="#d3d3d3"
          strokeDasharray="2,2"
        />

        <PatternLines
          id={'grid'}
          height={6}
          width={6}
          stroke="pink"
          strokeWidth={1}
          orientation={['diagonalRightToLeft']}
        />
        {showAxisY && (
          <AxisLeft
            top={0}
            left={padding.left - 30 || 0}
            scale={yScale}
            stroke="transparent"
            hideTicks
            tickFormat={(v) => conf?.axes?.y?.formatter ? conf?.axes?.y?.formatter(v) : v}
            tickComponent={(v) => {
              if (!conf?.axes?.y?.tickComponent) {
                const { formattedValue, ...otherProps } = v;
                return <text {...otherProps}>{formattedValue}</text>;
              }
              return <text dangerouslySetInnerHTML={{ __html: conf?.axes?.y?.tickComponent(v) }} />;
            }}
          />
        )}
        {showAxisX && (
          <AxisBottom
            top={height - (padding.bottom || 0)}
            scale={xScale}
            stroke="transparent"
            tickComponent={(v) => {
              if (!conf?.axes?.x?.tickComponent) {
                const { formattedValue, ...otherProps } = v;
                return <text {...otherProps}>{formattedValue}</text>;
              }
              return <text dangerouslySetInnerHTML={{ __html: conf?.axes?.x?.tickComponent(v) }} />;
            }}
            tickFormat={(v) => conf?.axes?.x?.formatter ? conf?.axes?.x?.formatter(v, xScale.ticks()) : v}
            hideTicks
          />
        )}
        {seriesData.map((d, i) => {
          const barHeight = 28;
          const barWidth =
            direction === 'ltr' ? xScale(d.valueTotal) - padding.left : width - xScale(d.valueTotal) - padding.right;
          const barHighlightWidth =
            direction === 'ltr'
              ? xScale(d.valueHighlight) - padding.left
              : width - xScale(d.valueHighlight) - padding.right;
          const barY = (yScale(d.label) || 0) + yScale.bandwidth() / 2 - 16;
          const barX = direction === 'ltr' ? padding.left : padding.right;
          return (
            <g key={i}>
              <PatternLines
                id={`grid-pattern-${i}`}
                height={5}
                width={5}
                stroke={d.color}
                strokeWidth={1}
                orientation={['diagonalRightToLeft']}
              />
              <BarStyled
                x={barX}
                y={barY}
                height={barHeight}
                width={barWidth}
                stroke={d.color}
                fill={`url(#grid-pattern-${i})`}
                rx={7}
                style={{ transform: `translateX(${direction === 'ltr' ? 0 : xScale(d.valueTotal) - padding.right}px)` }}
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
                      item: d,
                      series: seriesData,
                    },
                    tooltipTop: eventSvgCoords?.y,
                    tooltipLeft: eventSvgCoords?.x,
                  });
                }}
              />
              <BarStyled
                x={direction === 'ltr' ? barX : xScale(d.valueHighlight)}
                y={barY}
                height={barHeight}
                width={barHighlightWidth}
                fill={d.color}
                rx={7}
                style={{
                  pointerEvents: 'none',
                }}
              />
            </g>
          );
        })}
        <PatternLines
          id={`grid-lg`}
          height={5}
          width={5}
          stroke={'#918B86'}
          strokeWidth={1}
          orientation={['diagonalRightToLeft']}
        />
      </svg>

      {tooltipOpen && tooltipData && conf?.tooltipContent && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, boxShadow: 'none', padding: 0 }}
        >
          <div dangerouslySetInnerHTML={{ __html: conf?.tooltipContent(tooltipData) }} />
        </TooltipInPortal>
      )}
    </Styled>
  );
};
