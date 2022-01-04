import React, { FC, ReactNode } from "react";
import styled from "styled-components";

const TickMonthly = styled.text`
  position: relative;
  font-family: var(--font-sans-serif-primary);
  font-size: 0.8125em;
  fill: #7e7a7a;
`;

const TickYear: FC<{
  formattedValue: string | undefined;
  x?: number;
  y?: number;
  width?: number;
  dotAlignment?: string;
  children?: ReactNode;
}> = ({ x, y, formattedValue = "", children, width, dotAlignment }) => {
  const text = formattedValue.split(" ").map((d: string, i: number, arr) => (
    <tspan
      key={`tick-${i}`}
      style={{ fontWeight: i === arr.length - 1 ? "bold" : "normal" }}
    >
      {width && width < 600 && <>{parseInt(d, 10) % 5 === 0 ? d : ""}</>}
      {(!width || width >= 600) && <>{d}</>}
    </tspan>
  ));

  return (
    <>
      {dotAlignment === "top" && (
        <text className={"tick-dot"} x={x} y={y} dx={-2.5} dy={0}>&bull;</text>
      )}
      <TickMonthly className={"tick-lbl"} x={x} y={y} dy={dotAlignment === "right" ? 0 : 15} textAnchor="middle">
        <>{text}{" "}
          {dotAlignment === "right" && <tspan className={"tick-dot"} x={x} y={y} dx={30} dy={0}>&bull;</tspan>}
        </>
        {children && <>{children}</>}
      </TickMonthly>
    </>
  );
};

export default TickYear;
