import React, { useCallback, useEffect, useMemo, useRef } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './RadarChart.style';

interface ChartLabel {
  color: string;
  labelTitle: string;
  labelValue: string;
}

export interface D3RadarData {
  axis: string;
  axisKr: string;
  value: number;
}

interface DounutChartProps {
  config: { width: number; height: number; margin: number; radialSize: number };
  labelList: ChartLabel[];
  chartData: D3RadarData[][];
  parrentClass: string;
}

export const RadarChart = ({ config, labelList, chartData, parrentClass }: DounutChartProps) => {
  const { width, height, margin, radialSize } = config;

  const svgRef = useRef<SVGSVGElement>(null);
  const ticks = useMemo(() => [0, 25, 50, 75, 100], []);

  const addGridLine = useCallback(() => {
    const radialScale = d3
      .scaleLinear()
      .rangeRound([0, radialSize / 2])
      .domain([0, 100]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .selectAll('.circle')
      .data(ticks)
      .join('circle')
      .attr('cx', (width - margin * 2) / 2)
      .attr('cy', (height - margin * 2) / 2)
      .attr('fill', 'none')
      .attr('stroke', '#DCE0E8')
      .attr('r', (d) => radialScale(d));
  }, [width, height, margin, radialSize, ticks, parrentClass]);

  const addAxisLine = useCallback(
    (data: D3RadarData[][]) => {
      const allAxis = data[0].map((el) => el.axis);
      const angleSlice = (Math.PI * 2) / allAxis.length;

      const radialScale = d3
        .scaleLinear()
        .rangeRound([0, (radialSize - margin) / 2])
        .domain([0, 100]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('.axis')
        .data(allAxis)
        .join('g')
        .attr('class', 'axis')
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => radialScale(radialSize / 2 - 3) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => radialScale(radialSize / 2 - 3) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('class', 'line')
        .style('stroke', '#DCE0E8')
        .style('stroke-width', '1px')
        .attr('transform', `translate(${(width - margin * 2) / 2},${(height - margin * 2) / 2})`);
    },
    [radialSize, margin, width, height, parrentClass],
  );

  const addAxisLabel = useCallback(
    (data: D3RadarData[][]) => {
      const allAxis = data[0].map((el) => el.axisKr);
      const angleSlice = (Math.PI * 2) / allAxis.length;

      const radialScale = d3
        .scaleLinear()
        .rangeRound([0, (radialSize - margin) / 2])
        .domain([0, 100]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('.axis')
        .data(allAxis)
        .join('g')
        .attr('class', 'axis')
        .append('text')
        .attr('class', 'legend')
        .style('font-size', '12px')
        .style('font-weight', 700)
        .attr('text-anchor', (d, i) => {
          switch (i) {
            case 0:
            case 3:
              return 'middle';
            case 1:
            case 2:
              return 'start';
            case 4:
            case 5:
              return 'end';
            default:
              return 'middle';
          }
        })
        .attr('dy', '0.35em')
        .attr('x', (d, i) => radialScale((radialSize + margin * 2) / 2) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y', (d, i) => radialScale((radialSize + margin * 2) / 2) * Math.sin(angleSlice * i - Math.PI / 2))
        .text((d) => d)
        .attr('transform', `translate(${(width - margin * 2) / 2},${(height - margin * 2) / 2})`);
    },
    [radialSize, margin, width, height, parrentClass],
  );

  const addTick = useCallback(() => {
    const radialScale = d3
      .scaleLinear()
      .rangeRound([0, (radialSize - margin) / 2])
      .domain([100, 0]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .selectAll('.tick')
      .data(ticks)
      .join('text')
      .attr('class', 'radar-chart-tick')
      .attr('x', (width - margin * 2) / 2 + 2)
      .attr('y', (d) => radialSize + margin * 2 - radialScale(d) - 13)
      .text((d) => d)
      .attr('font-size', '10px')
      .attr('fill', '#626871');
  }, [radialSize, width, margin, parrentClass]);

  const addVertice = useCallback(
    (data: D3RadarData[][], label: ChartLabel[]) => {
      const allAxis = data[0].map((el) => el.axisKr);
      const angleSlice = (Math.PI * 2) / allAxis.length;
      const radialScale = d3
        .scaleLinear()
        .rangeRound([0, radialSize / 2])
        .domain([0, 100]);

      data.forEach((group, index) => {
        select(parrentClass)
          .select('svg')
          .select('g')
          .selectAll('.vertice')
          .data(group)
          .join('circle')
          .attr('class', 'polygon-vertices')
          .attr('r', '2px')
          .attr('cx', (d, i) => radialScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
          .attr('cy', (d, i) => radialScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
          .attr('fill', label[index].color)
          .attr('transform', `translate(${(width - margin * 2) / 2},${(height - margin * 2) / 2})`);
      });
    },
    [radialSize, width, height, margin],
  );

  const addPolygon = useCallback(
    (data: D3RadarData[][], label: ChartLabel[]) => {
      const allAxis = data[0].map((el) => el.axisKr);
      const angleSlice = (Math.PI * 2) / allAxis.length;
      const radialScale = d3
        .scaleLinear()
        .rangeRound([0, radialSize / 2])
        .domain([0, 100]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('.polygon')
        .data(data)
        .join('polygon')
        .attr('points', (d) => {
          let verticesString = '';
          d.forEach((el, i) => {
            verticesString += `${radialScale(el.value) * Math.cos(angleSlice * i - Math.PI / 2)},${
              radialScale(el.value) * Math.sin(angleSlice * i - Math.PI / 2)
            } `;
          });
          return verticesString;
        })
        .attr('stroke-width', '1px')
        .attr('stroke', (d, i) => label[i].color)
        .attr('fill', (d, i) => label[i].color)
        .attr('fill-opacity', '.1')
        .attr('transform', `translate(${(width - margin * 2) / 2},${(height - margin * 2) / 2})`);
    },
    [radialSize, width, margin, height],
  );

  const drawChart = useCallback(
    (data: D3RadarData[][], label: ChartLabel[]) => {
      addGridLine();
      addAxisLine(data);
      addAxisLabel(data);
      addTick();
      addVertice(data, label);
      addPolygon(data, label);
    },
    [addGridLine, addAxisLine, addAxisLabel, addTick, addVertice, addPolygon],
  );

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select(parrentClass).select('svg').attr('width', width).attr('height', height).selectAll('g').remove();
    select(parrentClass).select('svg').selectAll('defs').remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'radar-chart')
      .attr('width', width - margin * 2)
      .attr('height', height - margin * 2)
      .attr('transform', `translate(${margin},${margin})`);

    drawChart(chartData, labelList);
  }, [chartData, drawChart, margin, parrentClass, width, height]);

  return (
    <div className="radar-chart" css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
};

export default RadarChart;
