import { AudioClip, type ImgClip } from "@webav/av-cliper";

import type { AudioTrackItem, ImageTrackItem, TrackItem, VideoTrackItem } from "@/types/data";
import type { WebavClipCacheData, WebavHelperOptions } from "@/types/webav";

import { DEFAULT_CHROMAKEY_OPTIONS } from "@/config/constant";
import { generateUUID, getResizeImageBlob } from "@/utils/tools";

import { WebavClipBuilder } from "./WebavClipBuilder";

/**
 * WebAV 辅助类
 * 负责管理媒体片段的缓存和创建
 */
export default class WebavHelper {
  // 片段缓存池，用于存储已加载的媒体片段
  private _clipCache: Map<string | symbol, WebavClipCacheData> = new Map();
  // WebAV 片段构建器实例
  private _webavClipBuilder: WebavClipBuilder;

  /**
   * 构造函数
   * @param chromaKeyOptions - 绿幕抠像配置选项，默认使用常量配置
   */
  constructor(options: Partial<WebavHelperOptions> = {}) {
    const { chromaKeyOptions = DEFAULT_CHROMAKEY_OPTIONS } = options;
    // 初始化 WebAV 片段构建器，用于创建媒体片段
    this._webavClipBuilder = new WebavClipBuilder(chromaKeyOptions);
  }

  /**
   * 加载媒体片段
   * @param trackitem - 轨道项配置
   * @param source - 媒体数据源
   * @param opts - 额外选项
   */
  async loadClip(
    trackitem: TrackItem,
    source: string | ImageBitmap | File,
    opts?: Record<string, any>,
  ) {
    if (!trackitem.id) {
      console.warn("trackitem 缺少 id, 系统将自动创建。");
      trackitem.id = generateUUID();
    }

    const cacheClip = await this.createClipFromCache(trackitem, opts);
    if (cacheClip) return cacheClip;

    // 根据数据源类型选择加载方式
    if (source instanceof ImageBitmap) {
      return this.loadImageBitmapClip(trackitem, source, opts);
    } else if (source instanceof File) {
      return this.loadFileClip(trackitem, source, opts);
    } else {
      return this.loadUrlClip(trackitem, source, opts);
    }
  }

  /**
   * 从 ImageBitmap 加载媒体片段（图片、GIF等）
   * @param trackitem - 轨道项配置
   * @param source - ImageBitmap 图像数据
   * @param opts - 额外选项
   * @returns 返回创建的图像片段
   */
  async loadImageBitmapClip(trackitem: TrackItem, source: ImageBitmap, opts?: Record<string, any>) {
    const clip = (await this.createClip(trackitem, source, opts)) as ImgClip;

    this._clipCache.set(trackitem.id, {
      id: trackitem.id,
      type: trackitem.type,
      response: source,
      clip: clip,
    });

    return clip;
  }

  async loadFileClip(trackitem: TrackItem, source: File, opts?: Record<string, any>) {
    const clip = await this.createClip(trackitem, source, opts);

    this._clipCache.set(trackitem.id, {
      id: trackitem.id,
      type: trackitem.type,
      response: source,
      clip: clip,
    });

    return clip;
  }

  /**
   * 从 URL 加载媒体片段（视频、音频等）
   * @param trackitem - 轨道项配置
   * @param source - 资源的 URL 地址
   * @param opts - 额外选项
   * @returns 返回创建的媒体片段，如果响应无效则返回 undefined
   */
  async loadUrlClip(trackitem: TrackItem, source: string, opts?: Record<string, any>) {
    const response = await fetch(source);
    if (!response.body) return null;

    const clip = await this.createClip(trackitem, response, opts);

    this._clipCache.set(trackitem.id, {
      id: trackitem.id,
      type: trackitem.type,
      response,
      clip,
    });

    return clip;
  }

  /**
   * 从缓存创建片段，不存在则基于响应数据创建
   * @param trackitem - 轨道项配置
   * @returns 返回缓存中的片段或新创建的片段，如果缓存不存在则返回 null
   */
  async createClipFromCache(trackitem: TrackItem, opts?: Record<string, any>) {
    const cache = this._clipCache.get(trackitem.id);

    if (!cache) return null;
    if (cache.clip) return cache.clip;

    return this.createClip(trackitem, cache.response, opts);
  }

  /**
   * 创建媒体片段
   * @param trackitem - 轨道项配置
   * @param response - 响应数据或图像位图
   * @param opts - 额外选项
   * @returns 返回创建好的媒体片段
   * @throws 当源数据类型不支持时抛出错误
   */
  async createClip(
    trackitem: TrackItem,
    source: Response | ImageBitmap | File,
    opts?: Record<string, any>,
  ) {
    // 提取源数据：Response 需克隆，ImageBitmap 直接使用
    const sourceData = source instanceof Response ? source.clone() : source;

    if (!sourceData) {
      throw new Error("Unsupported source data type");
    }

    return this._webavClipBuilder.buildClip(sourceData, trackitem, opts);
  }

  /**
   * 获取轨道片段单帧画面
   * @param trackitem - 轨道项配置
   * @param time - 时间点（微秒）
   */
  async tick(trackitem: TrackItem, time: number) {
    const cache = this._clipCache.get(trackitem.id);
    if (!cache || !cache.clip) return { video: undefined, audio: undefined, state: "error" };
    return cache.clip.tick(time).then((data) => ({ video: undefined, audio: undefined, ...data }));
  }

