/**
 * 时间线样式
 */
export interface TimelineStyles {
  lineColor: string;
  lineWidth: number;
  fontColor: string;
  fontSize: number;
  cursorLineColor: string;
  cursorLineWidth: number;
}

/**
 * 时间线上下文数据
 */
export interface TimelineContext {
  fps: number;
  currentTime: number;
  scale: number;
  gapWidth: number;
  gapsPerLabel: number;
  framesPerGap: number;
  marginLeft: number;
  cursorLinePosition: number;
  styles: TimelineStyles;
}

/**
 * 时间线数据选项
 */
export interface TimelineDataOptions {
  scale: number;
  fps: number;
  autoAdsorbDistance: number;
  marginLeft: number;
  styles: Partial<TimelineStyles>;
}
