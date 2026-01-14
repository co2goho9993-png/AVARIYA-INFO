
import React from 'react';

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const MM_TO_PX = 3.78; 

export const PAGE_WIDTH = A4_WIDTH_MM * MM_TO_PX;
export const PAGE_HEIGHT = A4_HEIGHT_MM * MM_TO_PX;

export const MARGIN_PX = 10 * MM_TO_PX;
export const GUTTER_PX = 4 * MM_TO_PX;
export const COLUMNS = 12;

export const CONTENT_WIDTH_PX = PAGE_WIDTH - (2 * MARGIN_PX);
export const COLUMN_WIDTH_PX = (CONTENT_WIDTH_PX - (GUTTER_PX * (COLUMNS - 1))) / COLUMNS;
export const VERTICAL_GRID_STEP = 10;

export const CHART_COLORS = [
  '#2E2A6D', // Dark Blue
  '#008B72', // Teal
  '#FBB03B', // Yellow
  '#29ABE2'  // Light Blue
];

export const COLUMN_COLORS = {
  high: '#008B72',
  mid: '#66B9AA',
  low: '#B2DBD4'
};

export const ORANGE_MARKER = '#EA580C';
export const YELLOW_MARKER = '#FBB03B';
export const YELLOW_LINE_INDEX = 2;

export const fixTypography = (text: string | number | null | undefined): string => {
  if (text === null || text === undefined) return '';
  let str = String(text);
  // Auto en-dash for ranges
  str = str.replace(/(\d)\s*-\s*(\d)/g, '$1\u2013$2');
  // Non-breaking space for short prepositions
  str = str.replace(/(\s|^)([а-яА-ЯёЁ]{1,2})\s/g, '$1$2\u00A0');
  // Non-breaking space for percentage
  str = str.replace(/\s%/g, '\u00A0%');
  // Remove space around plus for km markers
  str = str.replace(/(\d)\s*\+\s*(\d)/g, '$1+$2');
  return str;
};

// Fix truncated ICONS and add missing icons referenced in other files
export const ICONS = {
  Trash: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
    </svg>
  ),
  Heart: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  ),
  Car: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
    </svg>
  ),
  Drink: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15.2 3a2 2 0 0 1 1.6.8l4.4 6a2 2 0 0 1 0 2.4l-4.4 6a2 2 0 0 1-1.6.8H8.8a2 2 0 0 1-1.6-.8l-4.4-6a2 2 0 0 1 0-2.4l4.4-6a2 2 0 0 1 1.6-.8z"/><path d="m8 3 4 8 4-8"/><path d="M12 11v10"/>
    </svg>
  ),
  Shield: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Location: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Traffic: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><circle cx="12" cy="7" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="17" r="2"/>
    </svg>
  ),
  TextInfo: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
    </svg>
  ),
  Bar: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  TrendTable: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
  Download: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

// Add CHART_ICONS which are needed by LineChart.tsx
export const CHART_ICONS = [
  <path key="0" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />,
  <path key="1" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  <path key="2" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />,
  <path key="3" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
];
