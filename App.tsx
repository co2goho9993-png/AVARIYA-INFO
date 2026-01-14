
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DocumentState, BlockType, Block, Page, TrendRow } from './types';
import { 
  PAGE_WIDTH, 
  PAGE_HEIGHT, 
  COLUMNS, 
  COLUMN_WIDTH_PX, 
  GUTTER_PX, 
  MARGIN_PX, 
  VERTICAL_GRID_STEP, 
  ICONS 
} from './constants';
import SidebarRight from './components/SidebarRight';
import LayoutBlock from './components/LayoutBlock';
import { exportToSVG, exportToPDF } from './services/exportService';

const INITIAL_DATA = [
  { year: 2017, values: [379.6, 73.3, 64, 14174] },
  { year: 2018, values: [375.6, 82.2, 89, 14437] },
  { year: 2019, values: [379.9, 83.4, 58, 14413] },
  { year: 2020, values: [384.3, 82.4, 74, 13741] },
  { year: 2021, values: [386.4, 90.5, 65, 14550] },
  { year: 2022, values: [386.4, 84.1, 58, 14898] },
  { year: 2023, values: [386.4, 62.9, 41, 15674] },
];

const DUAL_CHART_INITIAL = [
  { year: 2017, values: [48, 34] },
  { year: 2018, values: [62, 44] },
  { year: 2019, values: [40, 28] },
  { year: 2020, values: [44, 29] },
  { year: 2021, values: [38, 25] },
  { year: 2022, values: [36, 24] },
  { year: 2023, values: [27, 18] },
];

const COLUMN_INITIAL_DATA = [
  { year: 2017, values: [336] },
  { year: 2018, values: [322] },
  { year: 2019, values: [277] },
  { year: 2020, values: [382] },
  { year: 2021, values: [421] },
  { year: 2022, values: [380] },
  { year: 2023, values: [404] },
];

const TREND_TABLE_INITIAL_ROWS: TrendRow[] = [
  { id: 'r1', label: 'КАБАРДИНО-БАЛКАРСКАЯ РЕСПУБЛИКА', values: [17, 24, 15, 19, 17, 15, 11], trendValue: '37,1 %', trendDirection: 'down', trendStartYear: 2017, trendEndYear: 2023 },
  { id: 'r2', label: 'КАРАЧАЕВО-ЧЕРКЕССКАЯ РЕСПУБЛИКА', values: [13, 13, 12, 7, 6, 15, 10], trendValue: '21,5 %', trendDirection: 'down', trendStartYear: 2017, trendEndYear: 2023 },
  { id: 'r3', label: 'РЕСПУБЛИКА ДАГЕСТАН*', values: [null, null, null, 18, 25, 19, 24], trendValue: '29,5 %', trendDirection: 'up', trendStartYear: 2019, trendEndYear: 2023 },
  { id: 'r4', label: 'РЕСПУБЛИКА ИНГУШЕТИЯ', values: [65, 33, 38, 49, 31, 31, 40], trendValue: '39 %', trendDirection: 'down', trendStartYear: 2017, trendEndYear: 2023 },
];

