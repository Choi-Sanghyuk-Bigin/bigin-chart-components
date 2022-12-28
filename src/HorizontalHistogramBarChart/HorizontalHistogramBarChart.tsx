import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './HorizontalHistogramBarChart.style';

interface ChartLabel {
  color: string;
  labelTitle: string;
  labelValue: string;
}

export interface D3HistogramBarData {
  title: string;
  female: number | string;
  male: number | string;
}

interface HorizontalHistogramBarChartProps {
  config: { width: number; height: number };
  labelList: ChartLabel[];
  dataList: D3HistogramBarData[];
  parrentClass: string;
}

export const HorizontalHistogramBarChart = ({
  config,
  labelList,
  dataList,
  parrentClass,
}: HorizontalHistogramBarChartProps): React.ReactElement => {
  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);

  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 10, right: 10, left: 10, bottom: 10 }), []);
  const yTickSize = 150;

  const addYAxis = useCallback(
    (_data: D3HistogramBarData[]) => {
      const y = d3
        .scaleBand()
        .rangeRound([0, vh - (margin.top + margin.bottom) * 2])
        .domain(_data.map((d) => d.title));

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_y')
        .attr('transform', `translate(${vw / 2 + 40}, ${margin.top + margin.bottom})`)
        .attr('font-anchor', 'middle')
        .style('color', '#626871')
        .style('font-size', '12px')
        .call(d3.axisLeft(y).tickSize(0));
    },
    [vh, parrentClass, margin, vw],
  );

  const addXAxisLeft = useCallback(() => {
    const tickCount = 11;
    const tickStep = 100 / (tickCount - 1);
    const step = (tickStep / (tickCount - 1)) * (tickCount - 1);
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
      .domain([100, 0]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'axis_x axis_x_left')
      .attr('transform', `translate(20, ${vh - margin.bottom})`)
      .style('color', '#626871')
      .style('font-size', '12px')
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickValues(d3.range(0, 100 + step, step))
          .tickFormat((s) => `${s}%`),
      );
  }, [vw, parrentClass]);

  const addXAxisRight = useCallback(() => {
    const tickCount = 11;
    const tickStep = 100 / (tickCount - 1);
    const step = (tickStep / (tickCount - 1)) * (tickCount - 1);
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
      .domain([0, 100]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'axis_x axis_x_right')
      .attr('transform', `translate(${vw / 2 + yTickSize / 2 + 18}, ${vh - margin.bottom})`)
      .style('color', '#626871')
      .style('font-size', '12px')
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickValues(d3.range(0, 100 + step, step))
          .tickFormat((s) => `${s}%`),
      );
  }, [vw, parrentClass]);

  const addGridLeft = useCallback(() => {
    const tickCount = 11;
    const tickStep = 100 / (tickCount - 1);
    const step = (tickStep / (tickCount - 1)) * (tickCount - 1);
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
      .domain([100, 0]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(20, ${margin.top + margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(vh - (margin.top + margin.bottom) * 2)
          .tickValues(d3.range(0, 100 + step, step))
          .tickFormat(() => ''),
      );
  }, [vw, parrentClass]);

  const addGridRight = useCallback(() => {
    const tickCount = 11;
    const tickStep = 100 / (tickCount - 1);
    const step = (tickStep / (tickCount - 1)) * (tickCount - 1);
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
      .domain([0, 100]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${vw / 2 + yTickSize / 2 + 20}, ${margin.top + margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(vh - (margin.top + margin.bottom) * 2)
          .tickValues(d3.range(0, 100 + step, step))
          .tickFormat(() => ''),
      );
  }, [vw, parrentClass]);

  const addShapeLeft = useCallback(
    (_data: D3HistogramBarData[]) => {
      const negativeData = _data.map((el) => ({ ...el, female: -+el.female }));
      const x = d3
        .scaleLinear()
        .rangeRound([vw / 2 - yTickSize / 2 - 10, 0])
        .domain([0, -100]);
      const y = d3
        .scaleBand()
        .rangeRound([0, vh - (margin.top + margin.bottom) * 2])
        .domain(_data.map((d) => d.title));

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.bar')
        .data(negativeData)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(Math.min(0, d.female)))
        // @ts-ignore
        .attr('y', (d) => y(d.title))
        .attr('width', (d) => (x(0) - x(d.female) > 0 ? x(0) - x(d.female) : 0))
        .attr('height', 20)
        .attr('fill', labelList[0].color)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('transform', `translate(${margin.left + 10}, ${margin.top + margin.bottom + 6})`);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('._bar')
        .data(negativeData)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(Math.min(0, d.female)))
        // @ts-ignore
        .attr('y', (d) => y(d.title))
        .attr('width', (d) => (x(0) - x(d.female) - 4 > 0 ? x(0) - x(d.female) - 4 : 0))
        .attr('height', 20)
        .attr('fill', labelList[0].color)
        .attr('transform', `translate(${margin.left + 14}, ${margin.top + margin.bottom + 6})`);
    },
    [parrentClass, vw, vh, yTickSize, margin, labelList],
  );

  const addShapeRight = useCallback(
    (_data: D3HistogramBarData[]) => {
      const x = d3
        .scaleLinear()
        .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
        .domain([0, 100]);
      const y = d3
        .scaleBand()
        .rangeRound([0, vh - (margin.top + margin.bottom) * 2])
        .domain(_data.map((d) => d.title));

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.bar')
        .data(_data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(Math.min(0, +d.male)))
        .attr('y', (d) => `${y(d.title)}`)
        .attr('width', (d) => (x(+d.male) - x(0) > 0 ? x(+d.male) - x(0) : 0))
        .attr('height', 20)
        .attr('fill', labelList[1].color)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('transform', `translate(${vw / 2 + yTickSize / 2 + 20}, ${margin.top + margin.bottom + 6})`);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.bar')
        .data(_data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(Math.min(0, +d.male)))
        .attr('y', (d) => `${y(d.title)}`)
        .attr('width', (d) => (x(+d.male) - x(0) - 4 > 0 ? x(+d.male) - x(0) - 4 : 0))
        .attr('height', 20)
        .attr('fill', labelList[1].color)
        .attr('transform', `translate(${vw / 2 + yTickSize / 2 + 20}, ${margin.top + margin.bottom + 6})`);
    },
    [parrentClass, vw, vh, yTickSize, margin, labelList],
  );

  const drawChart = useCallback(
    (chartDataList: D3HistogramBarData[]) => {
      addYAxis(chartDataList);
      addXAxisLeft();
      addXAxisRight();
      addGridLeft();
      addGridRight();
      addShapeLeft(chartDataList);
      addShapeRight(chartDataList);
    },
    [addYAxis, addXAxisLeft, addXAxisRight, addGridLeft, addGridRight, addShapeLeft, addShapeRight],
  );

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select(parrentClass).select('svg').attr('width', width).attr('height', height).selectAll('g').remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'horizontal-histogram-bar-chart')
      .attr('width', width - margin.left - margin.right > 0 ? width - margin.left - margin.right : 0)
      .attr('height', height)
      .attr('transform', `translate(-4, 0)`);

    setVw(parseInt(select(parrentClass).select('svg').attr('width'), 10) - margin.left - margin.right);
    setVh(parseInt(select(parrentClass).select('svg').attr('height'), 10) - margin.top - margin.bottom);

    drawChart(dataList);
  }, [width, height, margin, labelList, dataList, parrentClass, drawChart]);

  return (
    <div css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
};

export default HorizontalHistogramBarChart;
