import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './BarChart.style';

export interface D3BarData {
  title: string;
  value: number | string;
  percent?: number | string;
}

interface BarChartProps {
  config: { width: number; height: number };
  dataList: D3BarData[][];
  parrentClass: string;
  colorList?: string[];
  barThickness?: number;
  noGrid?: boolean;
  noYAxis?: boolean;
  isDash?: boolean;
  moveXAxisRight?: number;
  moveDashBarRight?: number;
  controlSVGWidth?: number;
  noColorList?: boolean;
  toolHtml?: (d: any, noColorList?: boolean) => string;
}

const BarChart = ({
  config,
  dataList,
  parrentClass,
  colorList,
  barThickness,
  noGrid,
  noYAxis,
  moveXAxisRight = 0,
  moveDashBarRight = 0,
  controlSVGWidth = 0,
  isDash,
  noColorList,
  toolHtml,
}: BarChartProps) => {
  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);

  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 10, right: 16, left: 34, bottom: 10 }), []);
  const yTickSize = useMemo(() => (noYAxis ? 0 : 46), [noYAxis]);

  const color = useMemo(() => ['#006FFF', '#000A29', '#7E8696', '#7CB4FC', '#8F9CC4', '#CC9966', '#27C28A'], []);

  const getMinMaxValue = (data: D3BarData[][]) => {
    if (!data || data.length === 0) return { max: 0, min: 0 };
    const arr = data.reduce((prev, curr) => [...prev, ...curr], []);
    const yValues: number[] = arr.map((value) => parseInt(`${value.value}`, 10));
    return { max: Math.max(...yValues), min: Math.min(...yValues) };
  };

  const addYAxis = useCallback(
    (data: D3BarData[][]) => {
      const ticksCount = 5;
      const yMin = 0;
      const { max: yMax } = getMinMaxValue(data);

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMax]);

      const tickStep = (yMax - yMin) / (ticksCount - 1);
      const step = (tickStep / 4) * 4;

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_y')
        .style('color', '#626871')
        .style('font-size', '12px')
        .attr('transform', 'translate(0, -20)')
        .call(
          d3
            .axisLeft(y)
            .tickSize(0)
            .tickValues(d3.range(yMin, yMax + step, step))
            .tickFormat(
              noYAxis
                ? () => ''
                : (s) =>
                    `${new Intl.NumberFormat('en-US', {
                      notation: 'compact',
                    }).format(s as number)}`,
            ),
        );
    },
    [vh, parrentClass, noYAxis],
  );

  const addXAxis = useCallback(
    (data: D3BarData[]) => {
      const x = d3
        .scaleBand()
        .rangeRound([0, vw])
        .domain(data.map((el) => el.title));

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_x')
        .style('color', '#626871')
        .style('font-size', '12px')
        .attr('transform', `translate(${(margin.left - margin.right) / 2 + moveXAxisRight}, ${vh - 8})`)
        .attr('font-anchor', 'middle')
        .call(
          d3
            .axisBottom(x)
            .tickSize(0)
            .tickFormat((d) => (d.length > 8 ? `${d.slice(0, 8)}...` : d)),
        );
    },
    [vw, vh, margin, parrentClass, moveXAxisRight],
  );

  const addGrid = useCallback(
    (data: D3BarData[][]) => {
      const ticksCount = 4;
      const yMin = 0;
      const { max: yMax } = getMinMaxValue(data);

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMax]);

      const tickStep = (yMax - yMin) / ticksCount;
      const step = (tickStep / 5) * 5;
      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'grid')
        .attr('width', width)
        .attr('height', vh)
        .call(
          d3
            .axisLeft(y)
            .tickSize(-width)
            .tickValues(noGrid ? [0] : d3.range(yMin, yMax + step, step))
            .tickFormat(() => ''),
        );

      select(parrentClass).select('svg').selectAll('.grid').attr('transform', `translate(10, -20)`);
    },
    [vh, width, parrentClass, noGrid],
  );

  const addShape = useCallback(
    (_data: D3BarData[], thickness = 80) => {
      const x = d3
        .scaleBand()
        .rangeRound([0, vw])
        .domain(_data.map((el) => el.title));

      const yMin = 0;
      const { max: yMax } = getMinMaxValue([_data]);

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMax]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('rect')
        .data(_data)
        .join('rect')
        .attr('x', (d) => `${(x(d.title) ?? 0) + vw / (_data.length * 2) - thickness / 2}`)
        .attr('y', (d) => y(+d.value))
        .attr('class', (d, i) => `point-${i}`)
        .attr('width', thickness)
        .attr('height', (d) => (y(0) - y(+d.value) > 0 ? y(0) - y(+d.value) : 0))
        .attr('rx', '4')
        .attr('ry', '4')
        .attr('fill', (d, i) => (colorList ? colorList[i] : color[i]))
        .attr('transform', `translate(${(margin.left - margin.right) / 2 + moveXAxisRight}, -20)`);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('rect')
        .data(_data)
        .join('rect')
        .attr('x', (d) => `${(x(d.title) ?? 0) + vw / (_data.length * 2) - thickness / 2}`)
        .attr('y', (d) => y(+d.value / 2))
        .attr('class', (d, i) => `point-${i}`)
        .attr('width', thickness)
        .attr('height', (d) => (y(0) - y(+d.value / 2) > 0 ? y(0) - y(+d.value / 2) : 0))
        .attr('fill', (d, i) => (colorList ? colorList[i] : color[i]))
        .attr('transform', `translate(${(margin.left - margin.right) / 2 + moveXAxisRight}, -20)`);

      if (isDash) {
        select(parrentClass)
          .select('svg')
          .select('g')
          .select('g')
          .selectAll('lines-ax')
          .data(_data.slice(1))
          .join('line')
          .attr('class', 'line')
          .attr('x1', (d) => `${x(d.title)}`)
          .attr('y1', () => height)
          .attr('x2', (d) => `${x(d.title)}`)
          .attr('stroke', '#DCE0E8')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', 3)
          .attr('opacity', '.5')
          .attr('transform', `translate(${margin.left + margin.right + moveDashBarRight}, -20)`);
      }

      if (toolHtml) {
        const dataWidthIndex = _data.map((el, i) => ({ ...el, index: i }));
        const tool = d3
          .select('#root')
          .append('div')
          .attr('class', `${parrentClass.slice(1)}-bar-chart-tooltip`)
          .style('position', 'absolute')
          .style('visibility', 'hidden');

        select(parrentClass)
          .select('svg')
          .select('g')
          .append('g')
          .selectAll('rect')
          .data(dataWidthIndex)
          .join('rect')
          .attr('x', (d) => `${(x(d.title) ?? 0) + vw / (_data.length * 2) - thickness / 2}`)
          .attr('y', () => 0)
          .attr('class', (d, i) => `point-${i}`)
          .attr('width', thickness)
          .attr('height', () => y(0))
          .attr('rx', '4')
          .attr('ry', '4')
          .attr('fill', () => 'rgba(0,0,0,0)')
          .attr('transform', `translate(${(margin.left - margin.right) / 2 + moveXAxisRight}, -20)`)
          .on('mousemove', (event, d) => {
            if (noColorList) {
              tool.html(toolHtml(d, noColorList));
            } else {
              tool.html(toolHtml(d));
            }
            tool
              .style('visibility', 'visible')
              .style('top', `${event.pageY + 10}px`)
              .style('left', `${event.pageX + -100}px`);
          })
          .on('mouseout', () => {
            tool.style('visibility', 'hidden');
          });
      }
    },
    [color, margin, parrentClass, vh, vw, colorList, isDash, height, moveDashBarRight, noColorList],
  );

  const drawChart = useCallback(
    (chartDataList: D3BarData[][]) => {
      addYAxis(chartDataList);
      addXAxis(chartDataList[0]);
      addGrid(chartDataList);
      addShape(chartDataList[0], barThickness);
    },
    [addGrid, addShape, addXAxis, addYAxis, barThickness],
  );

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-bar-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-bar-chart-tooltip`).remove();

    select(parrentClass)
      .select('svg')
      .attr('width', width - 12 + controlSVGWidth > 0 ? width - 12 + controlSVGWidth : 0)
      .attr('height', height)
      .selectAll('g')
      .remove();
    select(parrentClass).select('svg').selectAll('defs').remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'line-group')
      .attr('width', width - margin.left - margin.right - yTickSize)
      .attr('height', height)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    setVw(parseInt(select(parrentClass).select('svg').attr('width'), 10) - margin.left - margin.right);
    setVh(parseInt(select(parrentClass).select('svg').attr('height'), 10) - margin.top - margin.bottom);

    drawChart(dataList);
  }, [dataList, drawChart, height, margin, parrentClass, width, controlSVGWidth]);

  return (
    <div className="bar-chart" css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
};

export default BarChart;