const App: React.FC = () => {
  const [document, setDocument] = useState<DocumentState>({
    pages: [
      { id: 'p1', blocks: [] },
      { id: 'p2', blocks: [] }
    ]
  });
  const [selectedBlock, setSelectedBlock] = useState<{ pageId: string, blockId: string } | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 0.6 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const mainRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fitToScreen = useCallback(() => {
    if (mainRef.current) {
      const rect = mainRef.current.getBoundingClientRect();
      const spreadWidth = PAGE_WIDTH * 2 + 100; // Добавляем зазор
      const spreadHeight = PAGE_HEIGHT + 100;
      const scaleX = rect.width / spreadWidth;
      const scaleY = rect.height / spreadHeight;
      const newScale = Math.min(scaleX, scaleY, 1.2);
      const newX = (rect.width - PAGE_WIDTH * 2 * newScale) / 2;
      const newY = (rect.height - PAGE_HEIGHT * newScale) / 2;
      setViewport({ x: newX, y: newY, scale: newScale });
    }
  }, []);

  useEffect(() => {
    fitToScreen();
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [fitToScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('aside') || target.closest('.no-export')) return;

    e.preventDefault();
    const delta = -e.deltaY;
    const factor = Math.pow(1.1, delta / 150);
    const newScale = Math.max(0.05, Math.min(5, viewport.scale * factor));
    const rect = mainRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const newX = mouseX - (mouseX - viewport.x) * (newScale / viewport.scale);
    const newY = mouseY - (mouseY - viewport.y) * (newScale / viewport.scale);
    setViewport({ x: newX, y: newY, scale: newScale });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed) {
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isPanning.current = false;
  };

  const checkOverlap = (b1: Partial<Block>, b2: Block) => {
    const horizontalOverlap = (b1.x ?? 0) < b2.x + b2.w && (b1.x ?? 0) + (b1.w ?? 0) > b2.x;
    const verticalOverlap = (b1.y ?? 0) < b2.y + b2.h && (b1.y ?? 0) + (b1.h ?? 0) > b2.y;
    return horizontalOverlap && verticalOverlap;
  };

  const findEmptySpace = (page: Page, w: number, h: number): { x: number, y: number } | null => {
    const startY = Math.ceil(MARGIN_PX / VERTICAL_GRID_STEP) * VERTICAL_GRID_STEP;
    for (let y = startY; y < PAGE_HEIGHT - h - MARGIN_PX; y += VERTICAL_GRID_STEP) {
      for (let x = 0; x <= COLUMNS - w; x++) {
        const tempBlock = { x, y, w, h };
        const hasCollision = page.blocks.some(b => checkOverlap(tempBlock, b));
        if (!hasCollision) return { x, y };
      }
    }
    return null;
  };

  const addBlock = (type: BlockType) => {
    const targetPageId = selectedBlock?.pageId || document.pages[0]?.id;
    const page = document.pages.find(p => p.id === targetPageId);
    if (!page) return;

    let w = 4;
    let h = 8 * VERTICAL_GRID_STEP; 
    let title = "Заголовок";
    let data = JSON.parse(JSON.stringify(INITIAL_DATA));
    let config: any = undefined;

    if (type === BlockType.ROAD_INFO) {
      w = 4; h = 4 * VERTICAL_GRID_STEP;
      title = "КАБАРДИНО-БАЛКАРСКАЯ РЕСПУБЛИКА";
      config = {
        roadName: "P-217",
        description: "км 382+184 — км 400+630, км 405+491 — км 497+547 — обход Нальчика; км 0+000 — км 27+214 — обход Пятигорска; км 18+450 — км 33+240"
      };
    } else if (type === BlockType.ROAD_STATS) {
      w = 4; h = 4 * VERTICAL_GRID_STEP;
      title = "";
      config = {
        statsData: {
          year1: 2017,
          year2: 2023,
          km1: 141.6,
          km2: 151.3,
          kmTrend: '+ 6,9 %',
          traffic1: 23141,
          traffic2: 22320,
          trafficTrend: '- 3,5 %'
        }
      };
    } else if (type === BlockType.CHART_LINE_DUAL_COMPACT) {
      w = 4; h = 8 * VERTICAL_GRID_STEP;
      title = "Динамика показателей";
      data = JSON.parse(JSON.stringify(DUAL_CHART_INITIAL));
      config = { 
        trendValue: '43,8 %', trendDirection: 'down',
        trendValue2: '47,4 %', trendDirection2: 'down'
      };
    } else if (type === BlockType.CHART_LINE_SQUARE) {
      title = "Динамика количества ДТП";
      config = { lineIcons: [0, 1, 2, 3] };
    } else if (type === BlockType.CHART_COLUMN) {
      title = "КОЛИЧЕСТВО ПОГИБШИХ, ЧЕЛ.";
      w = 4;
      h = 22 * VERTICAL_GRID_STEP;
      data = JSON.parse(JSON.stringify(COLUMN_INITIAL_DATA));
      config = {
        trendValue: '20,2 %',
        trendDirection: 'up' as const,
        startYear: 2017,
        endYear: 2023,
        iconType: 'heart' as const
      };
    } else if (type === BlockType.TABLE_TREND) {
      title = "КОЛИЧЕСТВО ПОГИБШИХ НА 100 КМ АВТОМОБИЛЬНЫХ ДОРОГ ПО СУБЪЕКТАМ, ЧЕЛ.";
      w = 6;
      h = 32 * VERTICAL_GRID_STEP;
      data = [];
      config = {
        iconType: 'location' as const,
        years: [2017, 2018, 2019, 2020, 2021, 2022, 2023],
        rows: JSON.parse(JSON.stringify(TREND_TABLE_INITIAL_ROWS))
      };
    } else if (type === BlockType.HEADER) {
      title = "НОВЫЙ ЗАГОЛОВОК";
      h = 2 * VERTICAL_GRID_STEP; 
      config = { iconType: 'heart' };
    }

    const pos = findEmptySpace(page, w, h);
    if (!pos) {
      alert("На странице нет свободного места для нового блока");
      return;
    }

    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type, title, x: pos.x, y: pos.y, w, h, data, config
    };

    setDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === page.id ? { ...p, blocks: [...p.blocks, newBlock] } : p)
    }));
    setSelectedBlock({ pageId: page.id, blockId: newBlock.id });
  };

  const handleDuplicateBlock = useCallback((pageId: string, blockId: string) => {
    setDocument(prev => {
      const page = prev.pages.find(p => p.id === pageId);
      if (!page) return prev;
      const original = page.blocks.find(b => b.id === blockId);
      if (!original) return prev;

      const pos = findEmptySpace(page, original.w, original.h);
      if (!pos) {
        alert("Нет места для дубликата");
        return prev;
      }

      const duplicate: Block = {
        ...JSON.parse(JSON.stringify(original)),
        id: Math.random().toString(36).substr(2, 9),
        x: pos.x,
        y: pos.y
      };

      return {
        ...prev,
        pages: prev.pages.map(p => p.id === pageId ? { ...p, blocks: [...p.blocks, duplicate] } : p)
      };
    });
  }, []);

  const handleBlockUpdate = useCallback((pageId: string, blockId: string, updates: Partial<Block>) => {
    setDocument(prev => {
      const page = prev.pages.find(p => p.id === pageId);
      if (!page) return prev;
      const currentBlock = page.blocks.find(b => b.id === blockId);
      if (!currentBlock) return prev;
      const potentialBlock = { ...currentBlock, ...updates };
      const hasCollision = page.blocks.some(b => b.id !== blockId && checkOverlap(potentialBlock, b));
      if (hasCollision) return prev;
      return {
        ...prev,
        pages: prev.pages.map(p => 
          p.id === pageId 
            ? { ...p, blocks: p.blocks.map(b => b.id === blockId ? potentialBlock : b) }
            : p
        )
      };
    });
  }, []);

  const handleBlockDelete = useCallback((pageId: string, blockId: string) => {
    setDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.id === pageId 
          ? { ...p, blocks: p.blocks.filter(b => b.id !== blockId) }
          : p
      )
    }));
    setSelectedBlock(null);
  }, []);

  const handleExportSVG = () => {
    const activePageId = selectedBlock?.pageId || document.pages[0]?.id;
    if (activePageId) {
      exportToSVG(document, activePageId);
    }
  };

  const handleExportPDF = () => {
    exportToPDF(document);
  };

  const handleSaveProject = () => {
    const data = JSON.stringify(document, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `project-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedDocument = JSON.parse(event.target?.result as string);
        setDocument(loadedDocument);
        fitToScreen();
      } catch (err) {
        alert("Ошибка при загрузке файла проекта");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const spreads = [];
  for (let i = 0; i < document.pages.length; i += 2) {
    spreads.push(document.pages.slice(i, i + 2));
  }

  return (
    <div 
      className={`flex h-screen bg-[#F1F5F9] text-gray-800 overflow-hidden ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <aside className="w-16 bg-[#0F172A] flex flex-col items-center py-6 gap-6 shadow-2xl z-30 border-r border-white/5 no-print">
        <div className="mb-2 text-blue-500">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
        </div>
        
        <div className="flex flex-col gap-2 items-center bg-white/5 p-1.5 rounded-xl border border-white/5">
          <button onClick={() => addBlock(BlockType.ROAD_INFO)} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Инфо-заголовок дороги">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h5"/></svg>
          </button>
          <button onClick={() => addBlock(BlockType.CHART_LINE_DUAL_COMPACT)} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Мини-график (2 линии)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 16 4-4 4 4 4-4 6 6"/><path d="m3 10 4-4 4 4 4-4 6 6" opacity="0.5"/></svg>
          </button>
          <button onClick={() => addBlock(BlockType.ROAD_STATS)} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Инфо-прогресс">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m12 2 4 5-4 5-4-5Z"/><path d="M8 21v-7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v7"/></svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 items-center bg-white/5 p-1.5 rounded-xl border border-white/5">
          <button onClick={() => addBlock(BlockType.HEADER)} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Простой заголовок">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
          <button onClick={() => addBlock(BlockType.CHART_LINE_SQUARE)} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="4 линии">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 18 4-4 4 4 4-4 5 5"/><path d="m3 12 4-4 4 4 4-4 5 5" opacity="0.7"/><path d="m3 6 4-4 4 4 4-4 5 5" opacity="0.4"/></svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 items-center bg-white/5 p-1.5 rounded-xl border border-white/5">
          <button onClick={() => addBlock(BlockType.CHART_COLUMN)} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Столбчатая диаграмма">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          </button>
          <button onClick={() => addBlock(BlockType.TABLE_TREND)} className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Таблица трендов">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button onClick={() => setShowGrid(!showGrid)} className={`p-2.5 rounded-lg transition-all ${showGrid ? 'bg-blue-600 text-white' : 'text-white/40'}`}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
          </button>

          <input type="file" ref={fileInputRef} onChange={handleLoadProject} className="hidden" accept=".json" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Загрузить проект">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          </button>
          
          <button onClick={handleSaveProject} className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Сохранить проект">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </button>
          
          <button onClick={handleExportSVG} className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex flex-col items-center gap-0.5 shadow-lg" title="Экспорт страницы в SVG">
            <ICONS.Download className="w-4 h-4" />
            <span className="text-[6px] font-bold">SVG</span>
          </button>

          <button onClick={handleExportPDF} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex flex-col items-center gap-0.5 shadow-lg" title="Экспорт всего документа в PDF">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            <span className="text-[6px] font-bold">PDF</span>
          </button>
        </div>
      </aside>

      <main 
        ref={mainRef} 
        className="flex-1 relative overflow-hidden bg-[#CBD5E1]" 
        onClick={() => setSelectedBlock(null)}
      >
        <div 
          className="flex flex-col gap-32 transition-transform duration-75 ease-out origin-top-left"
          style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}
        >
          {spreads.map((spread, sIdx) => (
            <div key={`spread-${sIdx}`} className="flex shadow-[0_0_50px_rgba(0,0,0,0.1)] w-fit mx-auto">
              {spread.map((page, pIdx) => (
                <div 
                  key={page.id} 
                  className="a4-page relative flex-shrink-0 border-r border-gray-100 last:border-r-0" 
                  style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, pointerEvents: isSpacePressed ? 'none' : 'auto' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedBlock(null); }}
                >
                  {showGrid && (
                    <div className="absolute inset-0 pointer-events-none select-none no-print">
                      <div className="absolute inset-y-0 flex justify-between" style={{ left: MARGIN_PX, right: MARGIN_PX }}>
                        {Array.from({ length: COLUMNS }).map((_, i) => (
                          <div 
                            key={i} 
                            className="h-full bg-blue-500 opacity-[0.05]" 
                            style={{ width: COLUMN_WIDTH_PX }} 
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col">
                        {Array.from({ length: Math.ceil(PAGE_HEIGHT / VERTICAL_GRID_STEP) }).map((_, i) => (
                          <div key={i} className={`w-full border-b border-blue-900 ${i % 10 === 0 ? 'opacity-[0.1]' : 'opacity-[0.03]'}`} style={{ height: VERTICAL_GRID_STEP }} />
                        ))}
                      </div>
                      <div 
                        className="absolute border-[0.5px] border-dashed border-pink-500 opacity-30 pointer-events-none"
                        style={{ top: MARGIN_PX, left: MARGIN_PX, right: MARGIN_PX, bottom: MARGIN_PX }}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 z-10">
                     <div className="relative w-full h-full" id={`page-svg-container-${page.id}`}>
                        {page.blocks.map(block => (
                          <LayoutBlock 
                            key={block.id}
                            block={block}
                            isSelected={selectedBlock?.blockId === block.id}
                            onSelect={() => setSelectedBlock({ pageId: page.id, blockId: block.id })}
                            onUpdate={(updates) => handleBlockUpdate(page.id, block.id, updates)}
                            onDelete={() => handleBlockDelete(page.id, block.id)}
                            onDuplicate={() => handleDuplicateBlock(page.id, block.id)}
                          />
                        ))}
                     </div>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[14px] font-black text-gray-300 tracking-[0.2em] no-print">
                    {sIdx * 2 + pIdx + 1}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-24 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl text-[11px] font-black text-slate-600 flex gap-6 pointer-events-none border border-white/20 no-print">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> ZOOM: {Math.round(viewport.scale * 100)}%</span>
          <span className="text-slate-400 font-bold uppercase tracking-widest">SPACE + DRAG: ПАНОРАМА</span>
        </div>
      </main>

      <SidebarRight 
        document={document} 
        selectedBlock={selectedBlock} 
        setDocument={setDocument}
        onSelectBlock={setSelectedBlock}
      />
    </div>
  );
};

export default App;
