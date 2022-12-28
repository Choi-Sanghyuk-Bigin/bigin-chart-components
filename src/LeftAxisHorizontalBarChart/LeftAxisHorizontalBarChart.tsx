import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './LeftAxisHorizontalBarChart.style';

interface ChartLabel {
  color: string;
  labelTitle: string;
  labelValue: string;
}

export interface D3LeftAxisHorizontalBarChartData {
  title: string;
  female: number;
  male: number;
}

interface LeftAxisHorizontalBarChartProps {
  config: { width: number; height: number };
  labelList: ChartLabel[];
  dataList: D3LeftAxisHorizontalBarChartData[];
  parrentClass: string;
}

export const LeftAxisHorizontalBarChart = ({
  config,
  labelList,
  dataList,
  parrentClass,
}: LeftAxisHorizontalBarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);

  const { width, height } = config;
  const margin = useMemo(() => ({ top: 10, right: 10, left: 10, bottom: 10 }), []);
  const yTickSize = useMemo(() => 70, []);
  const maxValue = useMemo(() => {
    const max = Math.max(...dataList.reduce((p, c) => [...p, c.female, c.male], [0]));
    return max % 5000 === 0 ? max : (Math.floor(max / 5000) + 1) * 5000;
  }, [dataList]);

  const tickCount = useMemo(() => 6, []);
  const tickStep = useMemo(() => maxValue / (tickCount - 1), [maxValue]);
  const step = useMemo(() => (tickStep / (tickCount - 1)) * (tickCount - 1), [tickStep]);

  const addYAxis = useCallback(
    (_data: D3LeftAxisHorizontalBarChartData[]) => {
      const y = d3
        .scaleBand()
        .rangeRound([0, vh - (margin.top + margin.bottom) * 2])
        .domain(_data.map((d) => d.title));

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_y')
        .attr('transform', `translate(${yTickSize}, ${margin.top + margin.bottom})`)
        .attr('font-anchor', 'middle')
        .style('color', '#626871')
        .style('font-size', '12px')
        .call(d3.axisLeft(y).tickSize(0));
    },
    [vh, parrentClass],
  );

  const addXAxisLeft = useCallback(() => {
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
      .domain([maxValue, 0]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'axis_x axis_x_left')
      .attr('transform', `translate(${yTickSize + margin.left + 18}, ${vh - margin.bottom})`)
      .style('color', '#626871')
      .style('font-size', '12px')
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickValues(d3.range(0, maxValue + step, step))
          .tickFormat(
            (s) =>
              `${new Intl.NumberFormat('en-US', {
                notation: 'compact',
              }).format(s as number)}`,
          ),
      );
  }, [vw, vh, maxValue, parrentClass, step]);

  const addXAxisRight = useCallback(() => {
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
      .domain([0, maxValue]);

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
          .tickValues(d3.range(0, maxValue + step, step))
          .tickFormat(
            (s) =>
              `${new Intl.NumberFormat('en-US', {
                notation: 'compact',
              }).format(s as number)}`,
          ),
      );
  }, [vw, vh, maxValue, parrentClass, step]);

  const addGridLeft = useCallback(() => {
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
      .domain([maxValue, 0]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${yTickSize + margin.left + 18}, ${margin.top + margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(vh - (margin.top + margin.bottom) * 2)
          .tickValues(d3.range(0, maxValue + step, step))
          .tickFormat(() => ''),
      );
  }, [vw, vh, maxValue, parrentClass, step]);

  const addGridRight = useCallback(() => {
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
      .domain([0, maxValue]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${vw / 2 + yTickSize / 2 + 18}, ${margin.top + margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(vh - (margin.top + margin.bottom) * 2)
          .tickValues(d3.range(0, maxValue + step, step))
          .tickFormat(() => ''),
      );
  }, [vw, parrentClass, maxValue, yTickSize, step]);

  const addAxisLineMiddle = useCallback(() => {
    const y = d3.scaleBand().rangeRound([0, vh - (margin.top + margin.bottom) * 2]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'axis_mid')
      .attr('transform', `translate(${vw / 2 + yTickSize / 2 + 18}, ${margin.top + margin.bottom})`)
      .call(d3.axisLeft(y).tickSize(0));
  }, [vh, vw]);

  const addShapeLeft = useCallback(
    (_data: D3LeftAxisHorizontalBarChartData[]) => {
      const negativeData = _data.map((el) => ({ ...el, female: -el.female }));
      const x = d3
        .scaleLinear()
        .rangeRound([vw / 2 - yTickSize / 2 - 10, 0])
        .domain([0, -maxValue]);
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
        .attr('transform', `translate(${yTickSize + margin.left + 18}, ${margin.top + margin.bottom + 6})`);

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
        .attr('transform', `translate(${yTickSize + margin.left + 22}, ${margin.top + margin.bottom + 6})`);
    },
    [parrentClass, vw, vh, labelList, maxValue],
  );

  const addShapeRight = useCallback(
    (_data: D3LeftAxisHorizontalBarChartData[]) => {
      const x = d3
        .scaleLinear()
        .rangeRound([0, vw / 2 - yTickSize / 2 - 10])
        .domain([0, maxValue]);
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
        .attr('transform', `translate(${vw / 2 + yTickSize / 2 + 18}, ${margin.top + margin.bottom + 6})`);

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
        .attr('transform', `translate(${vw / 2 + yTickSize / 2 + 18}, ${margin.top + margin.bottom + 6})`);
    },
    [parrentClass, vw, vh, labelList, maxValue],
  );

  const drawChart = useCallback(
    (chartDataList: D3LeftAxisHorizontalBarChartData[]) => {
      addYAxis(chartDataList);
      addXAxisLeft();
      addXAxisRight();
      addGridLeft();
      addGridRight();
      addAxisLineMiddle();
      addShapeLeft(chartDataList);
      addShapeRight(chartDataList);
    },
    [addYAxis, addXAxisLeft, addXAxisRight, addGridLeft, addGridRight, addAxisLineMiddle, addShapeLeft, addShapeRight],
  );

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select(parrentClass).select('svg').attr('width', width).attr('height', height).selectAll('g').remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'left-axis-horizontal-bar-chart')
      .attr('width', width - margin.left - margin.right > 0 ? width - margin.left - margin.right : 0)
      .attr('height', height)
      .attr('transform', `translate(-4, 0)`);

    setVw(parseInt(select(parrentClass).select('svg').attr('width'), 10) - margin.left - margin.right);
    setVh(parseInt(select(parrentClass).select('svg').attr('height'), 10) - margin.top - margin.bottom);

    drawChart(dataList);
  }, [width, height, margin, dataList, parrentClass, drawChart]);

  return (
    <div css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
};

export default LeftAxisHorizontalBarChart;
