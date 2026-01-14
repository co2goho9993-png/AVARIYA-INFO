
import React from 'react';
import { Block } from '../types';
import { fixTypography, ICONS } from '../constants';

interface RoadInfoBlockProps {
  block: Block;
}

const RoadInfoBlock: React.FC<RoadInfoBlockProps> = ({ block }) => {
  const roadName = block.config?.roadName || '';
  const description = block.config?.description || '';

  const getIcon = () => {
    const iconType = block.config?.iconType || 'location';
    switch (iconType) {
      case 'car': return ICONS.Car;
      case 'drink': return ICONS.Drink;
      case 'shield': return ICONS.Shield;
      case 'location': return ICONS.Location;
      case 'heart': return ICONS.Heart;
      case 'traffic': return ICONS.Traffic;
      default: return ICONS.Location;
    }
  };
  const Icon = getIcon();

  const formatDescription = (text: string) => {
    let t = fixTypography(text);
    t = t.replace(/(км[^\S\r\n]+[\d+]+)[^\S\r\n]*[\-\u2013\u2014][^\S\r\n]*(км)/g, '$1\u00A0\u2013 $2');
    t = t.replace(/(км[^\S\r\n]+[\d+]+)[^\S\r\n]*[\-\u2013\u2014][^\S\r\n]*([а-яА-ЯёЁ])/g, '$1\u00A0\u2014 $2');
    t = t.replace(/[^\S\r\n]+([\u2013\u2014])/g, '\u00A0$1');
    return t;
  };

  return (
    <div className="w-full h-full bg-white pt-1 px-1.5 pb-1 flex flex-col" style={{ fontFamily: 'Montserrat' }}>
      {/* Заголовок субъекта с иконкой: выравнивание по центру по вертикали (items-center) и минимальный нижний отступ */}
      <div className="flex items-center gap-1 mb-[1px]">
        <div className="text-[#29ABE2] flex-shrink-0 flex items-center justify-center">
          {/* Явное указание fill="none" помогает избежать заливки черным при экспорте в Adobe Illustrator */}
          <Icon className="w-[11px] h-[11px]" strokeWidth={2.8} fill="none" />
        </div>
        <h1 className="text-[6.6px] font-bold text-black uppercase tracking-tight leading-none flex-1 m-0">
          {fixTypography(block.title)}
        </h1>
      </div>
      
      {/* Описание трассы: уменьшенная высота строки для более плотной верстки */}
      <div className="text-left overflow-hidden whitespace-pre-wrap" style={{ lineHeight: '8.8px' }}>
        {roadName && (
          <span className="text-[8.43px] font-bold text-[#2E2A6D] uppercase mr-1">
            {roadName}
          </span>
        )}
        <span className="text-[5.57px] font-medium text-black tracking-tight whitespace-pre-wrap">
          {formatDescription(description)}
        </span>
      </div>
    </div>
  );
};

export default RoadInfoBlock;
