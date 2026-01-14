
import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { Block } from '../types';
import { CHART_COLORS, YELLOW_LINE_INDEX, ORANGE_MARKER, YELLOW_MARKER, CHART_ICONS } from '../constants';

interface LineChartProps {
  block: Block;
  width: number;
  height: number;
}

const LineChart: React.FC<LineChartProps> = ({ block, width, height }) => {
  // Уменьшаем отступы для заполнения высоты
  const margin = { top: 10, right: 35, bottom: 15, left: 15 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const data = block.data;
  const years = data.map(d => d.year);
  
  const xScale = useMemo(() => 
    d3.scalePoint<number>()
      .domain(years)
      .range([0, innerWidth])
      .padding(0.1),
    [years, innerWidth]
  );

  const yScales = useMemo(() => {
    return [0, 1, 2, 3].map(lineIdx => {
      const lineValues = data.map(d => d.values[lineIdx] || 0);
      const minV = Math.min(...lineValues);
      const maxV = Math.max(...lineValues);
      const diff = maxV - minV || (maxV * 0.1) || 5;
      
      // Расширяем разлет центров и диапазон (span) для заполнения высоты
      const centers = [innerHeight * 0.25, innerHeight * 0.75, innerHeight * 0.5, innerHeight * 0.1];
      const span = innerHeight * 0.28; 
      const center = centers[lineIdx];

      return d3.scaleLinear()
        .domain([minV - diff * 0.1, maxV + diff * 0.1])
        .range([center + span, center - span]);
    });
  }, [data, innerHeight]);

  const markerSize = 4.2;

  const points = useMemo(() => {
    const rawLines = [0, 1, 2, 3].map(lineIdx => {
      const scale = yScales[lineIdx];
      
      const statuses = data.map((d, i) => {
        const val = d.values[lineIdx] || 0;
        if (lineIdx !== YELLOW_LINE_INDEX) return { isPeak: false, val };
        
        const hasPrev = i > 0;
        const hasNext = i < data.length - 1;
        const prevVal = hasPrev ? (data[i-1].values[lineIdx] || 0) : -Infinity;
        const nextVal = hasNext ? (data[i+1].values[lineIdx] || 0) : -Infinity;
        
        const isPeak = (hasPrev || hasNext) && val > prevVal && val > nextVal;
        
        return { isPeak, val };
      });

      return data.map((d, i) => {
        const s = statuses[i];
        let color = CHART_COLORS[lineIdx];
        if (lineIdx === YELLOW_LINE_INDEX) {
          color = s.isPeak ? ORANGE_MARKER : YELLOW_MARKER;
        }
        
        return {
          lineIdx,
          x: xScale(d.year) || 0,
          y: Math.min(innerHeight - 4, Math.max(4, scale(s.val))),
          val: s.val,
          color,
          isPeak: s.isPeak,
          labelDx: 0,
          labelDy: -4.2,
          textAnchor: 'middle' as const
        };
      });
    });

    // 1. Разведение маркеров
    const minMarkerGap = markerSize * 0.5;
    for (let i = 0; i < data.length; i++) {
      const col = [0, 1, 2, 3].map(li => rawLines[li][i]).sort((a, b) => a.y - b.y);
      for (let iter = 0; iter < 12; iter++) {
        for (let j = 1; j < col.length; j++) {
          if (col[j].y - col[j-1].y < minMarkerGap) {
            const push = (minMarkerGap - (col[j].y - col[j-1].y)) / 2;
            if (col[j-1].y - push > 2) col[j-1].y -= push;
            if (col[j].y + push < innerHeight - 2) col[j].y += push;
          }
        }
      }
    }

    // 2. Умное распределение подписей
    const labelH = 5.5; 
    const vSpace = 1.2; 

    for (let i = 0; i < data.length; i++) {
      const col = [0, 1, 2, 3].map(li => rawLines[li][i]).sort((a, b) => a.y - b.y);
      
      const occupiedY: { min: number, max: number }[] = col.map(p => ({
        min: p.y - markerSize/2 - 0.5, 
        max: p.y + markerSize/2 + 0.5
      }));

      col.forEach((p, idx) => {
        const options = [
          { dy: -4.2, anchor: 'middle' as const, dx: 0, type: 'top' },
          { dy: 8.2, anchor: 'middle' as const, dx: 0, type: 'bottom' },
          { dy: 1.8, anchor: (i === 0 ? 'start' : i === data.length - 1 ? 'end' : (idx % 2 === 0 ? 'start' : 'end')) as any, dx: (i === 0 ? 6.2 : i === data.length - 1 ? -6.2 : (idx % 2 === 0 ? 6.2 : -6.2)), type: 'side' }
        ];

        let found = false;
        for (const opt of options) {
          let yMin, yMax;
          if (opt.type === 'side') {
            yMin = p.y - 2.5;
            yMax = p.y + 2.5;
          } else if (opt.type === 'top') {
            yMin = p.y + opt.dy - labelH;
            yMax = p.y + opt.dy + 0.5;
          } else {
            yMin = p.y + opt.dy - 0.5;
            yMax = p.y + opt.dy + labelH;
          }

          const hasCollision = occupiedY.some(occ => yMin < occ.max && yMax > occ.min) || 
                               yMin < -margin.top + 3 || 
                               yMax > innerHeight + 5;

          if (!hasCollision) {
            p.labelDy = opt.dy;
            p.labelDx = opt.dx;
            p.textAnchor = opt.anchor;
            occupiedY.push({ min: yMin - vSpace, max: yMax + vSpace });
            found = true;
            break;
          }
        }

        if (!found) {
          p.labelDy = 1.8;
          p.labelDx = (i === 0 ? 7 : -7);
          p.textAnchor = (i === 0 ? 'start' : 'end');
        }
      });
    }

    return rawLines;
  }, [data, xScale, yScales, innerHeight, markerSize, margin.top]);

  const columnTops = useMemo(() => {
    return data.map((_, i) => {
      let minY = Infinity;
      let x = 0;
      for (let lineIdx = 0; lineIdx < 4; lineIdx++) {
        const p = points[lineIdx][i];
        if (p.y < minY) {
          minY = p.y;
          x = p.x;
        }
      }
      return { x, y: minY };
    });
  }, [data, points]);

  const gradients = useMemo(() => {
    const line2 = points[YELLOW_LINE_INDEX];
    const grads: React.ReactNode[] = [];
    line2.forEach((p, i) => {
      if (i === 0) return;
      const prev = line2[i - 1];
      
      if (p.isPeak) {
        grads.push(
          <linearGradient key={`up-${i}`} id={`up-${i}`} gradientUnits="userSpaceOnUse" x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}>
            <stop offset="0%" stopColor={YELLOW_MARKER} />
            <stop offset="100%" stopColor={ORANGE_MARKER} />
          </linearGradient>
        );
      } 
      else if (prev.isPeak) {
        grads.push(
          <linearGradient key={`down-${i}`} id={`down-${i}`} gradientUnits="userSpaceOnUse" x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}>
            <stop offset="0%" stopColor={ORANGE_MARKER} />
            <stop offset="100%" stopColor={YELLOW_MARKER} />
          </linearGradient>
        );
      }
    });
    return grads;
  }, [points]);

  return (
    <div className="w-full h-full bg-white select-none overflow-hidden" style={{ fontFamily: 'Montserrat' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>{gradients}</defs>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <line x1={-5} y1={innerHeight} x2={innerWidth + 10} y2={innerHeight} stroke="#D1D5DB" strokeWidth="0.5" />
          
          {columnTops.map((top, i) => (
            <line 
              key={`guide-${i}`} 
              x1={top.x} 
              y1={innerHeight} 
              x2={top.x} 
              y2={top.y} 
              stroke="#D1D5DB" 
              strokeWidth="0.5" 
              strokeDasharray="1, 2" 
            />
          ))}

          {[0, 1, 2, 3].map(lineIdx => (
            <g key={`l-${lineIdx}`}>
              {points[lineIdx].map((p, i) => {
                if (i === 0) return null;
                const prev = points[lineIdx][i-1];
                let stroke = CHART_COLORS[lineIdx];
                if (lineIdx === YELLOW_LINE_INDEX) {
                  if (p.isPeak) stroke = `url(#up-${i})`;
                  else if (prev.isPeak) stroke = `url(#down-${i})`;
                  else stroke = YELLOW_MARKER;
                }
                return <line key={i} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />;
              })}
            </g>
          ))}

          {[0, 1, 2, 3].map(lineIdx => (
            <g key={`m-${lineIdx}`}>
              {points[lineIdx].map((p, i) => (
                <rect key={i} x={p.x - markerSize/2} y={p.y - markerSize/2} width={markerSize} height={markerSize} fill={p.color} stroke="white" strokeWidth="0.6" />
              ))}
            </g>
          ))}

          {[0, 1, 2, 3].map(lineIdx => (
            <g key={`v-${lineIdx}`}>
              {points[lineIdx].map((p, i) => (
                <text 
                  key={i}
                  x={p.x + (p.labelDx || 0)} 
                  y={p.y} 
                  dy={p.labelDy} 
                  textAnchor={p.textAnchor} 
                  fill={p.color} 
                  fontSize="4.9" 
                  fontWeight="700"
                  style={{ pointerEvents: 'none' }}
                >
                  {p.val.toLocaleString('ru-RU')}
                </text>
              ))}
            </g>
          ))}

          {[0, 1, 2, 3].map(li => {
            const lp = points[li][data.length - 1];
            return (
              <g key={li} transform={`translate(${lp.x + 11}, ${lp.y - 3.5}) scale(0.35)`} fill="none" stroke={CHART_COLORS[li]} strokeWidth="2.5">
                {CHART_ICONS[block.config?.lineIcons?.[li] ?? li]}
              </g>
            );
          })}

          {data.map((d, i) => (
            <text key={i} x={xScale(d.year)} y={innerHeight + 9} textAnchor="middle" fill="#9CA3AF" fontSize="5.5" fontWeight="400">{d.year}</text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default LineChart;
