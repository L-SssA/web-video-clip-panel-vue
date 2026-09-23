export interface IData {
  /**
   * 添加更新回调
   * @param callback 回调函数
   */
  onUpdate(callback: Function): void;
  /**
   * 移除更新回调
   * @param callback 回调函数
   */
  offUpdate(callback: Function): void;
  /**
   * 释放资源
   */
  release(): void;
}

/**
 * 系统通用样式
 */
export interface SystemCommonStyles {
  color: string;
  colorLight: string;
  backgroundColor: string;
  colorActive: string;
}

/**
 * 轨道线上下文数据
 */
export interface SystemCommonContext {
  styles: SystemCommonStyles;
  panelHeight: number;
}

/**
 * 系统通用数据
 */
export interface SystemCommonDataOptions {
  styles: Partial<SystemCommonStyles>;
  panelHeight: number;
}

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
  scrollOffset: number;
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

/**
 * 轨道样式
 */
export interface TrackLineStyles {
  iconColor: string;
  iconSize: number;
  backgroundColor: string;
  activeBgColor: string;
}

/**
 * 轨道线上下文数据
 */
export interface TrackLineContext {
  mergeTrackLineList: TrackLine[];
  marginTop: number;
  gapHeight: number;
  marginLeft: number;
  trackHeights: Record<string, number>;
  trackIcons: Record<string, string>;
  trackItemColors: Record<string, string>;
  styles: TrackLineStyles;
  audioBarWidth: number;
  audioBarSpacing: number;
  audioBarHeight: number;
}

/**
 * 轨道数据选项
 */
export interface TrackLineDataOptions {
  marginTop: number;
  gapHeight: number;
  marginLeft: number;
  trackHeights: Record<string, number>;
  trackIcons: Record<string, string>;
  trackItemColors: Record<string, string>;
  styles: Partial<TrackLineStyles>;
  audioBarWidth: number;
  audioBarSpacing: number;
  audioBarHeight: number;
}

export type SourceType = "video" | "audio" | "text" | "image";

export interface BaseTrackItem {
  id: string | symbol; // 轨道片段ID
  parentId: string | symbol; // 父级轨道ID
  type: SourceType; // 轨道片段类型
  name: string; // 轨道片段名称
  start: number; // 轨道片段开始时间
  end: number; // 轨道片段结束时间
  changeable: boolean; // 是否可改变
  reloadFlag: boolean; // 是否需要重新加载
  loading?: boolean; // 加载状态
  ghost?: boolean; // 是否为 ghost 片段
  clipStart: number; // 裁剪开始时间
  clipEnd: number; // 裁剪结束时间
}

export interface ImageTrackItem extends BaseTrackItem {
  type: "image";
  source: string; // 图片源
  previewListLoader: Promise<string[]>; // 轨道预览图片加载器
  previewList: string[];
  // 图片信息
  gif: boolean;
  originWidth: number;
  originHeight: number;
}

export interface TextTrackItem extends BaseTrackItem {
  type: "text";
  text: string;
}

export interface AudioTrackItem extends BaseTrackItem {
  type: "audio";
  source: string; // 音频源
  audioDataLoader: Promise<number[]>; // 轨道音频数据加载器
  audioData: number[];
  /* 音频信息 */
  duration: number;
  /* 配置项 */
  mute: boolean;
  volume: number; // 音量
}

export interface VideoTrackItem extends BaseTrackItem {
  type: "video";
  source: string; // 视频源
  audioSource: string; // 音频源
  previewListLoader: Promise<string[]>; // 轨道预览图片加载器
  previewList: string[]; // 轨道预览图片
  audioDataLoader: Promise<number[]>; // 轨道音频数据加载器
  audioData: number[];
  audioTrackItem?: AudioTrackItem;
  /* 视频信息 */
  originWidth: number;
  originHeight: number;
  fps: number;
  frameCount: number;
  previewDuration: number;
  duration: number;
  /* 配置项 */
  mute: boolean;
  volume: number; // 音量
  enableChromaKey: boolean; // 是否启用色键，即是否使用绿色屏幕
}

export type TrackItem = ImageTrackItem | TextTrackItem | AudioTrackItem | VideoTrackItem;

export interface BaseTrackLine<T extends TrackItem = TrackItem> {
  id: string | symbol;
  type: T["type"];
  data: T[];
  main?: boolean;
  mute?: boolean;
}

export type ImageTrackLine = BaseTrackLine<ImageTrackItem>;

export type TextTrackLine = BaseTrackLine<TextTrackItem>;

export type AudioTrackLine = BaseTrackLine<AudioTrackItem>;

export type VideoTrackLine = BaseTrackLine<VideoTrackItem>;

export type TrackLine<T extends TrackItem = TrackItem> = {
  [K in T["type"]]: BaseTrackLine<T>;
}[T["type"]];

export type pictureTrackLine = ImageTrackLine | VideoTrackLine;

export type ActionType = "start" | "end" | "move";
