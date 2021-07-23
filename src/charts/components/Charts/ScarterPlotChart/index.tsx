import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { scaleLinear, scaleQuantile } from '@visx/scale';
import { extent } from 'd3-array';
import orderBy from 'lodash/orderBy';
import { GridColumns, GridRows } from '@visx/grid';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { localPoint } from '@visx/event';
import { defaultConfig } from '../../../helpers';
import { Label, TickPlain } from '../../Axes';
import Tooltip, { ITooltipContentProps } from '../../Tooltips/ToolipContent';

const Styled = styled.div`
  contain: layout;
`;

const LegendTitle = styled.div`
  font-family: var(--font-sans-serif-primary);
  font-weight: 600;
  font-size: 1em;
  color: #918b86;
  text-shadow: 0 0 10px #fff;
`;

const LegendContent = styled.div`
  display: flex;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
    text-shadow: 0 0 10px #fff;
  }
`;
const LegendContentArcs = styled.div`
  position: relative;
  width: 30px;
  height: 70px;
`;
const LegendArc = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  border: 1px solid #918b86;
`;

const LegendContentText = styled.div`
  position: relative;
  height: 70px;
  width: 70px;
`;

const LegendText = styled.div`
  position: absolute;
  left: 5px;
  color: #918b86;
  font-family: var(--font-sans-serif-primary);
  font-weight: 600;
  font-size: 0.625em;
  transform: translateY(50%);
