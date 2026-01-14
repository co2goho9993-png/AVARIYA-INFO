
import { fixTypography, ICONS, COLUMN_COLORS } from '../constants';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Block } from '../types';

interface ColumnChartProps {
  block: Block;
  width: number;
  height: number;
}

const ColumnChart: React.FC<ColumnChartProps> = ({ block, width, height }) => {
  const data = block.data;
  const config = block.config || {
    trendValue: '20,2 %',
    trendDirection: 'up',
    startYear: 2017,
    endYear: 2023,
    iconType: 'heart'
  };

  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [availableChartHeight, setAvailableChartHeight] = useState(0);

  useEffect(() => {
    if (!chartAreaRef.current) return;

    const updateHeight = () => {
      if (chartAreaRef.current) {
        const fullHeight = chartAreaRef.current.clientHeight;
        const labelHeight = 12; 
        const yearHeight = 14;  
        const spacing = 6;      
        setAvailableChartHeight(Math.max(0, fullHeight - labelHeight - yearHeight - spacing));
      }
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(chartAreaRef.current);
    updateHeight();

    return () => observer.disconnect();
  }, [block.title, height, width, config]); 

  const colorMap = useMemo(() => {
    const sortedValues = [...data]
      .map(d => d.values[0] || 0)
      .sort((a, b) => b - a);
    
    const count = sortedValues.length;
    const highThreshold = sortedValues[Math.min(1, count - 1)];
    const lowThreshold = sortedValues[Math.max(0, count - 2)];

    return (val: number) => {
      if (val >= highThreshold) return COLUMN_COLORS.high;
      if (val <= lowThreshold) return COLUMN_COLORS.low;
      return COLUMN_COLORS.mid;
    };
  }, [data]);

  const maxValInSet = Math.max(...data.map(d => d.values[0] || 0));

  const isUp = config.trendDirection === 'up';
  const isDown = config.trendDirection === 'down';
  const isNone = config.trendDirection === 'none';
  
  const trendColor = isNone ? '#9CA3AF' : (isUp ? '#D11D1D' : '#008B72');

  const paddingSides = 10;
  const paddingTop = 5; 
  const paddingBottom = 10;
  const barWidth = (width - (paddingSides * 2) - 10) / (data.length || 1) - 4;

  const getIcon = () => {
    switch (config.iconType) {
      case 'car': return ICONS.Car;
      case 'drink': return ICONS.Drink;
      case 'shield': return ICONS.Shield;
      case 'location': return ICONS.Location;
      default: return ICONS.Heart;
    }
  };
  const Icon = getIcon();

  const trendBlockHeight = '16px';

  return (
    <div 
      className="w-full h-full bg-white flex flex-col relative overflow-hidden" 
      style={{ 
        fontFamily: 'Montserrat', 
        paddingTop: `${paddingTop}px`,
        paddingLeft: `${paddingSides}px`,
        paddingRight: `${paddingSides}px`,
        paddingBottom: `${paddingBottom}px`,
        border: '0.5pt solid #5B9BD5',
        borderRadius: '8px'
      }}
    >
      <div className="flex justify-between items-start mb-2 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 pr-1 overflow-hidden">
          <div className="text-[#29ABE2] flex-shrink-0 flex items-center justify-center">
             <Icon className="w-[18px] h-[18px]" />
          </div>
          <h2 className="text-[8.5px] font-bold text-[#2E2A6D] uppercase leading-[1.2] tracking-tight whitespace-pre-line m-0">
            {fixTypography(block.title)}
          </h2>
        </div>

        <div 
          className="flex-shrink-0 rounded-[2px] flex flex-col items-center justify-center ml-1 border px-1"
          style={{ 
            borderColor: trendColor, 
            backgroundColor: 'transparent',
            height: trendBlockHeight,
            minWidth: '48px',
            borderWidth: '0.5px'
          }}
        >
          <div className="flex items-center gap-1 leading-none mb-0 justify-center w-full">
            <span className="text-[9px] font-bold whitespace-nowrap" style={{ color: trendColor }}>
              {isNone ? '0 %' : fixTypography(config.trendValue || '')}
            </span>
            {!isNone && (
              <svg width="6.5" height="6.5" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 block-svg-export">
                {isUp ? (
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                ) : (
                  <path d="M7 7L17 17M17 17V7M17 17H7" />
                )}
              </svg>
            )}
          </div>
          
          <div className="flex justify-between w-full px-[1.5px] leading-[1] mt-[0.8px]">
            <span className="text-[4.5px] font-medium text-[#2E2A6D]/60">{config.startYear}</span>
            <span className="text-[4.5px] font-bold text-[#2E2A6D]">{config.endYear}</span>
          </div>
        </div>
      </div>

      <div ref={chartAreaRef} className="flex-1 flex items-end justify-between px-0.5 min-h-0">
        {availableChartHeight > 0 && data.map((d, i) => {
          const val = d.values[0] || 0;
          const barH = Math.max(2, (val / (maxValInSet || 1)) * availableChartHeight);
          const color = colorMap(val);
          
          return (
            <div key={i} className="flex flex-col items-center h-full justify-end">
              <span className="text-[8.5px] font-bold mb-1 leading-none" style={{ color }}>
                {val.toLocaleString('ru-RU')}
              </span>
              <div 
                className="rounded-t-[1px]" 
                style={{ 
                  height: barH, 
                  width: Math.max(4, barWidth), 
                  backgroundColor: color 
                }}
              />
              <span className="text-[8px] font-normal text-[#9ca3af] mt-1.5 whitespace-nowrap leading-none">
                {d.year}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColumnChart;
