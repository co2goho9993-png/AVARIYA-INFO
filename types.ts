
export enum BlockType {
  CHART_LINE_SQUARE = 'CHART_LINE_SQUARE',
  CHART_LINE_DUAL_COMPACT = 'CHART_LINE_DUAL_COMPACT',
  CHART_COLUMN = 'CHART_COLUMN',
  TABLE_SIMPLE = 'TABLE_SIMPLE',
  TABLE_TREND = 'TABLE_TREND',
  HEADER = 'HEADER',
  ROAD_INFO = 'ROAD_INFO',
  ROAD_STATS = 'ROAD_STATS'
}

export interface ChartDataPoint {
  year: number;
  values: number[];
}

export interface TrendRow {
  id: string;
  label: string;
  values: (number | string | null)[];
  trendValue: string;
  trendDirection: 'up' | 'down';
  trendType?: 'positive' | 'negative' | 'neutral';
  trendStartYear: number;
  trendEndYear: number;
  logoUrl?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data: ChartDataPoint[];
  config?: {
    roadName?: string;
    description?: string;
    trendValue?: string;
    trendDirection?: 'up' | 'down' | 'none';
    trendType?: 'positive' | 'negative' | 'neutral';
    trendValue2?: string;
    trendDirection2?: 'up' | 'down' | 'none';
    trendType2?: 'positive' | 'negative' | 'neutral';
    startYear?: number;
    endYear?: number;
    iconType?: 'heart' | 'car' | 'drink' | 'shield' | 'location' | 'traffic';
    rows?: TrendRow[];
    years?: number[];
    lineIcons?: number[];
    statsData?: {
      year1: number;
      year2: number;
      km1: number;
      km2: number;
      kmTrend: string;
      traffic1: number;
      traffic2: number;
      trafficTrend: string;
      trafficLogoUrl?: string;
    };
  };
}

export interface Page {
  id: string;
  blocks: Block[];
}

export interface DocumentState {
  pages: Page[];
}
