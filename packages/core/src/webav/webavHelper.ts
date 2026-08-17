import { AudioClip, Combinator, OffscreenSprite, type ImgClip } from "@webav/av-cliper";

import type { TrackItem, TrackLine } from "@/types/trackline";
import type { MediaClip, WebavClipCacheData, WebavHelperOptions } from "@/types/webav";

import { DEFAULT_CHROMAKEY_OPTIONS } from "@/config/constant";
import { generateUUID } from "@/utils/tools";

import { WebavClipBuilder } from "./webavClipBuilder";
import { WebavThumbnailsBuilder } from "./webavThumbnailsBuilder";

/**
 * WebAV 辅助类
 * 负责管理媒体片段的缓存和创建
 */
export default class WebavHelper {
  /** 片段缓存池，用于存储已加载的媒体片段 */
  private clipCache: Map<string | Symbol, WebavClipCacheData>;
  /** WebAV 片段构建器实例 */
  private webavClipBuilder: WebavClipBuilder;
  /** WebAV 缩略图构建器实例 */
  private webavThumbnailsBuilder: WebavThumbnailsBuilder;

  /**
   * 构造函数
   * @param chromaKeyOptions - 绿幕抠像配置选项，默认使用常量配置
   */
  constructor(options: Partial<WebavHelperOptions> = {}) {
    const { chromaKeyOptions = DEFAULT_CHROMAKEY_OPTIONS } = options;
    // 初始化缓存池，用于存储已加载的媒体片段
    this.clipCache = new Map<string, WebavClipCacheData>();
    // 初始化 WebAV 片段构建器，用于创建媒体片段
    this.webavClipBuilder = new WebavClipBuilder(chromaKeyOptions);
    // 初始化 WebAV 缩略图构建器，用于生成视频缩略图
    this.webavThumbnailsBuilder = new WebavThumbnailsBuilder();
  }

  /**
   * 加载轨道片段
   * @param trackItem - 轨道项配置
   * @param source - 媒体数据源
   * @param opts - 额外选项
   * @returns 返回加载好的媒体片段
   */
  async loadClip(trackItem: TrackItem, source: string | ImageBitmap, opts?: Record<string, any>) {
    if (!trackItem.id) {
      console.warn("Track item id is missing, this will generate a new one.");
      trackItem.id = generateUUID();
    }

    const cacheClip = await this.createClipFromCache(trackItem, opts);
    if (cacheClip) return cacheClip;

    // 根据数据源类型选择加载方式
    if (source instanceof ImageBitmap) {
      return this.loadImageBitmapClip(trackItem, source, opts);
    } else {
      return this.loadUrlClip(trackItem, source, opts);
    }
  }

  /**
   * 从 ImageBitmap 加载媒体片段（图片、GIF等）
   * @param trackItem - 轨道项配置
   * @param source - ImageBitmap 图像数据
   * @param opts - 额外选项
   * @returns 返回创建的图像片段
   */
  async loadImageBitmapClip(trackItem: TrackItem, source: ImageBitmap, opts?: Record<string, any>) {
    const clip = (await this.createClip(trackItem, source, opts)) as ImgClip;

    this.clipCache.set(trackItem.id, {
      id: trackItem.id,
      type: trackItem.type,
      response: source,
      clip: clip,
    });

    return clip;
  }

  /**
   * 从 URL 加载媒体片段（视频、音频等）
   * @param trackItem - 轨道项配置
   * @param source - 资源的 URL 地址
   * @param opts - 额外选项
   * @returns 返回创建的媒体片段，如果响应无效则返回 undefined
   */
  async loadUrlClip(trackItem: TrackItem, source: string, opts?: Record<string, any>) {
    const response = await fetch(source);
    if (!response.body) return;

    const clip = await this.createClip(trackItem, response, opts);

    this.clipCache.set(trackItem.id, {
      id: trackItem.id,
      type: trackItem.type,
      response,
      // 音频片段不缓存，避免内存占用
      clip: trackItem.type == "audio" ? undefined : (clip as Exclude<MediaClip, AudioClip>),
    });

    return clip;
  }

  /**
   * 从缓存创建片段，不存在则基于响应数据创建
   * @param trackItem - 轨道项配置
   * @returns 返回缓存中的片段或新创建的片段，如果缓存不存在则返回 null
   */
  async createClipFromCache(trackItem: TrackItem, opts?: Record<string, any>) {
    const cache = this.clipCache.get(trackItem.id);

    if (!cache) return null;
    if (cache.clip) return cache.clip;

    return this.createClip(trackItem, cache.response, opts);
  }

  /**
   * 创建媒体片段
   * @param trackItem - 轨道项配置
   * @param response - 响应数据或图像位图
   * @param opts - 额外选项
   * @returns 返回创建好的媒体片段
   * @throws 当源数据类型不支持时抛出错误
   */
  async createClip(
    trackItem: TrackItem,
    response: Response | ImageBitmap,
    opts?: Record<string, any>,
  ) {
    // 提取源数据：Response 需克隆 body，ImageBitmap 直接使用
    const sourceData = response instanceof Response ? response.clone().body : response;

    if (!sourceData) {
      throw new Error("Unsupported source data type");
    }

    return this.webavClipBuilder.buildClip(sourceData, trackItem, opts);
  }

