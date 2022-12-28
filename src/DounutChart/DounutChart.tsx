import React, { useCallback, useEffect, useRef } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './DounutChart.style';

interface ChartLabel {
  color: string;
  labelTitle: string;
  labelValue: string;
}

export interface D3DounutData {
  [item: string]: string | number;
}

interface DounutChartProps {
  config: { size: number; margin: number; ringWidth: number; cornerRadius?: number };
  labelList: ChartLabel[];
  chartData: D3DounutData;
  parrentClass: string;
}

export const DounutChart = ({ config, labelList, chartData, parrentClass }: DounutChartProps) => {
  const { size, margin, ringWidth, cornerRadius } = config;

  const svgRef = useRef<SVGSVGElement>(null);

  const outerRadius = size / 2 - margin;
  const innerRadius = size / 2 - margin - ringWidth;

  const drawChart = useCallback(
    (dounutData: D3DounutData) => {
      const dataReady = d3.pie().value((d) => +d)(Object.values(dounutData).map((el) => +el));

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('whatever')
        .data(dataReady)
        .join('path')
        .attr('d', (d: any) =>
          d3
            .arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .cornerRadius(cornerRadius || 0)(d),
        )
        .attr('fill', (d, i) => labelList[i].color);
    },
    [innerRadius, labelList, outerRadius, parrentClass],
  );

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select(parrentClass).select('svg').attr('width', size).attr('height', size).selectAll('g').remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'line-group')
      .attr('width', size - margin - margin)
      .attr('height', size - margin - margin)
      .attr('transform', `translate(${size / 2},${size / 2})`);

    drawChart(chartData);
  }, [chartData, drawChart, margin, parrentClass, size]);

  return (
    <div className="doughnut-chart" css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
};

export default DounutChart;
