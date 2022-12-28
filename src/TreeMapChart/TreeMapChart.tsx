import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './TreeMapChart.style';
import numberFormatter from '../../../utils/number.utils';

interface D3TreeMapData {
  title: string;
  value: number | string;
}

interface DashboardTreeMapChartProps {
  config: { width: number; height: number };
  dataList: D3TreeMapData[];
  parrentClass: string;
}

function TreeMapChart({ config, dataList, parrentClass }: DashboardTreeMapChartProps) {
  const [vh, setVh] = useState<number>(0);
  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 16, right: 16, bottom: 10, left: 16 }), []);
  const fontSize = useMemo(() => ['24px', '20px', '18px', '18px', '16px', '16px'], []);

  const total = dataList.map((el) => el.value).reduce((a, b) => +a + +b, 0);

  const addShape = useCallback(
    (data: D3TreeMapData[]) => {
      // d3.hierarchy를 정의 하여 leaves 메소드로 데이터를 맵핑 하여 차트를 보여준다.
      // 해당 leaves 메소드가 주는 HierarchyNode타입으로 인해 any 로 지정 해주어야 해당 값을 참조 가능
      const root = d3.hierarchy({ children: data }).sum((d: any) => d.value);
      const opacity = [1, 0.7, 0.4, 0.3, 0.2, 0.16, 0.12, 0.08, 0.04, 0.02, 0.01];

      const tool = d3
        .select('#root')
        .append('div')
        .attr('class', `${parrentClass.slice(1)}-treemap-chart-tooltip`)
        .style('position', 'absolute')
        .style('visibility', 'hidden');

      d3.treemap().size([width, vh]).padding(1)(root);

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('rect')
        .data(root.leaves())
        .join('rect')
        .attr('x', (d: any) => d.x0)
        .attr('y', (d: any) => d.y0)
        .attr('width', (d: any) => (d.x1 - d.x0 > 0 ? d.x1 - d.x0 : 0))
        .attr('height', (d: any) => (d.y1 - d.y0 > 0 ? d.y1 - d.y0 : 0))
        .style('fill', '#006fff')
        .style('opacity', (d, i) => opacity[i])
        .on('mousemove', (e, d: any) => {
          const [rectFill, rectOpacity] = e.target.getAttribute('style').split(';').slice(0, -1);
          tool.html(
            `<div class="tool-tip" style="position:absolute;z-index:9999;">
          <div style="display:flex;background-color:black;padding:14px;align-items: center;gap:8px;border-radius: 8px;">
            <div style="width:12px;height:12px;background-color:white;">
              <div style="background-color:${rectFill.slice(6)};${rectOpacity};width:12px;height:12px;"></div>
            </div>
            <div style="color:white;font-size: 16px;font-weight: 400;width: fit-content;white-space:nowrap">${
              d.data.title
            }:</div>
            <div style="color:white;font-size: 16px;font-weight: 700;white-space:nowrap">${numberFormatter(
              d.data.value,
            )}명(${((d.data.value * 100) / +total).toFixed(1)}%)</div>
            </div>
          </div>`,
          );
          // @ts-ignore
          const toolBox = d3.select('.tool-tip').node().getBoundingClientRect();
          tool
            .style('visibility', 'visible')
            .style('top', `${e.pageY - toolBox.height / 2}px`)
            .style('left', `${e.pageX - toolBox.width - 20}px`);
        })
        .on('mouseout', () => tool.style('visibility', 'hidden'));

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('text')
        .data(root.leaves())
        .join('text')
        .attr('x', (d: any) => d.x0 + 15)
        .attr('y', (d: any) => d.y0 + 30)
        .attr('font-size', '14px')
        .attr('font-weight', 700)
        .attr('fill', (d, i) => (i === 0 ? 'white' : '#626871'))
        .text((d: any, i: number) => (i < 4 ? d.data.title : ''));

      select(parrentClass)
        .select('svg')
        .select('g')
        .selectAll('subtitle')
        .data(root.leaves())
        .join('text')
        .attr('x', (d: any) => d.x0 + 15)
        .attr('y', (d: any) => d.y0 + 54)
        .text((d: any, i: number) =>
          i < 4 ? `${numberFormatter(d.data.value)}명(${((d.data.value * 100) / +total).toFixed(1)}%)` : '',
        )
        .attr('font-size', (d, i) => fontSize[i] || '16px')
        .attr('font-weight', 700)
        .attr('fill', (d, i) => (i === 0 ? 'white' : '#626871'));
    },
    [parrentClass, total, vh, width],
  );

  const drawChart = useCallback(
    (data: D3TreeMapData[]) => {
      addShape(data);
    },
    [addShape],
  );

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-treemap-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-treemap-chart-tooltip`).remove();

    select(parrentClass)
      .select('svg')
      .attr('width', width > 16 ? width - 16 : 0)
      .attr('height', height)
      .selectAll('g')
      .remove();
    select(parrentClass).select('svg').selectAll('defs').remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'tree-map-group')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    setVh(parseInt(select(parrentClass).select('svg').attr('height'), 10) - margin.top - margin.bottom);

    drawChart(dataList);
  }, [width, dataList, height, margin, drawChart, parrentClass]);

  return (
    <div css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
}

export default TreeMapChart;
