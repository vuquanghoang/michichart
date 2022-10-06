import React from "react";

// @ts-ignore
const Cross = ({x, y, size, strokeWidth, color, ...otherProps}) => {
  const roundedX = parseInt(x);
  const roundedY = parseInt(y);
  const offsetY = roundedY / 2;
  const offsetX = roundedX / 2;

  return (
    <g className={"cross"}>
      <circle cx={roundedX} cy={roundedY} r={size * 1.5} stroke="#fff" fill="#fff" strokeOpacity={0.9} strokeWidth={size * 1.5} {...otherProps}/>
      <path stroke={color} d={`M${roundedX} ${roundedY  - size} L ${roundedX} ${roundedY + size} M${roundedX  - size} ${roundedY} L ${roundedX + size} ${roundedY}z`} {...otherProps} />
    </g>
  );
};

export default Cross;
