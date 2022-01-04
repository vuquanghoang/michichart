import React, { FC, useContext } from "react";
import { timeFormat } from "d3-time-format";
import { ThemeContext } from "../../../themes/primary";
import { DateFormatted, Difference, Label, TooltipStyled, Trend, Value } from "./Styled";

const SCALE = {
  N: "n",
  K: "k",
  M: "m",
  B: "b"
};

export interface ITooltipTrendProps {
  label: string;
  date: string;
  value: number;
  dataSeries: any[];
  tickFormat: { value: string; date: string };
  isScaled: boolean;
  scale: string;
  scaleFormat: {
    b: string;
    m: string;
    k: string;
    n: string;
  };
  precision?: number;
}

const TooltipTrend: FC<ITooltipTrendProps> = ({
                                                label,
                                                date,
                                                value,
                                                dataSeries = [],
                                                tickFormat = { value: "", date: "" },
                                                isScaled = false,
                                                scale,
                                                scaleFormat = {
                                                  b: "",
                                                  m: "",
                                                  k: "",
                                                  n: ""
                                                },
                                                precision = 2
                                              }) => {
  const formatDataByScale = (data) => {
    const scale = Math.round(Math.log10(Math.abs(data)));

    let scaledData = data;

    if (scale >= 9) {
      scaledData = data / 1000000000;
      return scaleFormat[SCALE.B].replace("{v}", scaledData.toFixed(Number.isInteger(scaledData) ? 0 : 2));
    }

    if (scale >= 6) {
      scaledData = data / 1000000;
      return scaleFormat[SCALE.M].replace("{v}", scaledData.toFixed(Number.isInteger(scaledData) ? 0 : 2));
    }

    if (scale >= 3) {
      scaledData = data / 1000;
      return scaleFormat[SCALE.K].replace("{v}", scaledData.toFixed(Number.isInteger(scaledData) ? 0 : 2));
    }

    return data;
  };
  const { cssVars } = useContext(ThemeContext);
  const getTrend = (trendValue: number) => {
    return (
      <Trend trend={trendValue >= 0 ? "upward" : "download"}>
        <span className="vl">
          {formatDataByScale(parseFloat(String(trendValue)).toFixed(precision))}
        </span>
        <span className="arrow">{trendValue >= 0 ? <>&#8599;</> : <>&#8600;</>}</span>
      </Trend>
    );
  };

  const getFigureDifference = (date: string, dataSeries: any[], offset: number) => {
    if (dataSeries.length === 0) return null;

    const time = (
      date.length === 6 ? new Date(Number(date.substring(0, 4)), parseInt(date.substring(4, 6)) - 1) : new Date(date)
    ).getTime();

    const dataOffset = dataSeries.filter((d) => {
      const offsetTime = (
        d.date.length === 6
          ? new Date(Number(d.date.substring(0, 4)), parseInt(d.date.substring(4, 6)) - 1)
          : new Date(d.date)
      ).getTime();
      return offset === -1 ? offsetTime < time : offsetTime > time;
    });

    const closestTime =
      offset === -1
        ? Math.max(
        ...dataOffset.map((d) => {
          const time = (
            d.date.length === 6
              ? new Date(Number(d.date.substring(0, 4)), parseInt(d.date.substring(4, 6)) - 1)
              : new Date(d.date)
          ).getTime();
          return time;
        })
        )
        : Math.min(
        ...dataOffset.map((d) => {
          const time = (
            d.date.length === 6
              ? new Date(Number(d.date.substring(0, 4)), parseInt(d.date.substring(4, 6)) - 1)
              : new Date(d.date)
          ).getTime();
          return time;
        })
        );

    const closestData = dataOffset.find((d) => {
      const time = (
        d.date.length === 6
          ? new Date(Number(d.date.substring(0, 4)), parseInt(d.date.substring(4, 6)) - 1)
          : new Date(d.date)
      ).getTime();
      return time === closestTime;
    });

    if (!closestData) return null;

    return (
      <div style={{ ...cssVars }}>
        <DateFormatted>{timeFormat(tickFormat?.date)(
          closestData.date.length === 6 ? new Date(closestData.date.substring(0, 4), parseInt(closestData.date.substring(4, 6)) - 1) : new Date(closestData.date)
        )}</DateFormatted>
        <Value style={{ fontSize: 16 }}>
          {formatDataByScale(parseFloat(closestData.value).toFixed(precision))}
        </Value>
        {getTrend(offset === 1 ? closestData.value - value : value - closestData.value)}
      </div>
    );
  };

  return (
    <TooltipStyled style={{ ...cssVars }}>
      <Value>
        {formatDataByScale(value)}
      </Value>
      <Label>{label}</Label>
      <DateFormatted>
        {timeFormat(tickFormat.date)(
          date.length === 6
            ? new Date(Number(date.substring(0, 4)), parseInt(date.substring(4, 6)) - 1)
            : new Date(date)
        )}
      </DateFormatted>
      <div className="separator">
        <span className="middle-point" />
      </div>
      <Difference>
        <div>{getFigureDifference(date, dataSeries, -1)}</div>
        <div>{getFigureDifference(date, dataSeries, 1)}</div>
      </Difference>
    </TooltipStyled>
  );
};

export default TooltipTrend;
