import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './HorizontalHistogramOverlabBarChart.style';

export interface D3HorizontalHistogramOverlabBarData {
  title: string;
  female: number | string;
  male: number | string;
  femaleCount: number;
  maleCount: number;
}

interface ChartLabel {
  color: string;
  labelTitle: string;
  labelValue: string;
}

interface HorizontalHistogramOverlabBarChartProps {
  config: { width: number; height: number };
  labelList: ChartLabel[];
  parrentClass: string;
  dataList: D3HorizontalHistogramOverlabBarData[];
  toolHtml?: (d: D3HorizontalHistogramOverlabBarData, label?: ChartLabel[]) => string;
}

const HorizontalHistogramOverlabBarChart = ({
  config,
  labelList,
  parrentClass,
  dataList,
  toolHtml,
}: HorizontalHistogramOverlabBarChartProps): React.ReactElement => {
  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);

  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 10, right: 10, left: 10, bottom: 10 }), []);
  const yTickSize = 60;

  const addYAxis = useCallback(
    (_data: D3HorizontalHistogramOverlabBarData[]) => {
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
        .call(d3.axisLeft(y).tickSize(0));
    },
    [vh, parrentClass, margin, vw],
  );

  const addXAxis = useCallback(() => {
    const tickCount = 6;
    const tickStep = 100 / (tickCount - 1);
    const step = (tickStep / (tickCount - 1)) * (tickCount - 1);
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw - yTickSize - margin.left])
      .domain([0, 100]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'axis_x axis_x_right')
      .attr('transform', `translate(${yTickSize + margin.left + 8}, ${vh - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickValues(d3.range(0, 100 + step, step))
          .tickFormat((s) => `${s}%`),
      );
  }, [vw, parrentClass, margin]);

  const addGrid = useCallback(() => {
    const tickCount = 6;
    const tickStep = 100 / (tickCount - 1);
    const step = (tickStep / (tickCount - 1)) * (tickCount - 1);
    const x = d3
      .scaleLinear()
      .rangeRound([0, vw - yTickSize - margin.left])
      .domain([0, 100]);

    select(parrentClass)
      .select('svg')
      .select('g')
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${yTickSize + margin.left + 8}, ${margin.top + margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(vh - (margin.top + margin.bottom) * 2)
          .tickValues(d3.range(0, 100 + step, step))
          .tickFormat(() => ''),
      );
  }, [vw, parrentClass]);

  const addShapeRight = useCallback(
    (_data: D3HorizontalHistogramOverlabBarData[]) => {
      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - yTickSize - margin.left])
        .domain([0, 100]);
      const y = d3
        .scaleBand()
        .rangeRound([0, vh - (margin.top + margin.bottom) * 2])
        .domain(_data.map((d) => d.title));

      for (let i = 0; i < _data.length * 2; i += 1) {
        const index = Math.floor(i / 2);

        const shape = (dataI: number, data: string) => {
          const colorIndex = data === labelList[0].labelValue ? 0 : 1;
          select(parrentClass)
            .select('svg')
            .select('g')
            .append('g')
            .append('rect')
            .attr('class', 'bar')
            .attr('x', x(Math.min(0, +(_data[dataI] as any)[data])))
            .attr('y', `${y(_data[dataI].title)}`)
            .attr('width', x(+(_data[dataI] as any)[data]) - x(0) > 0 ? x(+(_data[dataI] as any)[data]) - x(0) : 0)
            .attr('height', 20)
            .attr('fill', labelList[colorIndex].color)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('transform', `translate(${yTickSize + margin.left + 8}, ${margin.top + margin.bottom + 6})`);

          select(parrentClass)
            .select('svg')
            .select('g')
            .append('g')
            .append('rect')
            .attr('class', 'bar')
            .attr('x', x(Math.min(0, +(_data[dataI] as any)[data]) / 2))
            .attr('y', `${y(_data[dataI].title)}`)
            .attr(
              'width',
              (x(+(_data[dataI] as any)[data]) - x(0)) / 2 > 0 ? (x(+(_data[dataI] as any)[data]) - x(0)) / 2 : 0,
            )
            .attr('height', 20)
            .attr('fill', labelList[colorIndex].color)
            .attr('transform', `translate(${yTickSize + margin.left + 8}, ${margin.top + margin.bottom + 6})`);
        };

        if ((_data[index] as any)[labelList[0].labelValue] > (_data[index] as any)[labelList[1].labelValue]) {
          shape(index, labelList[0].labelValue);
          shape(index, labelList[1].labelValue);
        } else {
          shape(index, labelList[1].labelValue);
          shape(index, labelList[0].labelValue);
        }
      }

      if (toolHtml) {
        const tool = d3
          .select('#root')
          .append('div')
          .attr('class', `${parrentClass.slice(1)}-horizontal-histogram-overlab-bar-chart-tooltip`)
          .style('position', 'absolute')
          .style('visibility', 'hidden');

        select(parrentClass)
          .select('svg')
          .select('g')
          .append('g')
          .selectAll('.rect')
          .data(_data)
          .join('rect')
          .attr('class', 'bar')
          .attr('x', () => 0)
          .attr('y', (d) => `${y(d.title)}`)
          .attr('width', () => (x(100) > 0 ? x(100) : 0))
          .attr('height', 20)
          .attr('fill', 'rgba(0,0,0,0)')
          .attr('transform', `translate(${yTickSize + margin.left + 8}, ${margin.top + margin.bottom + 6})`)
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
    [parrentClass, vw, vh, yTickSize, margin, labelList, toolHtml],
  );

  const drawChart = useCallback(
    (chartDataList: D3HorizontalHistogramOverlabBarData[]) => {
      addYAxis(chartDataList);
      addXAxis();
      addGrid();
      addShapeRight(chartDataList);
    },
    [addYAxis, addXAxis, addGrid, addShapeRight],
  );

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-horizontal-histogram-overlab-bar-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-horizontal-histogram-overlab-bar-chart-tooltip`).remove();

    select(parrentClass)
      .select('svg')
      .attr('width', width - margin.left - margin.right > 0 ? width - margin.left - margin.right : 0)
      .attr('height', height)
      .selectAll('g')
      .remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'horizontal-histogram-overlab-bar-chart')
      .attr('width', width)
      .attr('height', height);

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

export default HorizontalHistogramOverlabBarChart;
