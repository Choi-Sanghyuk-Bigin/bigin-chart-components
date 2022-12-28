import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './TwoYAxisLineChart.style';
import { D3lineData } from '../LineChart/LineChart';

interface ChartLabel {
  color: '#006fff' | '#000A29' | string;
  labelTitle: string;
  labelValue: string;
}

interface TwoYAxisLineChartProps {
  config: { width: number; height: number };
  labelList: ChartLabel[];
  dataList: D3lineData[][];
  parrentClass: string;
  toolHtml?: (d: [number, number, number], day: string[]) => string;
  xFormat: '%m-%d' | '%y-%m' | '%w';
  chartName?: string;
  leftLabel: string;
  rightLabel: string;
  rightLabelDown?: number;
  isPoint?: boolean;
}

export const TwoYAxisLineChart = ({
  config,
  labelList,
  dataList,
  parrentClass,
  toolHtml,
  xFormat,
  chartName,
  leftLabel,
  rightLabel,
  rightLabelDown,
  isPoint,
}: TwoYAxisLineChartProps) => {
  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);
  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 10, right: 34, left: 34, bottom: 10 }), []);
  const day = useMemo(() => ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'], []);
  const [yMaxValueLeft, setYMaxValueLeft] = useState<number>(0);
  const [yMaxValueRigth, setYMaxValueRight] = useState<number>(0);

  const getMinMaxValue = (data: D3lineData[]) => {
    if (!data || data.length === 0) return { max: 0, min: 0 };
    const arr = data.map((el) => +el.value);
    return { max: Math.max(...arr), min: Math.min(...arr) };
  };

  const getPeriodRange = (data: D3lineData[]) => {
    if (!data || data.length === 0) return [];
    return data
      .map((value) => (typeof value.period === 'number' ? value.period : new Date(value.period)))
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

  const addLeftYAxis = useCallback(
    (data: D3lineData[], data2?: D3lineData[]) => {
      const ticksCount = 5;
      const yMin = 0;
      const { max: yMax } = getMinMaxValue(data);
      setYMaxValueLeft(yMax);
      if (data2) {
        const { max: yMax2 } = getMinMaxValue(data2);
        setYMaxValueLeft(Math.max(yMax, yMax2));
      }

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMaxValueLeft]);

      const tickStep = (yMaxValueLeft - yMin) / (ticksCount - 1);
      const step = (tickStep / 4) * 4;

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_y')
        .style('color', '#626871')
        .style('font-size', '12px')
        .attr('transform', `translate(${margin.left}, -20)`)
        .call(
          d3
            .axisLeft(y)
            .tickSize(0)
            .tickValues(d3.range(yMin, yMaxValueLeft + step, step))
            .tickFormat(
              (s) =>
                `${new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                }).format(s as number)}`,
            ),
        );
    },
    [vh, margin, parrentClass, dataList, yMaxValueLeft],
  );

  const addRightYAxis = useCallback(
    (data: D3lineData[], data2?: D3lineData[]) => {
      const ticksCount = 5;
      const yMin = 0;
      const { max: yMax } = getMinMaxValue(data);
      setYMaxValueRight(yMax);
      if (data2) {
        const { max: yMax2 } = getMinMaxValue(data2);
        setYMaxValueRight(Math.max(yMax, yMax2));
      }
      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMaxValueRigth]);

      const tickStep = (yMaxValueRigth - yMin) / (ticksCount - 1);
      const step = (tickStep / 4) * 4;

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_y')
        .style('color', '#626871')
        .style('font-size', '12px')
        .attr('transform', `translate(${vw - margin.right - 10}, -20)`)
        .call(
          d3
            .axisRight(y)
            .tickSize(0)
            .tickValues(d3.range(yMin, yMaxValueRigth + step, step))
            .tickFormat(
              (s) =>
                `${new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                }).format(s as number)}`,
            ),
        );
    },
    [vh, vw, margin, parrentClass, yMaxValueRigth],
  );

  const addXAxis = useCallback(
    (data: D3lineData[]) => {
      const periodRange = getPeriodRange(data);

      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - margin.right * 5])
        .domain([periodRange[0], periodRange[data.length - 1]]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_x')
        .style('color', '#626871')
        .style('font-size', '12px')
        .attr('transform', `translate(${12 + (margin.left + margin.right)}, ${vh - 8})`)
        .attr('font-anchor', 'middle')
        .call(
          d3
            .axisBottom(x)
            .tickSize(0)
            .tickValues(periodRange)
            .tickFormat((d) => (xFormat === '%w' ? day[+d] : d3.timeFormat(xFormat || '%m-%d')(new Date(`${d}`)))),
        );
    },
    [vw, margin, parrentClass, vh, xFormat],
  );

  const addGrid = useCallback(
    (data: D3lineData[]) => {
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
        .call(
          d3
            .axisLeft(y)
            .tickSize(-(width - margin.left * 5))
            .tickValues(d3.range(yMin, yMax + step, step))
            .tickFormat(() => ''),
        );

      select(parrentClass).select('svg').selectAll('.grid').attr('transform', `translate(40, -20)`);
    },
    [margin, vh, width, parrentClass],
  );

  const addShape = useCallback(
    (_data: D3lineData[], label: ChartLabel, yMaxProps: number) => {
      const periodRange = getPeriodRange(_data);
      const data: [string | number, number][] = [];
      _data.forEach((el) => {
        data.push([el.period, +el.value]);
      });

      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - margin.right * 5])
        .domain([periodRange[0], periodRange[_data.length - 1]]);

      const yMin = 0;
      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMaxProps]);

      const line = d3
        .line()
        .x((d) => x(new Date(d[0])))
        .y((d) => y(d[1]));

      if (yMaxProps) {
        select(parrentClass)
          .select('svg')
          .select('g')
          .selectAll('.line')
          .data([data])
          .join('path')
          .attr('class', `${label.labelValue}-line`)
          .attr('transform', `translate(${12 + (margin.left + margin.right)}, -20)`)
          .attr('fill', 'none')
          .attr('stroke', label.color)
          .attr('stroke-width', 2)
          .attr('d', (d) => line(d as any));

        const area = d3
          .area()
          .x((d) => x(new Date(d[0])))
          .y0(vh)
          .y1((d) => y(d[1]));

        select(parrentClass)
          .select('svg')
          .select('g')
          .selectAll('.area')
          .data([data])
          .join('path')
          .attr('class', 'gredient-area')
          .attr('transform', `translate(${12 + (margin.left + margin.right)}, -20)`)
          .attr('d', (d) => area(d as any))
          .style('fill', `url(#${label.labelValue})`);
        if (isPoint) {
          select(parrentClass)
            .select('svg')
            .select('g')
            .selectAll('.point')
            .data(_data)
            .join('rect')
            .attr('class', `${label.labelValue}-point`)
            .attr('width', 4)
            .attr('height', 4)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('fill', label.color)
            .attr('transform', `translate(${12 - 2 + (margin.left + margin.right)}, -22)`)
            .attr('x', (d) => x(new Date(d.period)))
            .attr('y', (d) => y(d.value as number));
        }
      }
    },
    [vw, margin, vh, parrentClass, isPoint],
  );

  const addLabel = useCallback(() => {
    // 왼쪽 label
    select(parrentClass)
      .select('svg')
      .select('g')
      .append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('font-size', '12px')
      .attr('fill', '#53585F')
      .attr('y', -margin.left + 20)
      .attr('x', -4)
      .text(leftLabel);

    // 오른쪽 label
    select(parrentClass)
      .select('svg')
      .select('g')
      .append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(90)')
      .attr('font-size', '12px')
      .attr('fill', '#53585F')
      .attr('y', -vw - 6)
      .attr('x', 30 + (rightLabelDown ?? 0))
      .text(rightLabel);
  }, [vw, margin, parrentClass, leftLabel, rightLabel, rightLabelDown]);

  const addToolTip = useCallback(() => {
    if (toolHtml) {
      const tool = d3
        .select('#root')
        .append('div')
        .attr('class', `${parrentClass.slice(1)}-two-Yaxis-line-chart-tooltip`)
        .style('position', 'absolute')
        .style('visibility', 'hidden');

      const toolData = dataList[0].map((el, i) => [el.period, el.value, dataList[1][i].value]) as [
        number,
        number,
        number,
      ][];

      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - margin.right * 5])
        .domain([0, toolData.length - 1]);

      const y = d3
        .scaleLinear()
        .rangeRound([vh, 30])
        .domain([0, Math.max(...toolData.map((el) => el[2]))]);

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .selectAll('.rect')
        .data(toolData)
        .join('rect')
        .attr('x', (d) => x(d[0]))
        .attr('y', () => 0)
        .attr('width', 30)
        .attr('height', () => y(0))
        .attr('fill', 'rgb(0,0,0,0)')
        .attr('transform', `translate(${12 + (margin.left + margin.right) - 15}, -20)`)
        .on('mousemove', (e, d) => {
          tool.html(toolHtml(d, day));
          tool
            .style('visibility', 'visible')
            .style('top', `${e.pageY + 10}px`)
            .style('left', `${e.pageX + -160}px`);
        })
        .on('mouseout', () => {
          tool.style('visibility', 'hidden');
        });
    }
  }, [vw, vh, margin, day, toolHtml, dataList, parrentClass]);

  const drawChart = useCallback(
    (chartDataList: D3lineData[][], label: ChartLabel[]) => {
      if (chartName === 'CustomerProfileStatus') {
        addLeftYAxis(chartDataList[0], chartDataList[1]);
        addRightYAxis(chartDataList[2], chartDataList[3]);
      } else {
        addLeftYAxis(chartDataList[0]);
        addRightYAxis(chartDataList[1]);
      }
      addXAxis(chartDataList[0]);
      addGrid(chartDataList[0]);
      if (chartName === 'CustomerProfileStatus') {
        addShape(chartDataList[0], label[0], yMaxValueLeft);
        addShape(chartDataList[1], label[1], yMaxValueLeft);
        addShape(chartDataList[2], label[2], yMaxValueRigth);
        addShape(chartDataList[3], label[3], yMaxValueRigth);
      } else {
        addShape(chartDataList[0], label[0], yMaxValueLeft);
        addShape(chartDataList[1], label[1], yMaxValueRigth);
      }
      addLabel();
      if (toolHtml) addToolTip();
    },
    [
      addLeftYAxis,
      addRightYAxis,
      addXAxis,
      addGrid,
      addShape,
      addLabel,
      addToolTip,
      toolHtml,
      chartName,
      yMaxValueLeft,
      yMaxValueRigth,
    ],
  );

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-two-Yaxis-line-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-two-Yaxis-line-chart-tooltip`).remove();

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
      .attr('width', width - margin.left - margin.right)
      .attr('height', height)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    setVw(parseInt(select(parrentClass).select('svg').attr('width'), 10) - margin.left - margin.right);
    setVh(parseInt(select(parrentClass).select('svg').attr('height'), 10) - margin.top - margin.bottom);

    // CREATE Gradient
    const defs = select(parrentClass).select('svg').append('defs');
    labelList.forEach((list) => {
      const linearGradient = defs
        .append('linearGradient')
        .attr('id', `${list.labelValue}`)
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', '100%')
        .attr('y2', 0);

      linearGradient.append('stop').attr('offset', '0%').attr('stop-color', list.color).attr('stop-opacity', '0');
      linearGradient.append('stop').attr('offset', '100%').attr('stop-color', list.color).attr('stop-opacity', '.1');
    });

    drawChart(dataList, labelList);
  }, [width, dataList, labelList, drawChart, height, margin, parrentClass]);

  return (
    <div css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
};

export default TwoYAxisLineChart;
