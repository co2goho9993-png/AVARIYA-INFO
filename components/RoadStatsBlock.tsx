
import React, { useRef } from 'react';
import { Block } from '../types';
import { fixTypography } from '../constants';

interface RoadStatsBlockProps {
  block: Block;
  onUpdate?: (updates: Partial<Block>) => void;
}

const RoadStatsBlock: React.FC<RoadStatsBlockProps> = ({ block, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = block.config?.statsData || {
    year1: 2017,
    year2: 2023,
    km1: 141.6,
    km2: 151.3,
    kmTrend: '+ 6,9 %',
    traffic1: 23141,
    traffic2: 22320,
    trafficTrend: '- 3,5 %',
    trafficLogoUrl: ''
  };

  const maxKm = Math.max(stats.km1, stats.km2, 1);
  const kmWidth1 = (stats.km1 / maxKm) * 100;
  const kmWidth2 = (stats.km2 / maxKm) * 100;

  const isZero = (val: string) => !val || val === '0' || val === '0 %' || val === '0,0 %' || val === '0%';

  const showKmTrend = !isZero(stats.kmTrend);
  const showTrafficTrend = !isZero(stats.trafficTrend);

  const handlePlusClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdate) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdate({ 
          config: { 
            ...block.config, 
            statsData: { ...stats, trafficLogoUrl: base64 } 
          } 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const TrafficIcon = () => (
    <div className="relative w-[11px] h-[11px] flex items-center justify-center">
      {stats.trafficLogoUrl ? (
        <img 
          src={stats.trafficLogoUrl} 
          alt="icon" 
          className="w-full h-full object-contain pointer-events-auto cursor-pointer" 
          onClick={handlePlusClick}
        />
      ) : (
        <button 
          type="button"
          onClick={handlePlusClick}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full h-full bg-[#29ABE2] rounded-full flex items-center justify-center pointer-events-auto cursor-pointer no-export hover:brightness-110 transition-all shadow-sm outline-none border-none"
        >
          <svg viewBox="0 0 24 24" className="w-[7px] h-[7px] text-white pointer-events-none" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {!stats.trafficLogoUrl && (
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full opacity-0 pointer-events-none block-svg-export">
          <circle cx="12" cy="12" r="11" fill="#29ABE2" />
          <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );

  return (
    <div className="w-full h-full bg-white flex flex-col select-none relative pt-1 px-1 pb-1" style={{ fontFamily: 'Montserrat' }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/svg+xml,image/png,image/jpeg,.ai" 
        onChange={handleFileChange} 
      />
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-[1fr_auto] gap-x-0.5 items-center">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-0.5 h-[13px]">
              <span className="text-[7px] font-bold text-[#8E8E8E] w-5 flex-shrink-0 text-left leading-none">
                {stats.year1}
              </span>
              <div className="flex-1 h-[10.5px]">
                <div 
                  className="h-full flex items-center px-1.5 gap-1"
                  style={{ 
                    backgroundImage: 'linear-gradient(90deg, #8E8E8E 0%, #BFC3C8 100%)',
                    width: `${kmWidth1}%`,
                    minWidth: '45px',
                    borderRadius: '5.25px' 
                  }}
                >
                  <div className="flex items-baseline gap-0.5 whitespace-nowrap flex-shrink-0">
                    <span className="text-[6.8px] font-bold text-white leading-none">{stats.km1.toLocaleString('ru-RU')}</span>
                    <span className="text-[4.5px] font-bold text-white/90 leading-none">км</span>
                  </div>
                  <div className="flex-1 border-b-[0.8px] border-dashed border-white/40 h-0 mb-[0.2px]" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 h-[13px]">
              <span className="text-[7px] font-bold text-[#8E8E8E] w-5 flex-shrink-0 text-left leading-none">
                {stats.year2}
              </span>
              <div className="flex-1 h-[10.5px]">
                <div 
                  className="h-full flex items-center px-1.5 relative gap-1"
                  style={{ 
                    backgroundImage: 'linear-gradient(90deg, #8E8E8E 0%, #BFC3C8 100%)',
                    width: `${kmWidth2}%`,
                    minWidth: '65px',
                    borderRadius: '5.25px' 
                  }}
                >
                  <div className="flex items-baseline gap-0.5 whitespace-nowrap flex-shrink-0">
                    <span className="text-[6.8px] font-bold text-white leading-none">{stats.km2.toLocaleString('ru-RU')}</span>
                    <span className="text-[4.5px] font-bold text-white/90 leading-none">км</span>
                  </div>
                  <div className="flex-1 border-b-[0.8px] border-dashed border-white/40 h-0 mb-[0.2px]" />
                  {showKmTrend && (
                    <span className="text-[6px] font-bold text-[#2E2A6D] flex-shrink-0 leading-none whitespace-nowrap">
                      ({fixTypography(stats.kmTrend)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 pl-1.5">
            <div className="flex items-center gap-1 h-[13px]">
              <div className="flex-shrink-0 flex items-center justify-center">
                <TrafficIcon />
              </div>
              <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                <span className="text-[8px] font-bold text-[#2E2A6D] leading-none">{stats.traffic1.toLocaleString('ru-RU')}</span>
                <span className="text-[4.5px] font-medium text-[#2E2A6D]/70 leading-none">авт./сут</span>
              </div>
            </div>

            <div className="flex items-center gap-1 h-[13px]">
              <div className="flex-shrink-0 flex items-center justify-center">
                <TrafficIcon />
              </div>
              <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                <span className="text-[8px] font-bold text-[#2E2A6D] leading-none">{stats.traffic2.toLocaleString('ru-RU')}</span>
                <span className="text-[4.5px] font-medium text-[#2E2A6D]/70 leading-none">авт./сут</span>
                {showTrafficTrend && (
                  <span className="text-[7.2px] font-bold text-[#2E2A6D] ml-0.5 leading-none">({fixTypography(stats.trafficTrend)})</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadStatsBlock;