  /**
   * 获取轨道项缩略图数组
   * @param trackItem - 轨道项配置
   * @returns 返回缩略图 URL 数组的 Promise
   */
  getThumbnails(trackItem: TrackItem) {
    const cache = this.clipCache.get(trackItem.id);
    if (!cache) return Promise.resolve([] as string[]);

    if (!cache.thumbnails && cache.clip) {
      cache.thumbnails = this.webavThumbnailsBuilder.buildThumbnails(cache.clip, trackItem);
    }

    return cache.thumbnails;
  }

  /**
   * 复制媒体片段到新ID
   * @param id - 新轨道项的ID
   * @param oldTrackItem - 原始轨道项配置
   * @returns 返回克隆后的媒体片段，如果原始片段不存在则返回null
   */
  async copyClip(id: string, oldTrackItem: TrackItem) {
    const { id: oldId } = oldTrackItem;
    const cache = this.clipCache.get(oldId);
    if (!cache) return null;

    // 克隆响应数据和片段实例
    const cloneResponse =
      cache.response instanceof Response ? cache.response.clone() : cache.response;
    const cloneClip = await cache.clip?.clone();

    this.clipCache.set(id, {
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
  async clipExists(id: string) {
    const cache = this.clipCache.get(id);
    return !!cache?.clip;
  }

  /**
   * 生成音频片段（音频轨道直接获取，视频轨道提取音频）
   * @param trackItem - 轨道项配置
   * @param opts - 额外选项
   * @returns 返回音频片段，如果无法生成则返回 undefined
   */
  async genAudioClipFromCache(trackItem: TrackItem, opts?: Record<string, any>) {
    // 根据轨道类型选择不同的音频获取方式
    if (trackItem.type === "audio") {
      return this.createClipFromCache(trackItem, opts);
    }

    if (trackItem.type === "video") {
      return this.genAudioFromVideoCache(trackItem, opts);
    }

    return null;
  }

  /**
   * 从视频中提取音频片段
   * @param trackItem - 视频轨道项配置
   * @param opts - AudioClip 配置选项
   * @returns 返回音频片段，如果缓存不存在则返回 undefined
   */
  async genAudioFromVideoCache(trackItem: TrackItem, opts?: Record<string, any>) {
    const cache = this.clipCache.get(trackItem.id);
    if (!cache) return;

    const { response } = cache;
    if (!response) return;

    const body = (response as Response).clone().body;
    const videoAudioClip = new AudioClip(body as ReadableStream<Uint8Array>, opts);

    await videoAudioClip.ready;

    return videoAudioClip;
  }

  /**
   * 生成音波数据（PCM）
   * @param trackItem - 轨道项配置（可以是音频或视频）
   * @returns 返回 PCM 音频数据数组，如果无法生成则返回空数组
   */
  async genWaveData(trackItem: TrackItem) {
    const audioClip = await this.genAudioClipFromCache(trackItem);

    if (audioClip) {
      const data = (audioClip as AudioClip).getPCMData()[0];
      audioClip.destroy();
      return data;
    }

    return [];
  }

  /**
   * 合并多个轨道的音频
   * @param trackList - 轨道列表数组
   * @param fullDuration - 完整时长（秒），用于填充空白音频
   * @returns 合并后音频的 Blob URL
   */
  async getMergeAudio(trackList: TrackLine[], fullDuration: number) {
    const sourcesToRelease = [];
    const com = new Combinator();
    sourcesToRelease.push(com);

    for (let trackLine of trackList) {
      const { type, data } = trackLine;

      // 跳过非音频轨道（文本和图像）
      if (type === "text" || type === "image") continue;

      for (let trackItem of data) {
        if (trackItem.mute) continue;

        const { clipStart, start, end, volume } = trackItem;

        let clip = await this.genAudioClipFromCache(trackItem, { volume });
        if (!clip) continue;

        sourcesToRelease.push(clip);
        // 如果指定了裁剪起始点，则分割音频片段
        if (clipStart) clip = (await clip.split(clipStart * 1e6))[1];

        const audioSpr = new OffscreenSprite(clip);
        audioSpr.time = {
          offset: start * 1e6,
          duration: (end - start) * 1e6,
        };

        sourcesToRelease.push(audioSpr);
        await com.addSprite(audioSpr);
      }
    }

    // 创建空白音频确保输出时长正确
    const emptyClip = new AudioClip(
      [new Float32Array(fullDuration * 48000), new Float32Array(fullDuration * 48000)],
      { volume: 0 },
    );
    sourcesToRelease.push(emptyClip);
    await emptyClip.ready;

    const emptySpr = new OffscreenSprite(emptyClip);
    sourcesToRelease.push(emptySpr);
    await com.addSprite(emptySpr);

    const srcBlob = await new Response(com.output()).blob();

    sourcesToRelease.forEach((source) => source.destroy());

    return URL.createObjectURL(srcBlob);
  }

  /**
   * 释放指定 ID 的缓存片段
   * @param id - 轨道项 ID
   */
  releaseById(id: string | Symbol) {
    const cacheItem = this.clipCache.get(id);
    if (!cacheItem) return;

    cacheItem.clip && cacheItem.clip.destroy();
    this.clipCache.delete(id);
  }

  /**
   * 释放所有缓存片段
   */
  release() {
    this.clipCache.forEach((item) => {
      this.releaseById(item.id);
    });

    this.clipCache.clear();
  }
}
