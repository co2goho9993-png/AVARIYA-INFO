
import React from 'react';
import { Block } from '../types';
import { CHART_COLORS } from '../constants';

interface SimpleTableProps {
  block: Block;
  width: number;
  height: number;
}

const SimpleTable: React.FC<SimpleTableProps> = ({ block, width, height }) => {
  return (
    <div className="w-full h-full overflow-auto bg-white p-2" style={{ fontFamily: 'Montserrat' }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-[10px] font-bold text-gray-400 text-left pb-1">Год</th>
            <th className="text-[10px] font-bold text-gray-400 text-center pb-1">Л1</th>
            <th className="text-[10px] font-bold text-gray-400 text-center pb-1">Л2</th>
            <th className="text-[10px] font-bold text-gray-400 text-center pb-1">Л3</th>
            <th className="text-[10px] font-bold text-gray-400 text-center pb-1">Л4</th>
          </tr>
        </thead>
        <tbody>
          {block.data.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              <td className="text-[10px] font-bold text-gray-800 py-1">{row.year}</td>
              {row.values.map((val, vIdx) => (
                <td 
                  key={vIdx} 
                  className="text-[10px] text-center font-bold py-1"
                  style={{ color: CHART_COLORS[vIdx] }}
                >
                  {val.toLocaleString('ru-RU')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;
