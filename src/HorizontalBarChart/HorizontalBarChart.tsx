import React, { useEffect, useMemo } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import baseCss from './HorizontalBarChart.style';
import { getUniqKey } from '../../../utils/array.utils';

export interface D3HorizontalBarData {
  title: string;
  value: string | number;
  percent?: string | number;
}

interface HorizontalBarChartProps {
  dataList: D3HorizontalBarData[];
  parrentClass: string;
  barThickness: number;
  barGap: number;
  toolHtml?: (i: number, d: D3HorizontalBarData, color: string[]) => string;
}

export const HorizontalBarChart = ({
  dataList,
  parrentClass,
  barThickness,
  barGap,
  toolHtml,
}: HorizontalBarChartProps): React.ReactElement => {
  const barColor = useMemo(
    () => [
      'rgba(0, 111, 255, 1)',
      'rgba(0, 111, 255, 0.6)',
      'rgba(0, 111, 255, 0.4)',
      'rgba(0, 111, 255, 0.2)',
      'rgba(0, 111, 255, 0.1)',
    ],
    [],
  );

  d3.select('body').selectAll(`${parrentClass}-horizontal-bar-chart-tooltip`).remove();

  const tool = d3
    .select('#root')
    .append('div')
    .attr('class', `${parrentClass.slice(1)}-horizontal-bar-chart-tooltip`)
    .style('position', 'absolute')
    .style('visibility', 'hidden');

  const maxValue = Math.max(...dataList.map((el) => +el.value));

  useEffect(() => {
    return () => {
      d3.select('body').selectAll(`${parrentClass}-horizontal-bar-chart-tooltip`).remove();
    };
  }, []);

  return (
    <div css={[baseCss({ barGap })]}>
      {dataList.map((el, i) => (
        <div
          key={getUniqKey(el.title, i)}
          className="horizontal-barchart-bar"
          style={{
            backgroundColor: barColor[i],
            width: `${(100 * +el.value) / maxValue}%`,
            height: barThickness,
            color: i === 0 ? '#ffffff' : '#626871',
          }}
          onMouseMove={(e) => {
            if (toolHtml) tool.html(toolHtml(i, el, barColor));
            tool
              .style('visibility', 'visible')
              .style('top', `${e.pageY - 160}px`)
              .style('left', `${e.pageX + -160}px`);
          }}
          onMouseOut={() => {
            tool.style('visibility', 'hidden');
          }}
          onBlur={() => {
            tool.style('visibility', 'hidden');
          }}
        >
          {el.title}
        </div>
      ))}
    </div>
  );
};

export default HorizontalBarChart;