`;

interface IData {
  label: string;
  x: number;
  y: number;
  d: number;
  color?: string;
  code?: any;
}

let tooltipTimeout: number;

export interface ScatterPlotChartProps {
  className: string;
  seriesData: IData[];
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
  axisXLbl?: string | ReactNode | null;
  axisYLbl?: string | ReactNode | null;
  tickFormat: { value: string; valueSize?: string; date: string; currency?: string; scale?: string };
  legendTitle?: string | ReactNode | null;
  tooltip: string | ReactNode | null;
  tooltipDefaultStyle: boolean;
}

export const ScatterPlotChart: FC<ScatterPlotChartProps> = ({
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
  domainAxisY = null,
  domainAxisX = null,
  axisYLbl = '',
  axisXLbl = '',
  legendTitle = null,
  showAxisX = true,
  showAxisY = true,
  tickFormat = {
    ...defaultConfig.tickFormat,
    value: '{v}%',
    valueSize: '${v}',
    scale: '',
  },
  tooltip = null,
  tooltipDefaultStyle = true,
}) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<ITooltipContentProps>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  const diameterScale = scaleQuantile({
    domain: extent(seriesData.map(({ d }) => d)) as unknown as [number, number],
    range: [6, 15, 25, 35, 45, 55],
  });

  const yScale = scaleLinear({
    domain: domainAxisY || (extent(seriesData.map(({ y }) => y)).reverse() as unknown as [number, number]),
    range: [padding?.top, height - (padding?.bottom || 0)],
    zero: true,
    nice: true,
    clamp: true,
  });

  const xScale = scaleLinear({
    domain: domainAxisX || (extent(seriesData.map(({ x }) => x)) as unknown as [number, number]),
    range: [padding?.left, width - (padding?.right || 0)],
    zero: true,
    nice: true,
    clamp: true,
  });

  return (
    <Styled>
      <svg className={className} width={width} height={height} ref={containerRef} style={{ overflow: 'visible' }}>
        <rect x={0} y={0} width={width} height={height} fill="#fff" />
        {axisYLbl && (
          <Label x={5} y={25}>
            {axisYLbl}
          </Label>
        )}
        {axisXLbl && (
          <Label x={35} y={height - 10}>
            {axisXLbl}
          </Label>
        )}
        <GridRows
          scale={yScale}
          width={width - (padding.right || 0) - (padding.left || 0)}
          strokeDasharray="1,3"
          top={0}
          left={padding.left || 0}
          stroke="#d3d3d3"
        />
        <GridColumns
          scale={xScale}
          height={height - (padding.top || 0) - (padding.bottom || 0)}
          strokeDasharray="1,3"
          left={0}
          top={padding.top || 0}
          stroke="#d3d3d3"
        />

        {seriesData &&
          orderBy(seriesData, ['d'], ['desc']).map((d, i) => (
            <circle
              className={`dot dot-${d?.code ? d.code : ''}`}
              key={`circle-${i}`}
              cx={xScale(d.x)}
              cy={yScale(d.y)}
              r={diameterScale(d.d) / 2}
              fill={d.color}
              onMouseLeave={(event) => {
                tooltipTimeout = window.setTimeout(() => {
                  hideTooltip();
                }, 300);
              }}
              onMouseMove={(event) => {
                event.preventDefault();
                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                const eventSvgCoords = localPoint(event);
                const left = xScale(d.x);

                showTooltip({
                  tooltipData: {
                    useDefaultStyle: tooltipDefaultStyle,
                    title: d.label,
                    content: (
                      <ul style={{ padding: '0 20px' }}>
                        <li>
                          <b>Trade value:</b>
                          {d.d}
                          {tickFormat.scale}
                        </li>
                        <li>
                          <b>{axisYLbl}:</b>
                          {`${d.y}%`}
                        </li>
                        <li>
                          <b>{axisXLbl}:</b>
                          {`${d.x}%`}
                        </li>
                      </ul>
                    ),
                  },
                  tooltipTop: eventSvgCoords?.y,
                  tooltipLeft: left,
                });
              }}
            />
          ))}
        {seriesData.length > 0 && (
          <g>
            <foreignObject x={width - 180} y={50} width={170} height={200} style={{ pointerEvents: 'none' }}>
              <LegendTitle>{legendTitle}</LegendTitle>
              <LegendContent>
                <LegendContentArcs>
                  {diameterScale.range().map((d, i) => (
                    <LegendArc
                      key={`arc-d-${i}`}
                      style={{
                        width: `${i === 0 ? d : d / 2}px`,
                        height: `${d}px`,
                        borderRadius: `${i === 0 ? `${d}px` : 0}`,
                        borderTopLeftRadius: `${d}px`,
                        borderBottomLeftRadius: `${d}px`,
                        borderRightWidth: `${i === 0 ? '1px' : 0}`,
                        transform: `translateX(${i === 0 ? '50%' : 0})`,
                      }}
                    />
                  ))}
                </LegendContentArcs>
                <LegendContentText>
                  <LegendText
                    style={{
                      bottom: 0,
                      transform: 'translateY(25%)',
                    }}
                  >
                    0
                  </LegendText>
                  {diameterScale.quantiles().map((d, i) => (
                    <LegendText
                      key={`td-${i}`}
                      style={{
                        bottom: `${diameterScale.range()[i + 1]}px`,
                      }}
                    >
                      {i % 2 === 0 ? (
                        <>
                          &#x2265; {d?.toFixed(0)} {tickFormat?.scale || 0}
                        </>
                      ) : (
                        ''
                      )}
                    </LegendText>
                  ))}
                </LegendContentText>
              </LegendContent>
            </foreignObject>
          </g>
        )}
        {showAxisY && (
          <AxisLeft
            top={0}
            left={(padding.left || 0) - 15}
            scale={yScale}
            stroke="transparent"
            hideTicks
            tickComponent={TickPlain}
            tickFormat={(v) => tickFormat.value.replace('{v}', String(v))}
          />
        )}
        {showAxisX && (
          <AxisBottom
            top={height - (padding?.bottom || 0)}
            left={0}
            scale={xScale}
            stroke="transparent"
            tickComponent={TickPlain}
            hideTicks
            tickFormat={(v) => tickFormat.value.replace('{v}', String(v))}
          />
        )}
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, boxShadow: 'none', padding: 0 }}
        >
          <Tooltip
            title={tooltipData.title}
            content={tooltipData.content}
            useDefaultStyle={tooltipData.useDefaultStyle}
          />
        </TooltipInPortal>
      )}
    </Styled>
  );
};
