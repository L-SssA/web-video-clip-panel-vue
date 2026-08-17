/**
 * WebAV 视频剪辑构建器
 */
import { createChromakey, AudioClip, MP4Clip, ImgClip } from "@webav/av-cliper";

import type { TrackItem, ImageTrackItem, VideoTrackItem } from "@/types/trackline";
import type { ChromaKeyOptions, ChromaKeyProcessor, WebavClipBuilderFunction } from "@/types/webav";

/**
 * 构建视频片段
 * @param ctx - WebavClipBuilder 实例
 * @param sourceData - 视频数据源（可读流或图像位图）
 * @param trackItem - 轨道项配置
 * @param opts - 额外选项
 * @returns 返回准备好的 MP4Clip 实例
 */
const buildVideoClip = async (
  ctx: WebavClipBuilder,
  sourceData: ReadableStream<Uint8Array> | ImageBitmap,
  trackItem: TrackItem,
  opts?: Record<string, any>,
) => {
  const { enableChromaKey } = trackItem as VideoTrackItem;
  // 创建 MP4 视频片段，禁用音频轨道
  const videoClip = new MP4Clip(sourceData as ReadableStream<Uint8Array>, {
    ...opts,
    audio: false,
  });

  // 如果启用绿幕抠像，设置帧拦截器处理每一帧
  if (enableChromaKey) {
    videoClip.tickInterceptor = async (_, tickRet) => {
      if (tickRet.video == null) return tickRet;
      return {
        ...tickRet,
        video: await ctx.chromakey(tickRet.video),
      };
    };
  }

  await videoClip.ready;
  return videoClip;
};

/**
 * 构建音频片段
 * @param _ctx - WebavClipBuilder 实例（未使用）
 * @param sourceData - 音频数据源（可读流或图像位图）
 * @param _trackItem - 轨道项配置（未使用）
 * @param opts - 额外选项
 * @returns 返回准备好的 AudioClip 实例
 */
const buildAudioClip = async (
  _ctx: WebavClipBuilder,
  sourceData: ReadableStream<Uint8Array> | ImageBitmap,
  _trackItem: TrackItem,
  opts?: Record<string, any>,
) => {
  const audioClip = new AudioClip(sourceData as ReadableStream<Uint8Array>, opts);
  await audioClip.ready;
  return audioClip;
};

/**
 * 构建图像片段
 * @param _ctx - WebavClipBuilder 实例（未使用）
 * @param sourceData - 图像数据源（可读流或图像位图）
 * @param trackItem - 轨道项配置
 * @param _opts - 额外选项（未使用）
 * @returns 返回准备好的 ImgClip 实例
 */
const buildImageClip = async (
  _ctx: WebavClipBuilder,
  sourceData: ReadableStream<Uint8Array> | ImageBitmap,
  trackItem: TrackItem,
  _opts?: Record<string, any>,
) => {
  const { gif } = trackItem as ImageTrackItem;
  let imageClip = null;

  // 根据是否为 GIF 格式选择不同的初始化方式
  if (gif) {
    // GIF 需要指定 MIME 类型和流
    imageClip = new ImgClip({
      type: "image/gif",
      stream: sourceData as ReadableStream<Uint8Array>,
    });
  } else {
    // 普通图片直接使用数据源
    imageClip = new ImgClip(sourceData);
  }

  await imageClip.ready;
  return imageClip;
};

/**
 * 构建文本片段
 * @param _ctx - WebavClipBuilder 实例（未使用）
 * @param sourceData - 文本数据源（可读流或图像位图）
 * @param _trackItem - 轨道项配置（未使用）
 * @param _opts - 额外选项（未使用）
 * @returns 返回准备好的 ImgClip 实例
 */
const buildTextClip = async (
  _ctx: WebavClipBuilder,
  sourceData: ReadableStream<Uint8Array> | ImageBitmap,
  _trackItem: TrackItem,
  _opts?: Record<string, any>,
) => {
  const textClip = new ImgClip(sourceData);
  await textClip.ready;
  return textClip;
};

/**
 * WebAV 剪辑构建器类
 */
export class WebavClipBuilder {
  private builders: Record<string, WebavClipBuilderFunction> = {
    video: buildVideoClip,
    audio: buildAudioClip,
    image: buildImageClip,
    text: buildTextClip,
  };
  public chromakey: ChromaKeyProcessor;

  constructor(chromaKeyOptions: ChromaKeyOptions) {
    this.chromakey = createChromakey(chromaKeyOptions);
  }

  /**
   * 构建媒体片段
   * @param source - 媒体数据源
   * @param trackItem - 轨道项配置
   * @param opts - 额外选项
   * @returns 返回构建好的媒体片段实例，如果类型不支持则返回 null
   */
  buildClip(
    source: ReadableStream<Uint8Array> | ImageBitmap,
    trackItem: TrackItem,
    opts?: Record<string, any>,
  ) {
    const builder = this.builders[trackItem.type];
    if (!builder) return null;
    return builder(this, source, trackItem, opts);
  }
}
