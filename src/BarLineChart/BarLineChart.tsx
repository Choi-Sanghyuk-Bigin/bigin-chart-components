import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './BarLineChart.style';
import numberFormatter from '../../../utils/number.utils';

export interface D3BarLineData {
  period: string;
  value: number | string;
}

interface ChartLabel {
  color: '#006fff' | '#7CB4FC' | '#000A29' | string;
  labelTitle: string;
  labelValue: string;
}

interface BarLineChartProps {
  config: { width: number; height: number };
  labelList: ChartLabel[];
  parrentClass: string;
  dataList: D3BarLineData[][];
  total?: number;
  xFormat: '%y-%m' | '%w';
}

function BarLineChart({ config, labelList, parrentClass, dataList, total, xFormat }: BarLineChartProps) {
  const day = useMemo(() => ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'], []);
  const [pointClass, setPointClass] = useState<string>('');
  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);

  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 10, right: 30, left: 40, bottom: 10 }), []);
  const yTickSize = 46;

  const getMinMaxValue = (data: D3BarLineData[]) => {
    if (!data || data.length === 0) return { max: 0, min: 0 };
    const yValues: number[] = data.map((value) => parseInt(`${value.value}`, 10));
    return { max: Math.max(...yValues), min: Math.min(...yValues) };
  };

  const getPeriodRange = (data: D3BarLineData[]) => {
    if (!data || data.length === 0) return [];
    return data
      .map((value) => new Date(value.period))
      .sort((a, b) => {
        if (a > b) {
          return 1;
        }
        if (a < b) {
          return -1;
        }
        return 0;
      });
  };

  const addYAxis = useCallback(
    (data: D3BarLineData[]) => {
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
    (data: D3BarLineData[]) => {
      const periodRange = getPeriodRange(data);

      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - margin.right - margin.left])
        .domain([periodRange[0], periodRange[data.length - 1]]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_x')
        .attr('transform', `translate(${15 + (margin.left + margin.right) / 2}, ${vh - 8})`)
        .attr('font-anchor', 'middle')
        .call(
          d3
            .axisBottom(x)
            .tickSize(0)
            .tickValues(periodRange)
            .tickFormat((d) =>
              xFormat === '%y-%m'
                ? d3.timeFormat(xFormat)(new Date(`${d}`))
                : day[+d3.timeFormat(xFormat)(new Date(`${d}`))],
            ),
        );
    },
    [vw, margin.right, margin.left, parrentClass, vh, xFormat, day],
  );

  const addGrid = useCallback(
    (data: D3BarLineData[]) => {
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

  const addRect = useCallback(
    (_data: D3BarLineData[], label: ChartLabel, _data2: D3BarLineData[]) => {
      const periodRange = getPeriodRange(_data);

      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - margin.right - margin.left])
        .domain([periodRange[0], periodRange[_data.length - 1]]);

      const yMin = 0;
      const { max: yMax } = getMinMaxValue(_data);

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMax]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('rect')
        .data(_data)
        .join('rect')
        .attr('x', (d) => x(new Date(d.period)))
        .attr('y', (d) => y(+d.value))
        .attr('class', (d, i) => `point-${i}`)
        .attr('width', 30)
        .attr('height', (d) => (y(0) - y(+d.value) > 0 ? y(0) - y(+d.value) : 0))
        .attr('rx', '4')
        .attr('ry', '4')
        .attr('fill', () => label.color)
        .attr('transform', `translate(${(margin.left + margin.right) / 2}, -20)`);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('rect')
        .data(_data)
        .join('rect')
        .attr('x', (d) => x(new Date(d.period)))
        .attr('y', (d) => y(+d.value / 2))
        .attr('class', (d, i) => `point-${i}`)
        .attr('width', 30)
        .attr('height', (d) => (y(0) - y(+d.value / 2) > 0 ? y(0) - y(+d.value / 2) : 0))
        .attr('fill', () => label.color)
        .attr('transform', `translate(${(margin.left + margin.right) / 2}, -20)`);

      const tool = d3
        .select('#root')
        .append('div')
        .attr('class', `${parrentClass.slice(1)}-bar-line-chart-tooltip`)
        .style('position', 'absolute')
        .style('visibility', 'hidden');

      // mouseover 영역을 위한 rect
      const data = _data.map((el, i) => ({ ...el, value2: _data2[i].value }));
      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', (d) => x(new Date(d.period)))
        .attr('y', () => 0)
        .attr('class', (d, i) => `point-${i}`)
        .attr('width', 30)
        .attr('height', () => (y(0) > 0 ? y(0) : 0))
        .attr('fill', 'rgb(0,0,0,0)')
        .attr('transform', `translate(${(margin.left + margin.right) / 2}, -20)`)
        .on('mousemove', (e, d) => {
          setPointClass(e.target.getAttribute('class'));
          tool.html(
            `<div class="tool-tip" style="position:absolute;z-index:9999;width:300px;">
              <div style="background-color:black;padding:16px;border-radius: 8px;color:#ffffff">
                <div style="font-size:18px;font-weight:700;margin-bottom:16px">
                  ${
                    xFormat === '%w'
                      ? day[+d3.timeFormat('%w')(new Date(d.period))]
                      : d3.timeFormat('%y년 %m월')(new Date(d.period))
                  }
                </div>
                <div style="border:1px solid #424448;width:100%;margin-bottom:16px"></div>
                <div style="display:flex;align-items:center;">
                  <div style="background-color:${
                    labelList[0].color
                  };width:12px;height:12px;border-radius:2px;margin-right:8px;"></div>
                  <span style="margin-right:8px;">${labelList[0].labelTitle}: </span>
                  <span style="margin-right:8px;">
                    ${d.value && total && ((+d.value * 100) / total).toFixed(2)}%
                  </span>
                  <span>(${numberFormatter(+d.value)}원)</span>
                </div>
                <div style="display:flex;align-items:center;">
                  <div style="background-color:${
                    labelList[1].color
                  };width:12px;height:12px;border-radius:2px;margin-right:8px;border:0.5px solid #DCE0E8"></div>
                  <span style="margin-right:8px;">${labelList[1].labelTitle}:</span>
                  <span>
                    ${(+d.value2).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>`,
          );
          tool
            .style('visibility', 'visible')
            .style('top', `${e.pageY}px`)
            .style('left', `${e.pageX + 30}px`);
        })
        .on('mouseout', () => {
          setPointClass('');
          tool.style('visibility', 'hidden');
        });
    },
    [day, labelList, margin, parrentClass, total, vh, vw, xFormat],
  );

  const addLine = useCallback(
    (_data: D3BarLineData[], label: ChartLabel) => {
      const periodRange = getPeriodRange(_data);

      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - margin.right - margin.left])
        .domain([periodRange[0], periodRange[_data.length - 1]]);

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([0, 100]);

      // line
      const line = d3
        .line()
        .x((d: any) => x(new Date(d.period)))
        .y((d: any) => y(+d.value));

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.line')
        .data([_data])
        .join('path')
        .attr('transform', `translate(${15 + (margin.left + margin.right) / 2}, -20)`)
        .attr('fill', 'none')
        .attr('stroke', label.color)
        .attr('stroke-width', 2)
        .attr('d', (d) => line(d as any));

      // point
      const initData = (data: D3BarLineData[], color: string) =>
        data.map((el: D3BarLineData) => ({ ...el, parentColor: color }));

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('.point')
        .data(initData(_data, label.color))
        .join('rect')
        .attr('class', (d, i) => `point-${i}`)
        .attr('width', 10)
        .attr('height', 10)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', (d) => d.parentColor)
        .attr('transform', `translate(${10 + (margin.left + margin.right) / 2}, -25)`)
        .attr('x', (d) => x(new Date(d.period)))
        .attr('y', (d) => y(+d.value))
        .style('opacity', (d, i) => (pointClass === `point-${i}` ? '1' : '0'));
    },
    [margin, parrentClass, pointClass, vh, vw],
  );

  const drawChart = useCallback(
    (chartDataList: D3BarLineData[][]) => {
      addYAxis(chartDataList[0]);
      addXAxis(chartDataList[0]);
      addGrid(chartDataList[0]);
      addRect(chartDataList[0], labelList[0], chartDataList[1]);
      addLine(chartDataList[1], labelList[1]);
    },
    [addGrid, addLine, addRect, addXAxis, addYAxis, labelList],
  );

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-bar-line-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-bar-line-chart-tooltip`).remove();

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

export default BarLineChart;
