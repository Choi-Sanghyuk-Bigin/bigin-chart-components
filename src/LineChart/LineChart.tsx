import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './LineChart.style';

export interface ChartLabel {
  color: '#006fff' | '#7CB4FC' | '#000A29' | string;
  labelTitle: string;
  labelValue: string;
}

export interface D3lineData {
  period: string | number;
  value: number | string;
}

export interface LineChartProps {
  config: { width: number; height: number };
  labelList: ChartLabel[];
  dataList: D3lineData[][];
  parrentClass: string;
  isPoint?: boolean;
  isDash?: boolean;
  isOverPoint?: boolean;
  isOverDash?: boolean;
  xFormat?: '%m-%d' | '%y-%m' | '%w';
  isYPercent?: boolean;
  isZoomAble?: boolean;
  toolHtml?: (d: D3lineData, label?: ChartLabel[], xFormat?: '%m-%d' | '%y-%m' | '%w', day?: string[]) => string;
}

export const LineChart = ({
  config,
  labelList,
  dataList,
  parrentClass,
  isPoint,
  isDash,
  isOverPoint,
  isOverDash,
  toolHtml,
  xFormat,
  isYPercent,
  isZoomAble,
}: LineChartProps) => {
  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);
  const [pointClass, setPointClass] = useState<string>('');
  const [currentZoomState, setCurrentZoomState] = useState<d3.ZoomTransform>();

  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 10, right: 16, left: 34, bottom: 10 }), []);
  const yTickSize = 46;
  const day = useMemo(() => ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'], []);

  const getMinMaxValue = (data: D3lineData[][]) => {
    if (!data || data.length === 0) return { max: 0, min: 0 };
    const arr = data.reduce((prev, curr) => [...prev, ...curr], []);
    const yValues: number[] = arr.map((value) => parseInt(`${value.value}`, 10));
    return { max: Math.max(...yValues), min: Math.min(...yValues) };
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

  const initData = (data: D3lineData[][], label: ChartLabel[]) => {
    let listData: { period: string | number; value: number | string; parentColor: string }[] = [];
    data.forEach((el, i) => {
      listData = listData.concat(el.map((el2: D3lineData) => ({ ...el2, parentColor: label[i].color })));
    });
    return listData;
  };

  const addYAxis = useCallback(
    (data: D3lineData[][]) => {
      const ticksCount = 5;
      const yMin = 0;
      let { max: yMax } = getMinMaxValue(data);
      if (isYPercent) yMax = 100;

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMax]);

      const tickStep = (yMax - yMin) / (ticksCount - 1);
      const step = (tickStep / 4) * 4;

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_y')
        .attr('transform', 'translate(0, -20)')
        .style('color', '#626871')
        .style('font-size', '12px')
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
    [vh, parrentClass, isYPercent],
  );

  const addXAxis = useCallback(
    (data: D3lineData[]) => {
      const periodRange = getPeriodRange(data);

      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - margin.right - margin.left])
        .domain([periodRange[0], periodRange[data.length - 1]]);

      if (isZoomAble) {
        if (currentZoomState) {
          const newXScale = currentZoomState.rescaleX(x);
          x.domain(newXScale.domain());
        }
      }

      select(parrentClass)
        .select('svg')
        .select('g')
        .append('g')
        .attr('class', 'axis_x')
        .attr('transform', `translate(${12 + (margin.left + margin.right) / 2}, ${vh - 8})`)
        .attr('font-anchor', 'middle')
        .style('color', '#626871')
        .style('font-size', '12px')
        .call(
          d3
            .axisBottom(x)
            .tickSize(0)
            .tickValues(periodRange)
            .tickFormat((d) => (xFormat === '%w' ? day[+d] : d3.timeFormat(xFormat || '%m-%d')(new Date(`${d}`)))),
        );
    },
    [vw, margin, parrentClass, vh, xFormat, isZoomAble, currentZoomState],
  );

  const addGrid = useCallback(
    (data: D3lineData[][]) => {
      const ticksCount = 4;
      const yMin = 0;
      let { max: yMax } = getMinMaxValue(data);
      if (isYPercent) yMax = 100;
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
    (_data: D3lineData[][], label: ChartLabel[]) => {
      const periodRange = getPeriodRange(_data[0]);
      const data: [string | number, number][][] = [];
      _data.forEach((el) => {
        const arr: [string | number, number][] = [];
        el.forEach((d) => arr.push([d.period, +d.value]));
        data.push(arr);
      });

      const x = d3
        .scaleLinear()
        .rangeRound([0, vw - margin.right - margin.left])
        .domain([periodRange[0], periodRange[_data[0].length - 1]]);

      const yMin = 0;
      let { max: yMax } = getMinMaxValue(_data);
      if (isYPercent) yMax = 100;

      const y = d3.scaleLinear().rangeRound([vh, 30]).domain([yMin, yMax]);

      if (isZoomAble) {
        if (currentZoomState) {
          const newXScale = currentZoomState.rescaleX(x);
          x.domain(newXScale.domain());
        }
      }

      // line
      const line = d3
        .line()
        .x((d) => x(new Date(d[0])))
        .y((d) => y(d[1]));

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('.line')
        .data(data)
        .join('path')
        .attr('transform', `translate(${12 + (margin.left + margin.right) / 2}, -20)`)
        .attr('fill', 'none')
        .attr('stroke', (d, i) => label[i].color)
        .attr('stroke-width', 2)
        .attr('d', (d) => line(d as any));

      // gredient area
      const area = d3
        .area()
        .x((d) => x(new Date(d[0])))
        .y0(vh)
        .y1((d) => y(d[1]));

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('.area')
        .data(data)
        .join('path')
        .attr('class', 'area')
        .attr('transform', `translate(${12 + (margin.left + margin.right) / 2}, -20)`)
        .attr('d', (d) => area(d as any))
        .style('fill', (d, i) => `url(#${label[i].labelValue})`);

      if (isPoint) {
        // point
        select(parrentClass)
          .select('svg')
          .select('g')
          .selectAll('.point')
          .data(initData(_data, labelList))
          .join('rect')
          .attr('class', 'point')
          .attr('width', isOverPoint ? 10 : 4)
          .attr('height', isOverPoint ? 10 : 4)
          .attr('rx', 2)
          .attr('ry', 2)
          .attr('fill', (d) => d.parentColor)
          // eslint-disable-next-line no-nested-ternary
          .style('opacity', (d, i) => (isOverPoint ? (pointClass === `point-${i % _data[0].length}` ? '1' : '0') : '1'))
          .attr(
            'transform',
            `translate(${10 - (isOverPoint ? 3 : 0) + (margin.left + margin.right) / 2}, -${
              22 + (isOverPoint ? 3 : 0)
            })`,
          )
          .attr('x', (d) => x(new Date(d.period)))
          .attr('y', (d) => y(+d.value));
      }

      if (isDash) {
        // dash line
        select(parrentClass)
          .select('svg')
          .select('g')
          .selectAll('lines-ax')
          .data(_data[0])
          .join('line')
          .attr('class', 'line')
          .attr('x1', (d) => x(new Date(d.period)))
          .attr('y1', () => height - margin.bottom - margin.top)
          .attr('x2', (d) => x(new Date(d.period)))
          .attr('y2', (d) => y(isOverDash ? yMax : +d.value))
          .attr('stroke', `${labelList[0].color}`)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', 4)
          .attr('opacity', (d, i) =>
            // eslint-disable-next-line no-nested-ternary
            isOverPoint ? (pointClass === `point-${i % _data[0].length}` ? '.5' : '0') : '.5',
          )
          .attr('transform', `translate(${12 + (margin.left + margin.right) / 2}, -20)`);
      }

      if (toolHtml) {
        const tool = d3
          .select('#root')
          .append('div')
          .attr('class', `${parrentClass.slice(1)}-line-chart-tooltip`)
          .style('position', 'absolute')
          .style('z-index', 9999)
          .style('visibility', 'hidden');

        const toolData = (dataListOfTool: any) => {
          const newArr = new Array(dataListOfTool[0].length).fill({});
          dataListOfTool.forEach((arr: object[]) => {
            arr.forEach((obj: any, i: number) => {
              const newObj = Object.entries(newArr[i]).length === 0 ? {} : newArr[i];
              Object.entries(obj).forEach((el) => {
                if (newObj[el[0]]) {
                  newObj[el[0]] = [...newObj[el[0]], el[1]];
                } else {
                  newObj[el[0]] = [el[1]];
                }
              });
              newArr[i] = newObj;
            });
          });
          return newArr;
        };

        select(parrentClass)
          .select('svg')
          .select('g')
          .append('g')
          .selectAll('.rect')
          .data(toolData(_data))
          .join('rect')
          .attr('x', (d) => x(new Date(d.period[0])))
          .attr('y', () => 0)
          .attr('width', 30)
          .attr('height', () => y(0))
          .attr('class', (d, i) => `point-${i % _data[0].length}`)
          .attr('fill', 'rgb(0,0,0,0)')
          .attr('transform', `translate(${12 + (margin.left + margin.right) / 2 - 15}, -20)`)
          .on(
            'mousemove',
            toolHtml
              ? (e: any, d) => {
                  setPointClass(e.target.getAttribute('class'));
                  tool.html(toolHtml(d, labelList, xFormat, day));
                  tool
                    .style('visibility', 'visible')
                    .style('top', `${e.pageY + 10}px`)
                    .style('left', `${e.pageX + -160}px`);
                }
              : () => {
                  setPointClass('');
                },
          )
          .on('mouseout', () => {
            setPointClass('');
            tool.style('visibility', 'hidden');
          });
      }
      if (isZoomAble) {
        select(parrentClass)
          .select('svg')
          .select('g')
          .append('g')
          .append('rect')
          .attr('class', 'blind')
          .attr('width', 100)
          .attr('height', height * 2)
          .attr('fill', '#FFFFFF')
          .attr('transform', `translate(-90,0)`);
      }
    },
    [
      vw,
      margin,
      vh,
      parrentClass,
      isPoint,
      isDash,
      labelList,
      height,
      toolHtml,
      xFormat,
      isOverPoint,
      isOverDash,
      pointClass,
      isZoomAble,
      currentZoomState,
    ],
  );
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const drawChart = useCallback(
    (chartDataList: D3lineData[][], label: ChartLabel[]) => {
      addGrid(chartDataList);
      addXAxis(chartDataList[0]);
      addShape(chartDataList, label);
      addYAxis(chartDataList);
    },
    [addGrid, addShape, addXAxis, addYAxis],
  );

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-line-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-line-chart-tooltip`).remove();

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
    if (isZoomAble) {
      const svg = select(svgRef.current);
      const zoomBehavior: any = d3
        .zoom()
        .scaleExtent([1, 5])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on('zoom', () => {
          const zoomState = d3.zoomTransform(svg.node()!);
          setCurrentZoomState(zoomState);
        });
      zoomBehavior(svg);
      if (isFirst) {
        svg.call(zoomBehavior.transform, d3.zoomIdentity.scale(4).translate(-1170, 0));
        setIsFirst(false);
      }
    }
    drawChart(dataList, labelList);
  }, [width, dataList, labelList, drawChart, height, margin, parrentClass, currentZoomState, isZoomAble]);
  useEffect(() => {
    setIsFirst(true);
  }, [isZoomAble]);

  return (
    <div css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
};

export default LineChart;
