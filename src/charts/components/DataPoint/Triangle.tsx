import React from "react";

const Triangle = ({x, y, size, strokeWidth, color, ...otherProps}) => {
  const roundedX = parseInt(x);
  const roundedY = parseInt(y);
  const offsetY = roundedY / 2;
  const offsetX = roundedX / 2;

  return (
    <g className={"cross"}>
      <circle cx={roundedX} cy={roundedY} r={size} stroke="#fff" fill="#fff" strokeWidth={size * 2} {...otherProps}/>
      <path stroke={color} strokeWidth={3} d={`M${roundedX} ${roundedY  - size} L ${roundedX} ${roundedY + size} M${roundedX  - size} ${roundedY} L ${roundedX + size} ${roundedY}z`} {...otherProps} />
    </g>
  );
};

export default Triangle;
