import React, { FC, useContext } from 'react';
import { timeFormat } from 'd3-time-format';
import { ThemeContext } from '../../../themes/primary';
import {
  DateFormatted,
  Difference,
  Label,
  TooltipStyled,
  Trend,
  Value,
} from './Styled';
import {AxisBottom} from "@visx/axis";

export interface ITooltipTrendProps {
  label: string;
  date: string;
  value: number;
  dataSeries: any[];
  tickFormat: { value: string; date: string };
}

const TooltipTrend: FC<ITooltipTrendProps> = ({
  label,
  date,
  value,
  dataSeries = [],
  tickFormat = { value: '', date: '' },
}) => {
  const { cssVars } = useContext(ThemeContext);
  const getTrend = (trendValue: number) => {
    return (
      <Trend trend={trendValue >= 0 ? 'upward' : 'download'}>
        <span className="vl">
          {tickFormat.value !== '' && trendValue &&
            tickFormat.value.replace('{v}', trendValue.toFixed(2))}
        </span>
        <span className="arrow">
          {trendValue >= 0 ? <>&#8599;</> : <>&#8600;</>}
        </span>
      </Trend>
    );
  };

  const getFigureDifference = (
    date: string,
    dataSeries: any[],
    offset: number
  ) => {
    if (dataSeries.length === 0) return null;
    // const time = new Date(`${date}`).getTime();
    const time =  (date.length === 6 ? new Date(Number(date.substring(0, 4)), (parseInt(date.substring(4,6))) - 1) : new Date(date)).getTime();
    const dataOffset = dataSeries.filter((d) => {
      const offsetTime = (d.date.length === 6 ? new Date(Number(d.date.substring(0, 4)), (parseInt(d.date.substring(4,6))) - 1) : new Date(d.date)).getTime();
      return offset === -1 ? offsetTime < time : offsetTime > time
    });
    const closestTime =
      offset === -1
        ? Math.max(...dataOffset.map((d) => {
          const time = (d.date.length === 6 ? new Date(Number(d.date.substring(0, 4)), (parseInt(d.date.substring(4,6))) - 1) : new Date(d.date)).getTime();
          return time;
        }))
        : Math.min(...dataOffset.map((d) => {
          const time = (d.date.length === 6 ? new Date(Number(d.date.substring(0, 4)), (parseInt(d.date.substring(4,6))) - 1) : new Date(d.date)).getTime();
          return time;
        }));
    const closestData = dataOffset.find(
      (d) => {
        const time = (d.date.length === 6 ? new Date(Number(d.date.substring(0, 4)), (parseInt(d.date.substring(4,6))) - 1) : new Date(d.date)).getTime();
        return time === closestTime
      }
    );

    if (!closestData) return null;

    return (
      <div style={{ ...cssVars }}>
        <DateFormatted>
          {timeFormat(tickFormat.date)(new Date(`${closestData.date}`))}
        </DateFormatted>
        <Value style={{ fontSize: 16 }}>
          {tickFormat.value && closestData.value &&
            tickFormat.value.replace(
              '{v}',
              parseFloat(closestData.value).toFixed(2)
            )}
          {tickFormat.value === '' && closestData.value && (
            <>{parseFloat(closestData.value).toFixed(2)}</>
          )}
        </Value>
        {getTrend(
          offset === 1 ? closestData.value - value : value - closestData.value
        )}
      </div>
    );
  };

  return (
    <TooltipStyled style={{ ...cssVars }}>
      <Value>
        {tickFormat.value && value && tickFormat.value.replace('{v}', value.toFixed(2))}
        {tickFormat.value === '' && value && <>{value.toFixed(2)}</>}
      </Value>
      <Label>{label}</Label>
      <DateFormatted>
        {timeFormat(tickFormat.date)((date.length === 6 ? new Date(Number(date.substring(0, 4)), (parseInt(date.substring(4,6))) - 1) : new Date(date)))}
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