  /**
   * 获取轨道片段首帧blob地址
   * @param trackitem - 轨道项配置
   */
  async tickFirstFrameBlobUrl(trackitem: VideoTrackItem | ImageTrackItem) {
    const { video } = await this.tick(trackitem, 0);
    if (!video) return "";
    const { originWidth, originHeight } = trackitem;
    const blob = await getResizeImageBlob(video, originWidth, originHeight);
    const url = URL.createObjectURL(blob);
    video.close();
    return url;
  }

  /**
   * 复制媒体片段到新ID
   * @param id - 新轨道项的ID
   * @param oldTrackItem - 原始轨道项配置
   * @returns 返回克隆后的媒体片段，如果原始片段不存在则返回null
   */
  async copyClip(id: string | symbol, oldTrackItem: TrackItem) {
    const { id: oldId } = oldTrackItem;
    const cache = this._clipCache.get(oldId);
    if (!cache) return null;

    // 克隆响应数据和片段实例
    const cloneResponse =
      cache.response instanceof Response ? cache.response.clone() : cache.response;
    const cloneClip = await cache.clip?.clone();

    this._clipCache.set(id, {
      id: id,
      type: cache.type,
      response: cloneResponse,
      clip: cloneClip,
    });

    return cloneClip;
  }

  /**
   * 检查片段是否存在于缓存中
   * @param id - 轨道项ID
   * @returns 返回布尔值，表示该ID对应的片段是否存在且已加载
   */
  clipExists(id: string | symbol) {
    const cache = this._clipCache.get(id);
    return !!cache?.clip;
  }

  /**
   * 获取片段元数据
   * @param id - 轨道项ID
   * @returns 返回片段的元数据，如果片段不存在则返回 undefined
   */
  getClipMeta(id: string | symbol) {
    const cache = this._clipCache.get(id);
    return cache?.clip?.meta;
  }

  /**
   * 生成音频波形数据
   * @param trackitem - 轨道项配置
   * @returns 返回波形数据数组
   */
  async genWaveData(trackitem: TrackItem, fps: number) {
    const pcmData = await this.getPCMData(trackitem);
    if (!pcmData.length) return [] as number[];
    const samplesPerFrame = Math.floor(48000 / fps);
    const totalFrames = Math.floor((trackitem as AudioTrackItem | VideoTrackItem).duration * fps);
    const [chan01Buf, chan02Buf] = pcmData;
    const waveform: number[] = [];
    // 遍历每一帧，计算每一帧的音波数据
    for (let i = 0; i < totalFrames; i++) {
      const start = i * samplesPerFrame;
      const end = Math.min(start + samplesPerFrame, chan01Buf.length);
      if (start >= end) break;
      const sum =
        chan01Buf.slice(start, end).reduce((a, b) => a + b, 0) +
        chan02Buf.slice(start, end).reduce((a, b) => a + b, 0);
      const averageValue = sum / (end - start);
      waveform.push(averageValue);
    }
    return waveform;
  }

  /**
   * 获取音频数据（PCM）
   * @param trackitem - 轨道项配置（可以是音频或视频）
   * @returns 返回 PCM 音频数据数组，如果无法生成则返回空数组
   */
  async getPCMData(trackitem: TrackItem) {
    const audioClip = await this.genAudioClipFromCache(trackitem);

    if (audioClip) {
      const [chan01Buf, chan02Buf] = (audioClip as AudioClip).getPCMData();

      // video 的 clip 是临时创建的，需要释放
      if (trackitem.type === "video") audioClip.destroy();
      return [[...chan01Buf], [...chan02Buf]];
    }

    return [] as number[][];
  }

  /**
   * 生成音频片段（音频轨道直接获取，视频轨道提取音频）
   * @param trackitem - 轨道项配置
   * @param opts - 额外选项
   * @returns 返回音频片段，如果无法生成则返回 undefined
   */
  async genAudioClipFromCache(trackitem: TrackItem, opts?: Record<string, any>) {
    // 根据轨道类型选择不同的音频获取方式
    if (trackitem.type === "audio") {
      return this.createClipFromCache(trackitem, opts);
    }

    if (trackitem.type === "video") {
      return this.genAudioFromVideoCache(trackitem, opts);
    }

    return null;
  }

  /**
   * 从视频中提取音频片段
   * @param trackitem - 视频轨道项配置
   * @param opts - AudioClip 配置选项
   * @returns 返回音频片段，如果缓存不存在则返回 undefined
   */
  async genAudioFromVideoCache(trackitem: TrackItem, opts?: Record<string, any>) {
    const cache = this._clipCache.get(trackitem.id);
    if (!cache) return;

    const { response } = cache;
    if (!response) return;

    const body = (response as Response).clone().body;
    const videoAudioClip = new AudioClip(body as ReadableStream<Uint8Array>, opts);

    await videoAudioClip.ready;

    return videoAudioClip;
  }

  /**
   * 释放指定 ID 的缓存片段
   * @param id - 轨道项 ID
   */
  releaseById(id: string | symbol) {
    const cacheItem = this._clipCache.get(id);
    if (!cacheItem) return;

    cacheItem.clip && cacheItem.clip.destroy();
    this._clipCache.delete(id);
  }

  /**
   * 释放所有缓存片段
   */
  release() {
    this._clipCache.forEach((item) => {
      this.releaseById(item.id);
    });

    this._clipCache.clear();
  }
}
