import React, { useCallback, useEffect, useMemo, useRef } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select, Simulation, SimulationNodeDatum } from 'd3';
import baseCss from './WordCloudChart.style';
import numberFormatter from '../../../utils/number.utils';

interface WordCloudChartProps {
  dataList: { title: string; value: string | number }[];
  parrentClass: string;
  config: { width: number; height: number };
}

function WordCloudChart({ dataList, parrentClass, config }: WordCloudChartProps) {
  const fontColor = useMemo(
    () => ['#006FFF', '#000A29', '#7CB4FC', '#CC9966', '#27C28A', '#E65C5C', '#8F9CC4', '#FFAB00', '#7E8696'],
    [],
  );
  const fontSize = useMemo(() => [42, 36, 30, 25, 22, 19, 19, 16], []);
  const fontWeight = useMemo(() => [700, 700, 700, 700, 700, 700, 400], []);
  const chartData = useMemo(
    () =>
      dataList.map((el, i) => ({
        title: el.title,
        value: el.value,
        color: fontColor[i] || '#7E8696',
        size: fontSize[i] || 14,
        weight: fontWeight[i] || 400,
      })),
    [dataList],
  );
  const { width, height } = config;

  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 10, right: 16, left: 34, bottom: 10 }), []);
  const yTickSize = 46;

  const drawChart = useCallback(
    (
      chartDataList: {
        title: string;
        value: string | number;
        color: string;
        size: number;
        weight: number;
      }[],
    ) => {
      const tool = d3
        .select('#root')
        .append('div')
        .attr('class', `${parrentClass.slice(1)}-word-cloud-chart-tooltip`)
        .style('position', 'absolute')
        .style('z-index', 9999)
        .style('visibility', 'hidden');

      const toolHtml = (d: { title: string; value: string | number; color: string; size: number; weight: number }) => `
    <div class="tool-tip" style="position:absolute;z-index:9999;min-width:200px;">
      <div style="background-color:black;padding:16px;border-radius: 8px;color:#ffffff">
        <div style="font-size:18px;font-weight:700;margin-bottom:16px">
          ${d.title}
        </div>
        <div style="border:1px solid #424448;width:100%;margin-bottom:16px"></div>
        <div style="display:flex;align-items:center;">
          <div style="background-color:${d.color};width:12px;height:12px;border-radius:2px;margin-right:8px;${
        d.color === '#000A29' ? 'border:0.5px solid white' : ''
      }"></div>
          <span style="margin-right:8px;">구매: </span>
          <span style="margin-right:8px;">
            ${numberFormatter(+d.value)}회
          </span>
        </div>
      </div>
    </div>
    `;

      const text = select(parrentClass)
        .select('svg')
        .append('g')
        .selectAll('text')
        .data(chartDataList)
        .join('text')
        .style('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 700)
        .text((d, i) => (i < 8 ? [...d.title].slice(0, d.size / 3).join('') : ''));

      const text2 = select(parrentClass)
        .select('svg')
        .append('g')
        .selectAll('tstextpan')
        .data(chartDataList)
        .join('text')
        .style('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 700)
        .text((d, i) =>
          i < 8
            ? `${[...d.title].slice(d.size / 3, (d.size * 3) / 7).join('')}${
                [...d.title].slice((d.size * 3) / 7).length > 0 ? '...' : ''
              }`
            : '',
        );

      const node = select(parrentClass)
        .select('svg')
        .append('g')
        .selectAll('circle')
        .data(chartDataList)
        .join('circle')
        .attr('r', (d) => d.size)
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('text-anchor', 'middle')
        .text((d) => d.title)
        .attr('fill', (d) => d.color)
        .attr('opacity', 0.7)
        .attr('font-size', (d) => d.size)
        .attr('font-weight', (d) => d.weight)
        .on('mousemove', (e, d) => {
          tool.html(toolHtml(d));
          tool
            .style('visibility', 'visible')
            .style('top', `${e.pageY + 10}px`)
            .style('left', `${e.pageX + -160}px`);
        })
        .on('mouseout', () => {
          tool.style('visibility', 'hidden');
        });

      const simulation = d3
        .forceSimulation()
        .force(
          'center',
          d3
            .forceCenter()
            .x(width / 2)
            .y(height / 2),
        ) // Attraction to the center of the svg area
        .force('charge', d3.forceManyBody().strength(0.5)) // Nodes are attracted one each other of value is > 0
        .force('collide', d3.forceCollide().strength(1).radius(32).iterations(2)); // Force that avoids circle overlapping

      simulation
        .nodes(chartDataList as SimulationNodeDatum[])
        .on('tick', function (this: Simulation<SimulationNodeDatum, undefined>) {
          text.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y - 2);
          text2.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y + 10);
          node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
        });
    },
    [width, height],
  );

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-word-cloud-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-word-cloud-chart-tooltip`).remove();

    select(parrentClass)
      .select('svg')
      .attr('width', width > 12 ? width - 12 : 0)
      .attr('height', height)
      .selectAll('g')
      .remove();
    select(parrentClass).select('svg').selectAll('defs').remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'word-group')
      .attr('width', width - margin.left - margin.right - yTickSize)
      .attr('height', height)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    drawChart(chartData);
  }, [width, dataList, chartData, drawChart, height, margin, parrentClass]);

  return (
    <div css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
}

export default WordCloudChart;
