
import React from 'react';
import { DocumentState, Block, BlockType, TrendRow } from '../types';
import { ICONS, COLUMN_COLORS, CHART_COLORS } from '../constants';

interface SidebarRightProps {
  document: DocumentState;
  selectedBlock: { pageId: string, blockId: string } | null;
  setDocument: React.Dispatch<React.SetStateAction<DocumentState>>;
  onSelectBlock: (selection: { pageId: string, blockId: string } | null) => void;
}

const Label = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <label className={`block text-[8px] font-black text-white/30 uppercase tracking-wider mb-1 ${className}`}>{children}</label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full bg-white/5 border border-white/10 rounded py-1 px-1.5 text-[10px] font-bold text-white outline-none focus:border-blue-500/50 transition-colors ${props.className || ''}`} />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`w-full bg-white/5 border border-white/10 rounded py-1 px-1.5 text-[10px] font-bold text-white outline-none focus:border-blue-500/50 transition-colors resize-none overflow-hidden ${props.className || ''}`} onInput={(e) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  }} />
);

const IconSelector = ({ selected, onSelect }: { selected: string, onSelect: (type: any) => void }) => {
  const icons = [
    { type: 'heart', Icon: ICONS.Heart },
    { type: 'car', Icon: ICONS.Car },
    { type: 'drink', Icon: ICONS.Drink },
    { type: 'shield', Icon: ICONS.Shield },
    { type: 'location', Icon: ICONS.Location },
    { type: 'traffic', Icon: ICONS.Traffic }
  ];

  return (
    <div className="flex flex-wrap gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
      {icons.map(({ type, Icon }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
            selected === type ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-white/5 text-white/30 hover:bg-white/10'
          }`}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
};

const NumberInput: React.FC<{
  value: number;
  onChange: (val: number) => void;
  className?: string;
  color?: string;
  bgColor?: string;
  onDelete?: () => void;
  label?: string;
}> = ({ value, onChange, className = "", color = "white", bgColor = "", onDelete, label }) => {
  return (
    <div className="flex items-center gap-2 mb-2 group/input">
      {label && <span className="text-[10px] font-black text-white/40 w-12 flex-shrink-0">{label}</span>}
      <div className="flex-1 relative">
        <input 
          type="number" 
          value={value ?? 0} 
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{ 
            color: color || 'white', 
            backgroundColor: bgColor || 'rgba(255,255,255,0.05)' 
          }}
          className={`w-full border border-white/10 rounded py-2 px-3 text-[11px] font-black outline-none focus:ring-1 focus:ring-white/20 transition-all ${className}`}
        />
      </div>
      {onDelete && (
        <button 
          onClick={onDelete}
          className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg w-9 h-9 flex items-center justify-center transition-all opacity-40 group-hover/input:opacity-100"
          title="Удалить"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      )}
    </div>
  );
};

