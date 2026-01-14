
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Block } from '../types';
import { fixTypography, ICONS } from '../constants';

interface HeaderBlockProps {
  block: Block;
}

const HeaderBlock: React.FC<HeaderBlockProps> = ({ block }) => {
  const getIcon = () => {
    const iconType = block.config?.iconType || 'heart';
    switch (iconType) {
      case 'car': return ICONS.Car;
      case 'drink': return ICONS.Drink;
      case 'shield': return ICONS.Shield;
      case 'location': return ICONS.Location;
      default: return ICONS.Heart;
    }
  };
  const Icon = getIcon();

  return (
    <div className="w-full h-full p-1 bg-white overflow-hidden flex items-center" style={{ fontFamily: 'Montserrat' }}>
      <div className="flex-shrink-0 mr-1.5 flex items-center justify-center" style={{ width: '12px' }}>
        <div className="text-[#29ABE2] flex items-center justify-center">
          <Icon className="w-[10px] h-[10px]" strokeWidth={3} />
        </div>
      </div>
      <h2 
        className="text-[7.5px] font-extrabold text-[#2E2A6D] uppercase tracking-tight whitespace-pre-wrap leading-[1.1] flex-1 overflow-hidden m-0"
      >
        {fixTypography(block.title)}
      </h2>
    </div>
  );
};

export default HeaderBlock;
