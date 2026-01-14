
import React, { useLayoutEffect, useRef } from 'react';
import { Block, TrendRow } from '../types';
import { ICONS, fixTypography, VERTICAL_GRID_STEP } from '../constants';

interface TrendTableProps {
  block: Block;
  width: number;
  height: number;
  onUpdate?: (updates: Partial<Block>) => void;
}

const TrendTable: React.FC<TrendTableProps> = ({ block, width, height, onUpdate }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeRowIdRef = useRef<string | null>(null);

  const config = block.config || {
    iconType: 'location',
    years: [2017, 2018, 2019, 2020, 2021, 2022, 2023],
    rows: []
  };

  const years = config.years || [];
  const rows = config.rows || [];

  const dashStyle = {
    borderStyle: 'dotted' as const,
    borderWidth: '0.5pt',
    borderColor: '#D1D5DB', 
  };

  useLayoutEffect(() => {
    if (contentRef.current && onUpdate) {
      const contentHeight = contentRef.current.offsetHeight;
      const totalNeededHeight = contentHeight + 16; 
      const snappedHeight = Math.max(80, Math.ceil(totalNeededHeight / VERTICAL_GRID_STEP) * VERTICAL_GRID_STEP);
      
      if (Math.abs(snappedHeight - block.h) >= VERTICAL_GRID_STEP) {
        const timer = setTimeout(() => {
          onUpdate({ h: snappedHeight });
        }, 50); 
        return () => clearTimeout(timer);
      }
    }
  }, [rows.length, block.title, width, onUpdate, years.length, rows]);

  const handleIconClick = (rowId: string) => {
    activeRowIdRef.current = rowId;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const rowId = activeRowIdRef.current;
    
    if (file && rowId && onUpdate) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newRows = rows.map(r => r.id === rowId ? { ...r, logoUrl: base64 } : r);
        onUpdate({ config: { ...config, rows: newRows } });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const getIcon = () => {
    switch (config.iconType) {
      case 'location': return ICONS.Location;
      case 'shield': return ICONS.Shield;
      case 'car': return ICONS.Car;
      case 'drink': return ICONS.Drink;
      default: return ICONS.Heart;
    }
  };
  const Icon = getIcon();

  return (
    <div 
      className="w-full h-full bg-white flex flex-col relative overflow-hidden pt-1.5 px-2 pb-1.5" 
      style={{ 
        fontFamily: 'Montserrat',
        border: '0.5pt solid #5B9BD5',
        borderRadius: '8px'
      }}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/svg+xml,image/png,image/jpeg,.ai" className="hidden" />

      <div ref={contentRef} className="flex flex-col w-full">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2 min-h-[22px]">
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <div className="text-[#5B9BD5] flex-shrink-0 flex items-center justify-center">
               <Icon className="w-[16px] h-[16px]" />
            </div>
            <h2 className="text-[8px] font-bold text-[#2E2A6D] uppercase leading-[1.1] tracking-tight whitespace-pre-line m-0">
              {fixTypography(block.title)}
            </h2>
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full">
          <table className="w-full border-collapse table-auto" style={{ tableLayout: 'auto' }}>
            <thead>
              <tr style={{ borderBottom: `${dashStyle.borderWidth} ${dashStyle.borderStyle} ${dashStyle.borderColor}` }}>
                <th style={{ width: '16px' }} className="pb-1"></th>
                <th className="pb-1 text-left text-[6px] font-black text-gray-400 uppercase pr-1"></th>
                {years.map(y => (
                  <th key={y} className="pb-1 text-center text-[6px] font-bold text-gray-400 uppercase px-0.5" style={{ minWidth: '16px', borderLeft: `${dashStyle.borderWidth} ${dashStyle.borderStyle} ${dashStyle.borderColor}` }}>{y}</th>
                ))}
                <th style={{ minWidth: '36px', borderLeft: `${dashStyle.borderWidth} ${dashStyle.borderStyle} ${dashStyle.borderColor}` }} className="pb-1"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: TrendRow) => {
                const trendType = row.trendType || (row.trendDirection === 'up' ? 'negative' : 'positive');
                const isUp = row.trendDirection === 'up';
                
                let trendColor = '#008B72'; // Green
                if (trendType === 'negative') trendColor = '#D11D1D'; // Red
                if (trendType === 'neutral') trendColor = '#9CA3AF'; // Gray

                return (
                  <tr key={row.id} className="group relative" style={{ borderBottom: `${dashStyle.borderWidth} ${dashStyle.borderStyle} ${dashStyle.borderColor}` }}>
                    {/* Row Icon Column */}
                    <td className="py-1 pr-0.5 align-middle text-center relative">
                      <button 
                        onClick={() => handleIconClick(row.id)} 
                        className={`w-4 h-4 inline-flex items-center justify-center overflow-hidden hover:opacity-70 transition-opacity pointer-events-auto no-export rounded-sm ${row.logoUrl ? 'bg-transparent' : 'bg-gray-100'}`}
                      >
                        {row.logoUrl ? (
                          <img src={row.logoUrl} alt="logo" className="w-full h-full object-contain" />
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-3 h-3 text-gray-300">
                             <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                    </td>

                    {/* Region Label Column */}
                    <td className="py-1 pr-1.5 align-middle">
                      <div className="text-[6.3px] font-[800] text-[#2E2A6D] leading-[1.05] uppercase break-words whitespace-normal min-w-[50px]">
                        {row.label}
                      </div>
                    </td>

                    {/* Value Columns */}
                    {years.map((_, i) => (
                      <td key={i} className="py-1 text-center align-middle px-0.5" style={{ borderLeft: `${dashStyle.borderWidth} ${dashStyle.borderStyle} ${dashStyle.borderColor}` }}>
                        <div className="text-center text-[7.5px] font-[800] text-gray-600 p-0 tabular-nums">
                          {row.values[i] !== null && row.values[i] !== undefined && row.values[i] !== '' ? row.values[i]?.toLocaleString('ru-RU') : ''}
                        </div>
                      </td>
                    ))}

                    {/* Trend Block Column */}
                    <td className="py-1 text-right align-middle px-0.5" style={{ borderLeft: `${dashStyle.borderWidth} ${dashStyle.borderStyle} ${dashStyle.borderColor}` }}>
                      <div 
                        className="inline-flex flex-col items-center justify-center rounded-[2px] ml-auto border px-0.5 py-0.5"
                        style={{ 
                          borderColor: trendColor, 
                          backgroundColor: 'transparent',
                          height: '16px',
                          minWidth: '34px',
                          borderWidth: '0.8px'
                        }}
                      >
                        <div className="flex items-center gap-0.5 leading-none mb-0 whitespace-nowrap">
                          {trendType === 'neutral' ? (
                            <span className="text-[7.2px] font-[700]" style={{ color: trendColor }}>0 %</span>
                          ) : (
                            <>
                              <span className="text-[7.2px] font-[700]" style={{ color: trendColor }}>
                                {row.trendValue}
                              </span>
                              {isUp ? (
                                <svg width="5.5" height="5.5" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                                </svg>
                              ) : (
                                <svg width="5.5" height="5.5" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M7 7L17 17M17 17V7M17 17H7" />
                                </svg>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex justify-between w-full px-[0.5px] gap-1 leading-[1] mt-[0.5px] whitespace-nowrap">
                          <span className="text-[3.8px] font-bold text-gray-400 tabular-nums">{row.trendStartYear || years[0]}</span>
                          <span className="text-[3.8px] font-black text-[#2E2A6D] tabular-nums">{row.trendEndYear || years[years.length-1]}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrendTable;
