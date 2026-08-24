import { AudioClip, ImgClip, MP4Clip } from "@webav/av-cliper";

import { WebavClipBuilder } from "@/webav/webavClipBuilder";

import type { SourceType, TrackItem } from "./trackline";

// webav clip 缓存数据结构
export type WebavClipCacheData = {
  id: string | symbol;
  type: SourceType;
  response: ImageBitmap | Response;
  clip?: ImgClip | MP4Clip;
  thumbnails?: Promise<string[]>;
};

// 绿幕抠像选项
export type ChromaKeyOptions = {
  keyColor?: [number, number, number];
  similarity: number;
  smoothness: number;
  spill: number;
};

// 图像源类型
export type WebavImgSource =
  | HTMLVideoElement
  | HTMLCanvasElement
  | HTMLImageElement
  | ImageBitmap
  | OffscreenCanvas
  | VideoFrame;

// 绿幕抠像处理器
export type ChromaKeyProcessor = (source: WebavImgSource) => Promise<ImageBitmap | VideoFrame>;

// 媒体片段类型
export type MediaClip = ImgClip | MP4Clip | AudioClip;

// webav clip 构建器函数
export type WebavClipBuilderFunction = (
  ctx: WebavClipBuilder,
  sourceData: ReadableStream<Uint8Array> | ImageBitmap,
  trackItem: TrackItem,
  opts?: Record<string, any>,
) => Promise<MediaClip>;

// webav 缩略图构建器函数
export type WebavThumbnailsBuilderFunction = (
  clip: MediaClip,
  trackItem: TrackItem,
) => Promise<string[]>;

export interface WebavHelperOptions {
  chromaKeyOptions: ChromaKeyOptions;
}
