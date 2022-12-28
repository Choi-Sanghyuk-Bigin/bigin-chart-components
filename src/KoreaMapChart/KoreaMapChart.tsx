import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import * as d3 from 'd3';
import { select } from 'd3';
import baseCss from './KoreaMapChart.style';
import krGeoJson from '../../../assets/geoJson/korea.json';
import numberFormatter, { devideNumber } from '../../../utils/number.utils';

export interface KoreaMapChartData {
  [item: string]: number;
}

interface KoreaMapChartProps {
  config: { width: number; height: number };
  parrentClass: string;
  data: KoreaMapChartData;
}

export const KoreaMapChart = ({ config, parrentClass, data }: KoreaMapChartProps): JSX.Element => {
  const [vw, setVw] = useState<number>(0);
  const [vh, setVh] = useState<number>(0);

  const { width, height } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => 10, []);

  const wholeData = useMemo(() => Object.values(data).reduce((prev, cur) => Number(cur) + Number(prev), 0), [data]);

  const getColorList = useMemo(() => {
    const valueArray: number[] = Object.values(data);
    return d3
      .scaleLinear<string, number>()
      .domain([Math.max(...valueArray), Math.min(...valueArray)])
      .range(['#006FFF', '#7CB4FC', '#a4c6ff', '#d2e3ff', '#e9f0ff']);
  }, [data]);

  const drawChart = useCallback(() => {
    // 지도정보
    const geojson = krGeoJson;

    // 지도를 그리기 위한 svg 선택
    const svg = d3.select(parrentClass).select('svg');

    // 배경 그리기

    // 지도가 그려지는 그래픽 노드(g) 생성
    const g = svg.append('g');
    // const effectLayer = g.append('g').classed('effect-layer', true);
    // 지도가 그려지는 그래픽 노드
    const mapLayer = g.append('g').attr('class', 'map-layer');
    // 아이콘이 그려지는 그래픽 노드

    // 지도의 출력 방법을 선택(메로카토르)
    const projection = d3.geoMercator().scale(1).translate([0, 0]);

    // svg 크기에 따라 출력될 지도의 크기를 다시 계산
    const path = d3.geoPath().projection(projection);
    const bounds = path.bounds(geojson as any);
    const widthScale = (bounds[1][0] - bounds[0][0]) / vw;
    const heightScale = (bounds[1][1] - bounds[0][1]) / vh;
    const scale = 1 / Math.max(widthScale, heightScale);
    const xoffset = width / 2 - (scale * (bounds[1][0] + bounds[0][0])) / 2 + 0;
    const yoffset = height / 2 - (scale * (bounds[1][1] + bounds[0][1])) / 2 + 0;
    const offset: [number, number] = [xoffset, yoffset];
    projection.scale(scale).translate(offset);

    // // 행정구역 가중치 따라 color 계산 // todo api 스펙에 따라 변경 필요
    const fillFn = (d: any) => {
      return getColorList(+data[d.properties.name]);
    };

    const tool = d3
      .select('#root')
      .append('div')
      .attr('class', `${parrentClass.slice(1)}-map-chart-tooltip`)
      .style('position', 'absolute')
      .style('visibility', 'hidden');

    // 지도 그리기
    mapLayer
      .selectAll('path')
      .data(geojson.features)
      .join('path')
      .attr('d', path as any)
      .attr('class', (d) => d.properties.name)
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('fill', fillFn)
      .on('mousemove', (e, d) => {
        tool.html(`
        <div style="height:56px;background-color:black;border-radius:8px;padding:16px;color:white;display:flex;align-items: center;gap:8px;">
          <div style="background-color:white;width:12px;height:12px;border-radius:2px;">
            <div style="background-color:${getColorList(
              data[d.properties.name],
            )};width:12px;height:12px;border-radius:2px;"></div>
          </div>
          <div style="font-size:16px;">${d.properties.name}:</div>
          <div>
            <span style="font-size:16px;font-weight:700;">${(
              devideNumber(Number(data[d.properties.name]), Number(wholeData)) * 100
            ).toFixed(2)}%</span>
            <span style="font-size:16px;">(${numberFormatter(data[d.properties.name])}명)</span>
          </div>
        </div>
        `);
        tool
          .style('visibility', 'visible')
          .style('top', `${e.pageY + 10}px`)
          .style('left', `${e.pageX + -160}px`);
      })
      .on('mouseout', () => {
        tool.style('visibility', 'hidden');
      });
  }, [parrentClass, vw, vh]);

  useEffect(() => {
    return () => {
      select('body').selectAll(`${parrentClass}-map-chart-tooltip`).remove();
    };
  }, []);

  useEffect(() => {
    if (!svgRef || !svgRef.current) return;

    select('body').selectAll(`${parrentClass}-map-chart-tooltip`).remove();

    select(parrentClass).select('svg').attr('width', width).attr('height', height).selectAll('g').remove();

    select(parrentClass)
      .select('svg')
      .append('g')
      .attr('class', 'korea-map-chart')
      .attr('width', width - margin)
      .attr('height', height)
      .attr('transform', `translate(${margin},${margin})`);

    setVw(parseInt(select(parrentClass).select('svg').attr('width'), 10) - margin - margin);
    setVh(parseInt(select(parrentClass).select('svg').attr('height'), 10) - margin - margin);

    drawChart();
  }, [width, drawChart, height, margin, parrentClass]);

  return (
    <div css={[baseCss]}>
      <svg ref={svgRef} />
    </div>
  );
};
