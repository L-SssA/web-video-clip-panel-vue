export type SourceType = "video" | "audio" | "text" | "image";

export interface BaseTrackItem {
  id: string; // 轨道片段ID
  parentId: string; // 父级轨道ID
  type: SourceType; // 轨道片段类型
  name: string; // 轨道片段名称
  start: number; // 轨道片段开始时间
  end: number; // 轨道片段结束时间
  changeable: boolean; // 是否可改变
  reloadFlag: boolean; // 是否需要重新加载
  loading?: boolean; // 加载状态
  ghost?: boolean; // 是否为 ghost 片段
}

export interface ImageTrackItem extends BaseTrackItem {
  type: "image";
  source: string; // 图片源
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
  audioData: number[];
  /* 音频信息 */
  duration: number;
  /* 配置项 */
  mute: boolean;
  volume: number; // 音量
  clipStart: number; // 裁剪开始时间
  clipEnd: number; // 裁剪结束时间
}

export interface VideoTrackItem extends BaseTrackItem {
  type: "video";
  source: string; // 视频源
  audioSource: string; // 音频源
  previewList: string[]; // 轨道预览图片
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
  clipStart: number; // 裁剪开始时间
  clipEnd: number; // 裁剪结束时间
  mute: boolean;
  volume: number; // 音量
  enableChromaKey: boolean; // 是否启用色键，即是否使用绿色屏幕
}

export type TrackItem = ImageTrackItem | TextTrackItem | AudioTrackItem | VideoTrackItem;

export interface BaseTrackLine<T extends TrackItem = TrackItem> {
  id: string;
  type: T["type"];
  data: T[];
  main?: boolean;
  mute?: boolean;
}

export interface ImageTrackLine extends BaseTrackLine<ImageTrackItem> {}

export interface TextTrackLine extends BaseTrackLine<TextTrackItem> {}

export interface AudioTrackLine extends BaseTrackLine<AudioTrackItem> {}

export interface VideoTrackLine extends BaseTrackLine<VideoTrackItem> {}

export type TrackLine = ImageTrackLine | TextTrackLine | AudioTrackLine | VideoTrackLine;

export type pictureTrackLine = ImageTrackLine | VideoTrackLine;

/**
 * 轨道线上下文数据
 */
export interface TrackLineContext {}
