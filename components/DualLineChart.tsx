
import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { Block } from '../types';
import { fixTypography } from '../constants';

interface DualLineChartProps {
  block: Block;
  width: number;
  height: number;
}

const DualLineChart: React.FC<DualLineChartProps> = ({ block, width, height }) => {
  const config = block.config || {};
  const data = block.data;
  const years = data.map(d => d.year);
  
  const COLOR_1 = '#2E2A6D'; // Темно-синий
  const COLOR_2 = '#8B3A62'; // Пурпурный
  const AXIS_COLOR = '#D1D5DB';

  // Уменьшены отступы для большего растяжения графика
  const margin = { top: 12, right: 60, bottom: 12, left: 10 };
  const chartWidth = Math.max(0, width - margin.left - margin.right);
  const chartHeight = Math.max(0, height - margin.top - margin.bottom);

  const plotShift = 5; 

  const xScale = useMemo(() => 
    d3.scalePoint<number>()
      .domain(years)
      .range([plotShift + 10, chartWidth - 10])
      .padding(0),
    [years, chartWidth]
  );

  const yScale = useMemo(() => {
    const allVals = data.flatMap(d => d.values.slice(0, 2));
    const [minV, maxV] = d3.extent(allVals) as [number, number];
    const diff = (maxV - minV) || (maxV * 0.1) || 10;
    
    // Растягиваем шкалу максимально
    return d3.scaleLinear()
      .domain([minV - diff * 0.1, maxV + diff * 0.15])
      .range([chartHeight, 0]);
  }, [data, chartHeight]);

  const markerSize = 3.8;

  const processedPoints = useMemo(() => {
    return data.map((d) => {
      const v1 = d.values[0] || 0;
      const v2 = d.values[1] || 0;
      let y1 = yScale(v1);
      let y2 = yScale(v2);

      const minMarkerDist = 5.0;
      const dist = Math.abs(y1 - y2);
      if (dist < minMarkerDist) {
        const shift = (minMarkerDist - dist) / 2;
        if (v1 >= v2) {
          y1 -= shift;
          y2 += shift;
        } else {
          y1 += shift;
          y2 -= shift;
        }
      }

      let ly1, ly2;
      const labelOffset = 4.0;
      const labelH = 7.5;
      
      const forbidden = [
        { min: y1 - markerSize/2 - 0.5, max: y1 + markerSize/2 + 0.5 },
        { min: y2 - markerSize/2 - 0.5, max: y2 + markerSize/2 + 0.5 }
      ];

      const getSafePos = (y: number, val: number, otherVal: number, currentForbidden: any[]) => {
        const topY = y - labelOffset;
        const topCol = currentForbidden.some(f => topY - labelH < f.max && topY > f.min) || topY - labelH < -margin.top;
        if (!topCol) return { y: topY, type: 'top' };
        
        const bottomY = y + labelOffset + 6.0;
        const bottomCol = currentForbidden.some(f => bottomY - labelH < f.max && bottomY > f.min) || bottomY > chartHeight + 10;
        if (!bottomCol) return { y: bottomY, type: 'bottom' };

        return val >= otherVal ? { y: y - labelOffset, type: 'top' } : { y: y + labelOffset + 6.0, type: 'bottom' };
      };

      const res1 = getSafePos(y1, v1, v2, forbidden);
      forbidden.push({ min: res1.y - labelH, max: res1.y + 0.5 });
      const res2 = getSafePos(y2, v2, v1, forbidden);

      ly1 = res1.y;
      ly2 = res2.y;

      return {
        x: xScale(d.year) || 0,
        y1,
        y2,
        val1: v1,
        val2: v2,
        ly1,
        ly2
      };
    });
  }, [data, xScale, yScale, chartHeight, margin.top]);

  const renderTrend = (val: string, dir: string, type: string | undefined, yPos: number) => {
    const isUp = dir === 'up';
    const isDown = dir === 'down';
    const isNone = dir === 'none' || type === 'neutral';
    
    let trendColor = isUp ? '#D11D1D' : (isDown ? '#008B72' : '#9CA3AF');
    if (type === 'positive') trendColor = '#008B72';
    else if (type === 'negative') trendColor = '#D11D1D';
    else if (type === 'neutral') trendColor = '#9CA3AF';

    return (
      <g transform={`translate(${chartWidth + 12}, ${yPos})`}>
        {!isNone && isUp && (
          <g transform="translate(0, -4.0) scale(0.38)">
            <path d="M7 17L17 7M17 7H7M17 7V17" fill="none" stroke={trendColor} strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {!isNone && isDown && (
          <g transform="translate(0, -4.0) scale(0.38)">
            <path d="M7 7L17 17M17 17V7M17 17H7" fill="none" stroke={trendColor} strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        <text x={isNone ? 0 : 10} y={0} dy="0.32em" fill={trendColor} fontSize="9.5" fontWeight="700">
          {isNone && val === '0,0 %' ? '0 %' : fixTypography(val)}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full bg-white select-none overflow-hidden" style={{ fontFamily: 'Montserrat' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          
          <line x1={plotShift} y1={0} x2={plotShift} y2={chartHeight} stroke={AXIS_COLOR} strokeWidth="0.5" />
          <line x1={plotShift} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke={AXIS_COLOR} strokeWidth="0.5" />

          {yScale.ticks(5).map(v => {
            const y = yScale(v);
            if (y < -2 || y > chartHeight + 2) return null;
            return (
              <g key={v}>
                <line x1={plotShift - 2} y1={y} x2={plotShift} y2={y} stroke={AXIS_COLOR} strokeWidth="0.5" />
                <text x={plotShift - 4} y={y} dy="0.32em" textAnchor="end" fill="#9CA3AF" fontSize="5.5" fontWeight="400">{v}</text>
              </g>
            );
          })}

          <path d={d3.line<any>().x(p => p.x).y(p => p.y1).curve(d3.curveLinear)(processedPoints) || ''} fill="none" stroke={COLOR_1} strokeWidth="1.8" strokeLinejoin="round" />
          <path d={d3.line<any>().x(p => p.x).y(p => p.y2).curve(d3.curveLinear)(processedPoints) || ''} fill="none" stroke={COLOR_2} strokeWidth="1.8" strokeLinejoin="round" />

          {processedPoints.map((p, i) => (
            <React.Fragment key={i}>
              <line x1={p.x} y1={chartHeight} x2={p.x} y2={chartHeight + 3} stroke={AXIS_COLOR} strokeWidth="0.5" />
              <rect x={p.x - markerSize/2} y={p.y1 - markerSize/2} width={markerSize} height={markerSize} fill={COLOR_1} stroke="white" strokeWidth="0.6" />
              <text x={p.x} y={p.ly1} textAnchor="middle" fill={COLOR_1} fontSize="8.2" fontWeight="800" style={{pointerEvents:'none'}}>{p.val1.toLocaleString('ru-RU')}</text>
              <rect x={p.x - markerSize/2} y={p.y2 - markerSize/2} width={markerSize} height={markerSize} fill={COLOR_2} stroke="white" strokeWidth="0.6" />
              <text x={p.x} y={p.ly2} textAnchor="middle" fill={COLOR_2} fontSize="8.2" fontWeight="800" style={{pointerEvents:'none'}}>{p.val2.toLocaleString('ru-RU')}</text>
              <text x={p.x} y={chartHeight + 11} textAnchor="middle" fill="#9CA3AF" fontSize="6.5" fontWeight="600">{years[i]}</text>
            </React.Fragment>
          ))}

          {renderTrend(config.trendValue || '0,0 %', config.trendDirection || 'none', config.trendType, chartHeight - 16)}
          {renderTrend(config.trendValue2 || '0,0 %', config.trendDirection2 || 'none', config.trendType2, chartHeight)}
        </g>
      </svg>
    </div>
  );
};

export default DualLineChart;