const SidebarRight: React.FC<SidebarRightProps> = ({ document: doc, selectedBlock, setDocument }) => {
  const getActiveBlock = () => {
    if (!selectedBlock) return null;
    const page = doc.pages.find(p => p.id === selectedBlock.pageId);
    return page?.blocks.find(b => b.id === selectedBlock.blockId);
  };

  const handleUpdate = (updates: any) => {
    if (!selectedBlock) return;
    setDocument(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.id === selectedBlock.pageId 
          ? { ...p, blocks: p.blocks.map(b => b.id === selectedBlock.blockId ? { ...b, ...updates } : b) }
          : p
      )
    }));
  };

  const activeBlock = getActiveBlock();

  const renderTrendToggle = (currentDir: string, dirKey: string, typeKey?: string, currentType?: string) => (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <button 
          onClick={() => handleUpdate({ config: { ...activeBlock?.config, [dirKey]: 'up' } })}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center border-2 ${currentDir === 'up' ? 'bg-red-500 border-red-400 text-white' : 'bg-white/5 border-transparent text-white/20 hover:text-white/30'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
        </button>
        <button 
          onClick={() => handleUpdate({ config: { ...activeBlock?.config, [dirKey]: 'down' } })}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center border-2 ${currentDir === 'down' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white/5 border-transparent text-white/20 hover:text-white/30'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7L17 17M17 17V7M17 17H7"/></svg>
        </button>
        <button 
          onClick={() => handleUpdate({ config: { ...activeBlock?.config, [dirKey]: 'none' } })}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center border-2 ${currentDir === 'none' ? 'bg-gray-500 border-gray-400 text-white' : 'bg-white/5 border-transparent text-white/20 hover:text-white/30'}`}
        >
          <span className="text-[10px] font-bold">0 %</span>
        </button>
      </div>
      {typeKey && (
        <div className="flex gap-1 justify-between">
          {(['positive', 'negative', 'neutral'] as const).map(t => (
            <button 
              key={t}
              onClick={() => handleUpdate({ config: { ...activeBlock?.config, [typeKey]: t } })}
              className={`w-8 h-8 rounded-full border-2 border-white/10 ${t === 'positive' ? 'bg-emerald-500' : t === 'negative' ? 'bg-red-500' : 'bg-gray-500'} ${currentType === t ? 'ring-2 ring-white scale-110' : 'opacity-30 hover:opacity-50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  const deleteColumn = (yearIdx: number) => {
    if (!activeBlock || (activeBlock.type !== BlockType.TABLE_TREND && activeBlock.type !== BlockType.CHART_LINE_DUAL_COMPACT && activeBlock.type !== BlockType.CHART_LINE_SQUARE)) return;
    
    if (activeBlock.type === BlockType.TABLE_TREND) {
      const config = activeBlock.config || {};
      const years = config.years || [];
      const rows = config.rows || [];
      if (years.length <= 1) return;
      const newYears = years.filter((_, idx) => idx !== yearIdx);
      const newRows = rows.map((r: any) => ({
        ...r,
        values: r.values.filter((_: any, idx: number) => idx !== yearIdx)
      }));
      handleUpdate({ config: { ...config, years: newYears, rows: newRows } });
    } else {
      const data = activeBlock.data || [];
      if (data.length <= 1) return;
      handleUpdate({ data: data.filter((_, idx) => idx !== yearIdx) });
    }
  };

  const renderSpecificEditors = () => {
    if (!activeBlock) return null;

    switch (activeBlock.type) {
      case BlockType.CHART_LINE_SQUARE:
        return (
          <div className="space-y-4">
            <section><Label>Заголовок блока</Label><Textarea value={activeBlock.title} onChange={(e) => handleUpdate({ title: e.target.value })} /></section>
            
            <section className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <Label className="mb-0">Данные по годам (4 линии)</Label>
                <button 
                  onClick={() => {
                    const lastYear = activeBlock.data[activeBlock.data.length - 1]?.year || 2023;
                    handleUpdate({ data: [...activeBlock.data, { year: lastYear + 1, values: [0, 0, 0, 0] }] });
                  }}
                  className="text-blue-400 text-[10px] font-black uppercase bg-blue-400/10 px-3 py-1 rounded-full hover:bg-blue-400/20"
                >+ Добавить год</button>
              </div>
              <div className="space-y-3">
                {activeBlock.data.map((d, i) => (
                  <div key={i} className="bg-black/30 p-2 rounded-xl border border-white/5 space-y-2 relative group/item">
                    <div className="flex items-center justify-between">
                       <input 
                         type="number" 
                         value={d.year} 
                         onChange={(e) => handleUpdate({ data: activeBlock.data.map((item, idx) => idx === i ? { ...item, year: parseInt(e.target.value) || 0 } : item) })}
                         className="bg-transparent text-[11px] font-black text-white/50 w-16 outline-none"
                       />
                       <button onClick={() => deleteColumn(i)} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-red-500 p-1">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                       </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {CHART_COLORS.map((color, cIdx) => (
                        <NumberInput 
                          key={cIdx}
                          value={d.values[cIdx] || 0} 
                          bgColor={color}
                          onChange={(v) => {
                            const newVals = [...d.values];
                            newVals[cIdx] = v;
                            handleUpdate({ data: activeBlock.data.map((item, idx) => idx === i ? { ...item, values: newVals } : item) });
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case BlockType.CHART_LINE_DUAL_COMPACT:
        const COLOR_1 = CHART_COLORS[0];
        const COLOR_2 = '#8B3A62';
        return (
          <div className="space-y-4">
            <section><Label>Заголовок блока</Label><Textarea value={activeBlock.title} onChange={(e) => handleUpdate({ title: e.target.value })} /></section>
            
            <section className="bg-black/20 p-3 rounded-2xl border border-white/5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-blue-400">Тренд Линия 1</Label>
                  <Input value={activeBlock.config?.trendValue || ''} onChange={(e) => handleUpdate({ config: { ...activeBlock.config, trendValue: e.target.value } })} />
                  {renderTrendToggle(activeBlock.config?.trendDirection || 'up', 'trendDirection', 'trendType', activeBlock.config?.trendType)}
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-400">Тренд Линия 2</Label>
                  <Input value={activeBlock.config?.trendValue2 || ''} onChange={(e) => handleUpdate({ config: { ...activeBlock.config, trendValue2: e.target.value } })} />
                  {renderTrendToggle(activeBlock.config?.trendDirection2 || 'up', 'trendDirection2', 'trendType2', activeBlock.config?.trendType2)}
                </div>
              </div>
            </section>

            <section className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <Label className="mb-0">Данные по годам</Label>
                <button 
                  onClick={() => {
                    const lastYear = activeBlock.data[activeBlock.data.length - 1]?.year || 2023;
                    handleUpdate({ data: [...activeBlock.data, { year: lastYear + 1, values: [0, 0] }] });
                  }}
                  className="text-blue-400 text-[10px] font-black uppercase bg-blue-400/10 px-3 py-1 rounded-full hover:bg-blue-400/20"
                >+ Добавить</button>
              </div>
              <div className="space-y-3">
                {activeBlock.data.map((d, i) => (
                  <div key={i} className="bg-black/30 p-2 rounded-xl border border-white/5 space-y-2 relative group/item">
                    <div className="flex items-center justify-between">
                       <input 
                         type="number" 
                         value={d.year} 
                         onChange={(e) => handleUpdate({ data: activeBlock.data.map((item, idx) => idx === i ? { ...item, year: parseInt(e.target.value) || 0 } : item) })}
                         className="bg-transparent text-[11px] font-black text-white/50 w-16 outline-none"
                       />
                       <button onClick={() => deleteColumn(i)} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-red-500 p-1">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                       </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <NumberInput 
                        value={d.values[0] || 0} 
                        bgColor={COLOR_1}
                        onChange={(v) => handleUpdate({ data: activeBlock.data.map((item, idx) => idx === i ? { ...item, values: [v, item.values[1]] } : item) })} 
                      />
                      <NumberInput 
                        value={d.values[1] || 0} 
                        bgColor={COLOR_2}
                        onChange={(v) => handleUpdate({ data: activeBlock.data.map((item, idx) => idx === i ? { ...item, values: [item.values[0], v] } : item) })} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case BlockType.CHART_COLUMN:
        const sortedVals = [...activeBlock.data].map(d => d.values[0] || 0).sort((a, b) => b - a);
        const count = sortedVals.length;
        const hThres = sortedVals[Math.min(1, count - 1)];
        const lThres = sortedVals[Math.max(0, count - 2)];

        return (
          <div className="space-y-4">
            <section><Label>Заголовок блока</Label><Textarea value={activeBlock.title} onChange={(e) => handleUpdate({ title: e.target.value })} /></section>
            <section><Label>Иконка заголовка</Label><IconSelector selected={activeBlock.config?.iconType || 'heart'} onSelect={(type) => handleUpdate({ config: { ...activeBlock.config, iconType: type } })} /></section>
            <section className="grid grid-cols-2 gap-3">
              <div><Label>Процент тренда</Label><Input value={activeBlock.config?.trendValue || ''} onChange={(e) => handleUpdate({ config: { ...activeBlock.config, trendValue: e.target.value } })} /></div>
              <div><Label>Направление</Label>{renderTrendToggle(activeBlock.config?.trendDirection || 'up', 'trendDirection')}</div>
            </section>
            <section className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
              <div className="flex justify-between items-center mb-4"><Label className="mb-0">Данные по годам</Label><button onClick={() => { const lastYear = activeBlock.data[activeBlock.data.length - 1]?.year || 2023; handleUpdate({ data: [...activeBlock.data, { year: lastYear + 1, values: [0] }] }); }} className="text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full hover:bg-blue-400/20 transition-all">+ Добавить</button></div>
              <div className="flex flex-col">
                {activeBlock.data.map((d, i) => {
                  const val = d.values[0] || 0;
                  const color = val >= hThres ? COLUMN_COLORS.high : (val <= lThres ? COLUMN_COLORS.low : COLUMN_COLORS.mid);
                  return (<NumberInput key={i} label={d.year.toString()} value={val} bgColor={color} color="white" onDelete={() => handleUpdate({ data: activeBlock.data.filter((_, idx) => idx !== i) })} onChange={(v) => handleUpdate({ data: activeBlock.data.map((item, idx) => idx === i ? { ...item, values: [v] } : item) })} />);
                })}
              </div>
            </section>
          </div>
        );

      case BlockType.TABLE_TREND:
        const config = activeBlock.config || {};
        const rows = config.rows || [];
        const years = config.years || [];

        return (
          <div className="space-y-4">
            <section><Label>Заголовок таблицы</Label><Textarea value={activeBlock.title} onChange={(e) => handleUpdate({ title: e.target.value })} /></section>
            <section><Label>Иконка таблицы</Label><IconSelector selected={config.iconType || 'location'} onSelect={(type) => handleUpdate({ config: { ...config, iconType: type } })} /></section>

            <section className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-3"><Label className="mb-0">Столбцы лет</Label><button onClick={() => { const lastYear = years[years.length - 1] || 2023; const newYears = [...years, lastYear + 1]; const newRows = rows.map((r: any) => ({ ...r, values: [...r.values, 0] })); handleUpdate({ config: { ...config, years: newYears, rows: newRows } }); }} className="text-blue-400 text-[9px] font-black uppercase hover:bg-blue-400/10 px-2 py-1 rounded">Добавить год</button></div>
              <div className="flex flex-wrap gap-2">
                {years.map((y: number, i: number) => (
                  <div key={i} className="relative group/year">
                    <input type="number" value={y} onChange={(e) => { const val = parseInt(e.target.value) || 0; const newYears = [...years]; newYears[i] = val; handleUpdate({ config: { ...config, years: newYears } }); }} className="w-14 bg-black/40 border border-white/10 rounded py-1.5 text-[10px] text-center text-white font-bold outline-none focus:border-white/30 transition-all" />
                    <button onClick={() => deleteColumn(i)} className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/year:opacity-100 transition-opacity"><svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-3"><Label className="mb-0">Редактор субъектов</Label><button onClick={() => { const newRow: TrendRow = { id: Math.random().toString(36).substr(2, 9), label: 'НОВЫЙ РЕГИОН', values: years.map(() => 0), trendValue: '0 %', trendDirection: 'down', trendType: 'positive', trendStartYear: years[0], trendEndYear: years[years.length - 1] }; handleUpdate({ config: { ...config, rows: [...rows, newRow] } }); }} className="bg-blue-600/20 text-blue-400 text-[20px] w-9 h-9 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg">+</button></div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {rows.map((row: TrendRow) => (
                  <div key={row.id} className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-4 relative group">
                    <button onClick={() => handleUpdate({ config: { ...config, rows: rows.filter((r: any) => r.id !== row.id) } })} className="absolute -right-2 -top-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:scale-110 active:scale-95"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                    <div><Label>Субъект</Label><Input value={row.label} className="text-[10px] uppercase font-black" onChange={(e) => { const newRows = rows.map((r: any) => r.id === row.id ? { ...r, label: e.target.value } : r); handleUpdate({ config: { ...config, rows: newRows } }); }} /></div>
                    
                    <div>
                      <Label className="mt-2 !text-[#5B9BD5]">Значения по годам</Label>
                      <div className="grid grid-cols-4 gap-1.5 mt-1">
                        {years.map((year, yIdx) => (
                          <div key={yIdx}>
                            <div className="text-[6px] font-black text-white/20 mb-0.5">{year}</div>
                            <input 
                              type="text" 
                              value={row.values[yIdx] ?? ''} 
                              className="w-full bg-black/40 border border-white/5 rounded px-1 py-1 text-[9px] text-white font-bold outline-none focus:border-blue-500/30"
                              onChange={(e) => {
                                const newRows = rows.map((r: any) => {
                                  if (r.id === row.id) {
                                    const newVals = [...r.values];
                                    newVals[yIdx] = e.target.value;
                                    return { ...r, values: newVals };
                                  }
                                  return r;
                                });
                                handleUpdate({ config: { ...config, rows: newRows } });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div className="flex-1"><Label>Тренд (%)</Label><Input value={row.trendValue} className="!py-2 !text-[10px] text-center font-black" onChange={(e) => { const newRows = rows.map((r: any) => r.id === row.id ? { ...r, trendValue: e.target.value } : r); handleUpdate({ config: { ...config, rows: newRows } }); }} /></div>
                      <div className="flex gap-1 justify-center pb-1">{(['positive', 'negative', 'neutral'] as const).map(t => (<button key={t} onClick={() => { const newRows = rows.map((r: any) => r.id === row.id ? { ...r, trendType: t, trendDirection: t === 'negative' ? 'up' : 'down' } : r); handleUpdate({ config: { ...config, rows: newRows } }); }} className={`w-7 h-7 rounded-full border-2 border-white/10 ${t === 'positive' ? 'bg-emerald-500' : t === 'negative' ? 'bg-red-500' : 'bg-gray-500'} ${row.trendType === t ? 'ring-2 ring-white scale-110' : 'opacity-20 hover:opacity-40'}`} />))}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case BlockType.ROAD_INFO:
        return (
          <div className="space-y-4">
            <section><Label>Заголовок (Субъект)</Label><Textarea value={activeBlock.title} onChange={(e) => handleUpdate({ title: e.target.value })} /></section>
            <section><Label>Иконка заголовка</Label><IconSelector selected={activeBlock.config?.iconType || 'location'} onSelect={(type) => handleUpdate({ config: { ...activeBlock.config, iconType: type } })} /></section>
            <section><Label>Трасса</Label><Input value={activeBlock.config?.roadName || ''} onChange={(e) => handleUpdate({ config: { ...activeBlock.config, roadName: e.target.value } })} /></section>
            <section><Label>Описание</Label><Textarea rows={4} value={activeBlock.config?.description || ''} onChange={(e) => handleUpdate({ config: { ...activeBlock.config, description: e.target.value } })} /></section>
          </div>
        );

      case BlockType.ROAD_STATS:
        const stats = activeBlock.config?.statsData || {
          year1: 2017, year2: 2023, km1: 0, km2: 0, kmTrend: '', traffic1: 0, traffic2: 0, trafficTrend: ''
        };
        const updateStats = (newStats: any) => handleUpdate({ config: { ...activeBlock.config, statsData: { ...stats, ...newStats } } });

        return (
          <div className="space-y-4">
            <section className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-4">
              <Label className="mb-2">Годы сравнения</Label>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Год 1</Label><NumberInput value={stats.year1} onChange={(v) => updateStats({ year1: v })} /></div>
                <div><Label>Год 2</Label><NumberInput value={stats.year2} onChange={(v) => updateStats({ year2: v })} /></div>
              </div>
            </section>
            
            <section className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-4">
              <Label className="mb-2">Показатели КМ</Label>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>КМ (Год 1)</Label><NumberInput value={stats.km1} bgColor="#8E8E8E" onChange={(v) => updateStats({ km1: v })} /></div>
                <div><Label>КМ (Год 2)</Label><NumberInput value={stats.km2} bgColor="#8E8E8E" onChange={(v) => updateStats({ km2: v })} /></div>
              </div>
              <div><Label>Тренд КМ (текст)</Label><Input value={stats.kmTrend} onChange={(e) => updateStats({ kmTrend: e.target.value })} /></div>
            </section>

            <section className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-4">
              <Label className="mb-2">Показатели Трафика</Label>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Трафик (Год 1)</Label><NumberInput value={stats.traffic1} bgColor="#2E2A6D" onChange={(v) => updateStats({ traffic1: v })} /></div>
                <div><Label>Трафик (Год 2)</Label><NumberInput value={stats.traffic2} bgColor="#2E2A6D" onChange={(v) => updateStats({ traffic2: v })} /></div>
              </div>
              <div><Label>Тренд Трафика (текст)</Label><Input value={stats.trafficTrend} onChange={(e) => updateStats({ trafficTrend: e.target.value })} /></div>
            </section>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <section><Label>Заголовок</Label><Textarea value={activeBlock.title} onChange={(e) => handleUpdate({ title: e.target.value })} /></section>
          </div>
        );
    }
  };

  return (
    <aside className="w-80 bg-[#0F172A] border-l border-white/10 flex flex-col h-full shadow-2xl z-20 text-white overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-black/30 backdrop-blur-lg">
        <h2 className="text-[11px] font-black tracking-[0.2em] uppercase text-blue-400">Настройки</h2>
        {activeBlock && <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded">ID: {activeBlock.id}</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-900/50">
        {activeBlock ? renderSpecificEditors() : (
          <div className="flex flex-col items-center justify-center h-full text-white/5 gap-4 opacity-50 select-none">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-center max-w-[140px] leading-relaxed">Выберите элемент для настройки</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarRight;
