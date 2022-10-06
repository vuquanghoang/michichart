import React, { useEffect } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft } from '@visx/axis';
import { GridAngle, GridRadial } from '@visx/grid';
import styled from 'styled-components';
import { localPoint } from '@visx/event';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { TooltipStyled } from '../../Tooltips/Styled';
import { TooltipContentProps } from '../../Tooltips/ToolipContent';
import { select } from 'd3-selection';
import { CLASS_NAME } from '../../../constants/utils';
import divide from "lodash/divide";
import range from "lodash/range";

const CLASS_HIGHLIGHT = 'highlight';

const Polygon = styled.polygon`
  stroke-linejoin: round;
  opacity: 0.9;
  pointer-events: stroke;
  transition: all 0.2s ease-out;

`;

const DataPoint = styled.circle`
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-out;
`;

const DataPoints = styled.g`
  &.highlight {
    ${DataPoint} {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

// utils
function extent<Datum>(data: Datum[], value: (d: Datum) => number) {
  const values = data.map(value);
  return [Math.min(...values), Math.max(...values)];
}


export interface RadarChartProps {
  width: number;
  height: number;
  conf?: any;
  seriesData: any[];
}

interface DataPoint {
  label: string;
  value: number;
  date: string;
}

let tooltipTimeout: number;


export const RadarChart = ({ width, height, seriesData, conf }: RadarChartProps) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipContentProps>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  const radialScale = scaleLinear<number>({
    domain: conf?.radialScale?.domain || [360, 0],
  });
  const yScale = scaleLinear<number>({
    domain: conf?.yScale?.domain || [0, 30],
  });



  if (width < 10) return null;

  // Update scale output to match component dimensions
  radialScale.range(conf?.radialScale?.range || [0, Math.PI * 2]);
  yScale.range([30, height / 2 - (conf?.padding || 0)]);

  const reverseYScale = yScale.copy().range(yScale.range().reverse());

  const genPoints = (length: number, radius: number) => {
    const step = (Math.PI * 2) / length;

    return [...new Array(length)].map((_, i) => ({
      x: radius * Math.sin(i * step) * 1,
      y: radius * Math.cos(i * step) * -1,
    }));
  };

  const genPolygonPoints = (data: DataPoint[], scale: (n: number) => number) => {
    const step = (Math.PI * 2) / data.length;
    const points: { x: number; y: number, date: string, value: number }[] = new Array(data.length).fill({
      x: null,
      y: null,
      date: null,
      value: null,
    });
    const pointString: string = data.reduce((res, cur, i) => {
      if (i > data.length) return res;

      if (!cur?.value) {
        return res;
      }

      const xVal = Math.round(scale(cur.value) * Math.sin(i * step));
      const yVal = Math.round(scale(cur.value) * Math.cos(i * step) * -1);
      points[i] = { x: xVal, y: yVal, date: cur.date, value: cur.value };
      res += `${xVal},${yVal} `;
      return res;
    }, '');

    return { points, pointString };
  };

  const highlight = (node: any, i: number) => {
    const root = node.closest('svg');

    select(node.parentNode).raise();

    Array.from(root.querySelectorAll('.data-points')).forEach(el => (el as HTMLElement).classList.remove(CLASS_NAME.HIGHLIGHT));
    root.querySelector(`.data-points-${i}`).classList.add(CLASS_HIGHLIGHT);

    select(root.querySelector('.value-labels')).raise();
  };

  const resetHighlight = (root: any) => {
    Array.from(root.querySelectorAll('.data-points')).forEach(el => (el as HTMLElement).classList.remove(CLASS_NAME.HIGHLIGHT));
  };

  const points = genPoints(12, height / 2 - conf?.padding / 2);

  const processedSeriesData = seriesData
    // sort disabled items first
    .sort((x, y) => (x.isDisabled === y.isDisabled) ? 0 : x.isDisabled ? -1 : 1)
    .map(item => ({ ...genPolygonPoints(item.data, yScale), ...item }));


  return (
    <div>
      <svg width={width} height={height} style={{ overflow: 'visible' }} ref={containerRef}
           onMouseLeave={event => resetHighlight(event.target as HTMLElement)}>
        <Group top={height / 2} left={width / 2}>
          <GridAngle
            scale={radialScale}
            outerRadius={height / 2 - (conf?.padding || 30)}
            stroke={conf?.gridAngle?.style?.stroke || '#c1c1c1'}
            strokeWidth={conf?.gridAngle?.style?.strokeWidth || 1}
            numTicks={conf?.gridAngle?.numTicks || 12}
          />

          <GridRadial
            scale={yScale}
            numTicks={conf?.gridRadial?.style?.numTicks || 6}
            stroke={conf?.gridRadial?.style?.stroke || '#c1c1c1'}
            strokeWidth={conf?.gridRadial?.style?.strokeWidth || 1}
            fill={conf?.gridRadial?.style?.fill || 'transparent'}
            fillOpacity={conf?.gridRadial?.style?.fillOpacity || 0}
            strokeDasharray={conf?.gridRadial?.style?.strokeDasharray || '2,2'}
            tickValues={conf?.yScale?.domain ? (() => {
              const basedValued = divide(conf?.yScale?.domain[1], 5);
              const tickValues = range(0, 6, 1).map(d => Math.ceil(d * basedValued));

              return tickValues
            })() : undefined }
          />

          {points.map((value, i) => (
            <g key={i}>
              <text x={points[i].x} y={points[i].y}
                    style={{ fill: conf?.gridRadial?.label?.style?.color || '#ccc', ...conf?.gridRadial?.label?.style }}
                    textAnchor="middle" alignmentBaseline="middle">
                {conf.gridAngleLabels[i]}
              </text>
            </g>
          ))}

          {processedSeriesData.map(({ label, pointString, points, color, isDisabled }, i) => (
            <g key={`series-${i}`} className={`series series-${i}`}>
              <Polygon
                points={pointString}
                fill={'transparent'}
                stroke={color}
                strokeWidth={5}
                onMouseMove={(event) => {
                  event.preventDefault();
                  if (isDisabled) return;
                  highlight(event.target, i);
                }}
              />

              <DataPoints className={`data-points data-points-${i}`}>
                {points
                  .map((point: { x: string | number | null | undefined; y: string | number | null | undefined; isDisabled: any; date: any; value: any; }, j: any) => (
                    <g key={`data-point-${j}`}>{point.x !== null && point.y !== null && (
                      <DataPoint
                        className={`data-point data-point-${i}`}
                        r={6}
                        cx={point.x}
                        cy={point.y}
                        stroke="#fff"
                        strokeWidth={5}
                        fill={color}
                        onMouseLeave={(event) => {
                          if (point.isDisabled) return;
                          tooltipTimeout = window.setTimeout(() => {
                            hideTooltip();
                          }, 300);
                        }}
                        onMouseMove={(event) => {
                          event.preventDefault();
                          if (point.isDisabled) return;
                          if (tooltipTimeout) clearTimeout(tooltipTimeout);
                          const eventSvgCoords = localPoint(event);

                          showTooltip({
                            tooltipData: {
                              item: {
                                label,
                                date: point.date,
                                value: point.value,
                              },
                              series: points,
                            },
                            tooltipTop: eventSvgCoords?.y,
                            tooltipLeft: eventSvgCoords?.x,
                          });
                        }}
                      />
                    )}</g>
                  ))}
              </DataPoints>
            </g>
          ))}

          <g className="value-labels" style={{ pointerEvents: 'none' }}>
            <AxisLeft
              numTicks={5}
              top={-height / 2}
              scale={reverseYScale}
              tickStroke="none"
              hideTicks
              stroke="transparent"
              tickLabelProps={() => (conf?.axes?.topVertical?.style ? {
                ...conf?.axes?.topVertical?.style,
                stroke: '#fff',
                textAnchor: 'initial',
              } : {})}
              tickFormat={(v) => conf?.axes?.topVertical?.formatter ? conf?.axes?.topVertical?.formatter(v) : v}
              tickComponent={(v) => {
                if (!conf?.axes?.topVertical?.tickComponent) {
                  const { formattedValue, ...otherProps } = v;
                  return <text {...otherProps}>{formattedValue}</text>;
                }
                return conf?.axes?.y?.tickComponent(v);
              }}
              tickValues={conf?.yScale?.domain ? (() => {
                const basedValued = divide(conf?.yScale?.domain[1], 5);
                const tickValues = range(0, 6, 1).map(d => Math.ceil(d * basedValued));

                return tickValues
              })() : undefined }
            />
          </g>
        </Group>
      </svg>
      {tooltipOpen && tooltipData && conf.tooltipContent && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, boxShadow: 'none', padding: 0 }}
        >
          <TooltipStyled>
            {conf.tooltipContent(tooltipData)}
          </TooltipStyled>
        </TooltipInPortal>
      )}
    </div>
  );
};
