import React from 'react';
import colorsDefault from '../../../constants/colors';

const Stack: ({
  containerTop,
  containerLeft,
  containerHeight,
  containerWidth,
  dataKey,
  date,
  value,
  series,
  keys,
  colors,
}: {
  containerTop: number;
  containerLeft: number;
  containerHeight: number;
  containerWidth: number;
  dataKey: string;
  date: string;
  value: number;
  keys: string[];
  [x: string]: any;
  series: any[];
  colors: string;
}) => null | JSX.Element = (props) => {
  const {
    containerTop,
    containerLeft,
    containerHeight,
    containerWidth,
    dataKey,
    date,
    value,
    series,
    colors,
    keys,
    ...otherProps
  } = props;
  let top = containerTop;

  const stackData = series
    .find((d) => d.key === dataKey)
    ?.data?.find((d: { date: string | number; }) => +d.date === +date);

  if (!stackData) return null;

  return (
    <g>
      <foreignObject
        x={containerLeft}
        y={containerTop}
        width={containerWidth}
        height={containerHeight}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: `${containerHeight}px`,
            width: `${containerWidth}px`,
            backgroundColor: '#fff',
            borderRadius: 5,
            overflow: 'hidden',
          }}
        >
          <>
          {Object.keys(stackData)
            .filter((d) => d !== 'date')
            .map((k, i) => {
              const h = (stackData[k] * containerHeight) / value;
              top += h;

              return (
                <div
                  key={`sd-${i}`}
                  style={{
                    height: h - 1,
                    // @ts-ignore
                    backgroundColor: colors[k] || colorsDefault[i],
                  }}
                />
              );
            })}
            </>
        </div>
      </foreignObject>
      <rect
        style={{transition: 'all 0.3s ease-out'}}
        x={containerLeft}
        y={containerTop}
        width={containerWidth}
        height={containerHeight}
        fill="transparent"
        {...otherProps}
      />
      );
    </g>
  );
};

export default Stack;
