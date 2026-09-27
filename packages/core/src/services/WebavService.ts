import type { AudioClip, ImgClip, MP4Clip } from "@webav/av-cliper";

import { renderTxt2ImgBitmap } from "@webav/av-cliper";
import { reactive } from "vue";

import type { AudioTrackItem, ImageTrackItem, TextTrackItem, VideoTrackItem } from "@/types/data";

import {
  defineAudioTrackItemConfig,
  defineImageTrackItemConfig,
  defineTextTrackItemConfig,
  defineVideoTrackItemConfig,
} from "@/utils/trackline";

import { BaseService } from "./BaseService";

export class WebavService extends BaseService {
  /**
   * 添加MP4源
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  async addMP4Source(
    source: string,
    opts: Partial<VideoTrackItem> = {},
  ): Promise<{ object: VideoTrackItem; clip: MP4Clip }> {
    // 创建空的轨道数据
    const trackItem = reactive(defineVideoTrackItemConfig());
    trackItem.source = source;

    // 解码视频获取元数据
    const clip = await this._data.webav.loadClip(trackItem, source);
    if (!clip) throw new Error("加载资源失败");
    const videoMeta = clip.meta;
    trackItem.originWidth = videoMeta.width;
    trackItem.originHeight = videoMeta.height;
    trackItem.start = 0;
    trackItem.fps = this._data.timeline.ctx.fps;
    trackItem.duration = videoMeta.duration / 1e6;
    trackItem.end = videoMeta.duration / 1e6;
    trackItem.frameCount = Math.floor(this._data.timeline.ctx.fps * trackItem.duration);
    Object.assign(trackItem, opts);

    trackItem.previewListLoader = this._data.webav.getThumbnails(trackItem).then((previewList) => {
      trackItem.previewList = previewList;
      return previewList;
    });
    trackItem.audioDataLoader = this._data.webav.genWaveData(trackItem).then((audioData) => {
      trackItem.audioData = audioData;
      return audioData;
    });

    Promise.allSettled([trackItem.previewListLoader, trackItem.audioDataLoader]).then(
      () => (trackItem.loading = false),
    );

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackItem);

    return { object: trackItem, clip: clip as MP4Clip };
  }

  /**
   * 添加图片资源
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  // 添加图片资源
  async addImageSource(
    source: string,
    opts: Partial<ImageTrackItem> = {},
  ): Promise<{ object: ImageTrackItem; clip: ImgClip }> {
    // 创建空的轨道数据
    const trackItem = reactive(defineImageTrackItemConfig());
    trackItem.source = source;

    // 解码图片获取元数据
    const clip = await this._data.webav.loadClip(trackItem, source);
    if (!clip) throw new Error("加载资源失败");
    const imageMeta = clip.meta;
    trackItem.originWidth = imageMeta.width;
    trackItem.originHeight = imageMeta.height;
    trackItem.start = 0;
    trackItem.end = 5;
    Object.assign(trackItem, opts);

    trackItem.previewListLoader = this._data.webav.getThumbnails(trackItem).then((previewList) => {
      trackItem.previewList = previewList;
      trackItem.loading = false;
      return previewList;
    });

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackItem);

    return { object: trackItem, clip: clip as ImgClip };
  }

  /**
   * 添加音频资源
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  async addAudioSource(
    source: string,
    opts: Partial<AudioTrackItem> = {},
  ): Promise<{ object: AudioTrackItem; clip: AudioClip }> {
    // 创建空的轨道数据
    const trackItem = reactive(defineAudioTrackItemConfig());
    trackItem.source = source;

    // 解码图片获取元数据
    const clip = await this._data.webav.loadClip(trackItem, source);
    if (!clip) throw new Error("加载资源失败");
    const audioMeta = clip.meta;
    trackItem.duration = audioMeta.duration / 1e6;
    trackItem.start = 0;
    trackItem.end = audioMeta.duration / 1e6;
    Object.assign(trackItem, opts);

    trackItem.audioDataLoader = this._data.webav.genWaveData(trackItem).then((audioData) => {
      trackItem.audioData = audioData;
      trackItem.loading = false;
      return audioData;
    });

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackItem);

    return { object: trackItem, clip: clip as AudioClip };
  }

  /**
   * 添加文本
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  async addTextSource(
    text: string,
    opts: Partial<TextTrackItem> = {},
  ): Promise<{ object: TextTrackItem; clip: ImgClip }> {
    // 创建空的轨道数据
    const trackItem = reactive(defineTextTrackItemConfig());

    // 解码图片获取元数据
    const source = await renderTxt2ImgBitmap(text, "font-size: 80px; color: red;");
    const clip = await this._data.webav.loadClip(trackItem, source);
    if (!clip) throw new Error("加载资源失败");
    trackItem.text = text;
    trackItem.name = text;
    trackItem.loading = false;
    trackItem.start = 0;
    trackItem.end = 5;
    Object.assign(trackItem, opts);

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackItem);

    return { object: trackItem, clip: clip as ImgClip };
  }
}
