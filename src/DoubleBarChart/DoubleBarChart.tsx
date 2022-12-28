import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './DoubleBarChart.style';

export interface D3DoubleBarData {
  product: string;
  view: number | string;
  purchase: number | string;
}

interface ChartLabel {
  color: string;
  labelTitle: string;
  labelValue: string;
}

interface DoubleBarChartProps {
  config: { width: number; height: number };
  labelList: ChartLabel[];
  parrentClass: string;
  dataList: D3DoubleBarData[][];
  isDash?: boolean;
  toolHtml?: (d: any, label?: any) => string;
}

function DoubleBarChart({ config, labelList, parrentClass, dataList, isDash, toolHtml }: DoubleBarChartProps) {
  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);

  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 10, right: 16, left: 34, bottom: 10 }), []);
  const yTickSize = 46;

  const getMinMaxValue = (data: D3DoubleBarData[][]) => {
    if (!data || data.length === 0) return { max: 0, min: 0 };
    const arr = data.reduce((prev, curr) => [...prev, ...curr], []);
    const yValues1: number[] = arr.map((value) => parseInt(`${value.view}`, 10));
    const yValues2: number[] = arr.map((value) => parseInt(`${value.purchase}`, 10));
    return { max: Math.max(...yValues1, ...yValues2), min: Math.min(...yValues1, ...yValues2) };
  };

  const addYAxis = useCallback(
    (data: D3DoubleBarData[][]) => {
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
        .attr('transform', 'translate(0, -20)')
        .call(
          d3
            .axisLeft(y)
            .tickSize(0)
            .tickValues(d3.range(yMin, yMax + step, step))
            .tickFormat(
              (s) =>
                `${new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                }).format(s as number)}`,
            ),
        );
    },
    [vh, parrentClass],
  );

  const addXAxis = useCallback(
    (data: D3DoubleBarData[]) => {
      const x = d3
        .scaleBand()
        .rangeRound([0, vw])
        .domain(data.map((el) => el.product));

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_x')
        .attr('transform', `translate(${12}, ${vh - 8})`)
        .attr('font-anchor', 'middle')
        .call(d3.axisBottom(x).tickSize(0));
    },
    [vw, margin, parrentClass, vh],
  );

  const addGrid = useCallback(
    (data: D3DoubleBarData[][]) => {
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
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .call(
          d3
            .axisLeft(y)
            .tickSize(-(width - margin.left - margin.right))
            .tickValues(d3.range(yMin, yMax + step, step))
            .tickFormat(() => ''),
        );

      select(parrentClass).select('svg').selectAll('.grid').attr('transform', `translate(10, -20)`);
    },
    [height, margin, vh, width, parrentClass],
  );

  const addShape = useCallback(
    (_data: D3DoubleBarData[]) => {
      const x = d3
        .scaleBand()
        .rangeRound([0, vw])
        .domain(_data.map((el) => el.product));

      const yMin = 0;
      const { max: yMax } = getMinMaxValue([_data]);

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMax]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.rect1')
        .data(_data)
        .join('rect')
        // @ts-ignore
        .attr('x', (d) => x(d.product))
        .attr('y', (d) => y(+d.view))
        .attr('class', (d, i) => `bar-rect1-${i}`)
        .attr('width', 40)
        .attr('height', (d) => (y(0) - y(+d.view) > 0 ? y(0) - y(+d.view) : 0))
        .attr('rx', '4')
        .attr('ry', '4')
        .attr('fill', () => labelList[0].color)
        .attr('transform', `translate(${margin.left}, -20)`);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.rect2')
        .data(_data)
        .join('rect')
        // @ts-ignore
        .attr('x', (d) => x(d.product))
        .attr('y', (d) => y(+d.purchase))
        .attr('class', (d, i) => `bar-rect2-${i}`)
        .attr('width', 40)
        .attr('height', (d) => (y(0) - y(+d.purchase) > 0 ? y(0) - y(+d.purchase) : 0))
        .attr('rx', '4')
        .attr('ry', '4')
        .attr('fill', () => labelList[1].color)
        .attr('transform', `translate(${margin.left * 2 + margin.right}, -20)`);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.rect1')
        .data(_data)
        .join('rect')
        // @ts-ignore
        .attr('x', (d) => x(d.product))
        .attr('y', (d) => y(+d.view / 2))
        .attr('class', (d, i) => `bar-rect1-${i}`)
        .attr('width', 40)
        .attr('height', (d) => (y(0) - y(+d.view / 2) > 0 ? y(0) - y(+d.view / 2) : 0))
        .attr('fill', () => labelList[0].color)
        .attr('transform', `translate(${margin.left}, -20)`);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.rect2')
        .data(_data)
        .join('rect')
        // @ts-ignore
        .attr('x', (d) => x(d.product))
        .attr('y', (d) => y(+d.purchase / 2))
        .attr('class', (d, i) => `bar-rect2-${i}`)
        .attr('width', 40)
        .attr('height', (d) => (y(0) - y(+d.purchase / 2) > 0 ? y(0) - y(+d.purchase / 2) : 0))
        .attr('fill', () => labelList[1].color)
        .attr('transform', `translate(${margin.left * 2 + margin.right}, -20)`);

      if (isDash) {
        select(parrentClass)
          .select('svg')
          .select('g')
          .select('g')
          .selectAll('lines-ax')
          .data(_data.slice(1))
          .join('line')
          .attr('class', 'line')
          // @ts-ignore
          .attr('x1', (d) => x(d.product))
          .attr('y1', () => vh)
          // @ts-ignore
          .attr('x2', (d) => x(d.product))
          .attr('stroke', '#DCE0E8')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', 3)
          .attr('opacity', '.5')
          .attr('transform', `translate(${margin.right - 4}, -20)`);
      }

      if (toolHtml) {
        const tool = d3
          .select('#root')
          .append('div')
          .attr('class', `${parrentClass.slice(1)}-double-bar-chart-tooltip`)
          .style('position', 'absolute')
          .style('visibility', 'hidden');

        select(parrentClass)
          .select('svg')
          .select('g')
          .append('g')
          .selectAll('.tool-rect')
          .data(_data)
          .join('rect')
          // @ts-ignore
          .attr('x', (d) => x(d.product))
          .attr('y', () => 0)
          .attr('width', 90)
          .attr('height', () => y(0))
          .attr('fill', 'rgb(0,0,0,0)')
          .attr('transform', `translate(${margin.left}, -20)`)
          .on('mousemove', (e, d) => {
            tool.html(toolHtml(d, labelList));
            tool
              .style('visibility', 'visible')
              .style('top', `${e.pageY + 10}px`)
              .style('left', `${e.pageX + -160}px`);
          })
          .on('mouseout', () => {
            tool.style('visibility', 'hidden');
          });
      }
    },
    [margin, parrentClass, vh, vw, labelList, isDash, toolHtml],
  );

  const drawChart = useCallback(
    (chartDataList: D3DoubleBarData[][]) => {
      addYAxis(chartDataList);
      addXAxis(chartDataList[0]);
      addGrid(chartDataList);
      addShape(chartDataList[0]);
    },
    [addYAxis, addXAxis, addGrid, addShape, dataList],
  );

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-double-bar-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-double-bar-chart-tooltip`).remove();

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
      .attr('class', 'line-group')
      .attr('width', width - margin.left - margin.right - yTickSize)
      .attr('height', height)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    setVw(parseInt(select(parrentClass).select('svg').attr('width'), 10) - margin.left - margin.right);
    setVh(parseInt(select(parrentClass).select('svg').attr('height'), 10) - margin.top - margin.bottom);

    drawChart(dataList);
  }, [dataList, drawChart, height, margin, parrentClass, width]);

  return (
    <div css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
}

export default DoubleBarChart;
