
import React, { useState, useRef } from 'react';
import { Block, BlockType } from '../types';
import { 
  COLUMN_WIDTH_PX, 
  GUTTER_PX, 
  MARGIN_PX, 
  VERTICAL_GRID_STEP, 
  PAGE_HEIGHT,
  ICONS
} from '../constants';
import LineChart from './LineChart';
import SimpleTable from './SimpleTable';
import HeaderBlock from './HeaderBlock';
import ColumnChart from './ColumnChart';
import TrendTable from './TrendTable';
import RoadInfoBlock from './RoadInfoBlock';
import DualLineChart from './DualLineChart';
import RoadStatsBlock from './RoadStatsBlock';

interface LayoutBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const LayoutBlock: React.FC<LayoutBlockProps> = ({ block, isSelected, onSelect, onUpdate, onDelete, onDuplicate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0, blockX: 0, blockY: 0, blockW: 0, blockH: 0 });

  const getX = (col: number) => MARGIN_PX + col * (COLUMN_WIDTH_PX + GUTTER_PX);
  const getWidth = (w: number) => w * COLUMN_WIDTH_PX + (w - 1) * GUTTER_PX;

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize') => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('img') || target.closest('textarea')) {
      if (type === 'move') {
        onSelect();
        return;
      }
    }

    e.stopPropagation();
    onSelect();
    
    if (type === 'move') setIsDragging(true);
    else setIsResizing(true);

    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      blockX: block.x,
      blockY: block.y,
      blockW: block.w, blockH: block.h
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const scaleStr = document.querySelector('.origin-top-left')?.getAttribute('style')?.match(/scale\(([^)]+)\)/)?.[1] || '1';
      const scale = parseFloat(scaleStr);
      const dx = (moveEvent.clientX - startPos.current.x) / scale;
      const dy = (moveEvent.clientY - startPos.current.y) / scale;

      if (type === 'move') {
        const unitX = (COLUMN_WIDTH_PX + GUTTER_PX);
        const newCol = Math.round((startPos.current.blockX * unitX + dx) / unitX);
        const newY = Math.round((startPos.current.blockY + dy) / VERTICAL_GRID_STEP) * VERTICAL_GRID_STEP;
        
        const boundedCol = Math.max(0, Math.min(12 - block.w, newCol));
        const boundedY = Math.max(0, Math.min(PAGE_HEIGHT - block.h, newY));

        onUpdate({ x: boundedCol, y: boundedY });
      } else {
        const unitX = (COLUMN_WIDTH_PX + GUTTER_PX);
        const minCols = block.type === BlockType.TABLE_TREND ? 4 : 1;
        const newW = Math.max(minCols, Math.round((startPos.current.blockW * unitX + dx) / unitX));
        const newH = Math.max(VERTICAL_GRID_STEP, Math.round((startPos.current.blockH + dy) / VERTICAL_GRID_STEP) * VERTICAL_GRID_STEP);
        
        const boundedW = Math.min(12 - block.x, newW);
        const boundedH = Math.min(PAGE_HEIGHT - block.y, newH);

        onUpdate({ w: boundedW, h: boundedH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const currentWidth = getWidth(block.w);

  return (
    <div
      className={`absolute flex flex-col block-container group ${
        isSelected ? 'z-50 shadow-lg' : 'z-10'
      }`}
      data-block-id={block.id}
      style={{
        left: getX(block.x),
        top: block.y,
        width: currentWidth,
        height: block.h,
        backgroundColor: 'white',
        cursor: isDragging ? 'grabbing' : 'grab',
        border: 'none',
        borderRadius: '0',
        transition: 'none'
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <div className="flex-1 relative overflow-hidden pointer-events-auto">
        {block.type === BlockType.CHART_LINE_SQUARE ? (
          <LineChart block={block} width={currentWidth} height={block.h} />
        ) : block.type === BlockType.CHART_LINE_DUAL_COMPACT ? (
          <DualLineChart block={block} width={currentWidth} height={block.h} />
        ) : block.type === BlockType.CHART_COLUMN ? (
          <ColumnChart block={block} width={currentWidth} height={block.h} />
        ) : block.type === BlockType.TABLE_TREND ? (
          <TrendTable block={block} width={currentWidth} height={block.h} onUpdate={onUpdate} />
        ) : block.type === BlockType.TABLE_SIMPLE ? (
          <SimpleTable block={block} width={currentWidth} height={block.h} />
        ) : block.type === BlockType.ROAD_INFO ? (
          <RoadInfoBlock block={block} />
        ) : block.type === BlockType.ROAD_STATS ? (
          <RoadStatsBlock block={block} onUpdate={onUpdate} />
        ) : (
          <HeaderBlock block={block} />
        )}
      </div>

      {isSelected && (
        <div className="absolute inset-0 border-[1.5px] border-[#4285F4] pointer-events-none no-export z-[60]" />
      )}

      <div
        className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-end justify-end p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-[70] no-export"
        onMouseDown={(e) => handleMouseDown(e, 'resize')}
      >
        <div className="w-2.5 h-2.5 border-r-[2.5px] border-b-[2.5px] border-blue-500 rounded-br-sm" />
      </div>

      {isSelected && (
        <div className="absolute -top-7 right-0 flex gap-1 z-[80] no-export">
          <button 
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-colors pointer-events-auto shadow-lg"
            title="Дублировать"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/><rect x="8" y="8" width="14" height="14" rx="2" ry="2"/></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors pointer-events-auto shadow-lg"
            title="Удалить"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default LayoutBlock;
