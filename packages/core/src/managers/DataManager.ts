import type { AudioClip, ImgClip, MP4Clip } from "@webav/av-cliper";
import type { Ref } from "vue";

import { renderTxt2ImgBitmap } from "@webav/av-cliper";
import { watch } from "vue";

import type { DataManagerOptions, DataManagerContext } from "@/types/data";
import type {
  AudioTrackItem,
  ImageTrackItem,
  TextTrackItem,
  VideoTrackItem,
} from "@/types/trackline";

import { TRACKLINE_SOURCE_TYPE } from "@/config/constant";
import { BaseData } from "@/data/BaseData";
import { TimelineData } from "@/data/TimelineData";
import { TrackLineData } from "@/data/TrackLineData";
import { timeToPixel } from "@/utils/tools";
import {
  defineAudioTrackItemConfig,
  defineImageTrackItemConfig,
  defineTextTrackItemConfig,
  defineVideoTrackItemConfig,
} from "@/utils/trackline";
import WebavHelper from "@/webav/webavHelper";

export class DataManager extends BaseData {
  timeline: TimelineData;
  trackline: TrackLineData;
  unwatch: Function;

  // webav 相关音视频解码工具
  private webavHelper: WebavHelper;

  get ctx(): DataManagerContext {
    return {
      timeline: this.timeline.ctx,
      trackline: this.trackline.ctx,
    };
  }

  get observeList(): Ref[] {
    return [...this.timeline.observeList, ...this.trackline.observeList];
  }

  constructor(options: Partial<DataManagerOptions> = {}) {
    super();
    // 数据处理器
    this.timeline = new TimelineData(options.timeline);
    this.trackline = new TrackLineData(options.trackline);
    // 音视频解码
    this.webavHelper = new WebavHelper(options.webav);

    this.unwatch = watch(this.observeList, () => {
      this.updateEvent.triggerEvent(this.ctx);
    });
  }

  /**
   * 根据像素设置当前时间
   * @param pixel
   */
  setCurrentTimeByPixel(pixel: number) {
    const maxTime = this.trackline.getLongestTracklineSecond();
    const { fps, framesPerGap, gapWidth } = this.timeline.ctx;
    const maxPixel = timeToPixel(maxTime, fps, framesPerGap, gapWidth);
    if (pixel > maxPixel) pixel = maxPixel;
    this.timeline.setCurrentTimeByPixel(pixel);
  }

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
    const trackitem = defineVideoTrackItemConfig();
    trackitem.source = source;

    // 解码视频获取元数据
    const clip = await this.webavHelper.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    const videoMeta = clip.meta;
    trackitem.originWidth = videoMeta.width;
    trackitem.originHeight = videoMeta.height;
    trackitem.start = 0;
    trackitem.fps = this.timeline.ctx.fps;
    trackitem.duration = videoMeta.duration / 1e6;
    trackitem.end = videoMeta.duration / 1e6;
    trackitem.frameCount = Math.floor(this.timeline.ctx.fps * trackitem.duration);
    Object.assign(trackitem, opts);

    trackitem.previewListLoader = this.webavHelper.getThumbnails(trackitem).then((previewList) => {
      trackitem.previewList = previewList;
      return previewList;
    });
    trackitem.audioDataLoader = this.webavHelper.genWaveData(trackitem).then((audioData) => {
      trackitem.audioData = audioData;
      return audioData;
    });

    // 添加轨道数据
    this.trackline.addToTrackLine(trackitem);

    return { object: trackitem, clip: clip as MP4Clip };
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
    const trackitem = defineImageTrackItemConfig();
    trackitem.source = source;

    // 解码图片获取元数据
    const clip = await this.webavHelper.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    const imageMeta = clip.meta;
    trackitem.originWidth = imageMeta.width;
    trackitem.originHeight = imageMeta.height;
    trackitem.start = 0;
    trackitem.end = 5;
    Object.assign(trackitem, opts);

    trackitem.previewListLoader = this.webavHelper.getThumbnails(trackitem).then((previewList) => {
      trackitem.previewList = previewList;
      return previewList;
    });

    // 添加轨道数据
    this.trackline.addToTrackLine(trackitem);

    return { object: trackitem, clip: clip as ImgClip };
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
    const trackitem = defineAudioTrackItemConfig();
    trackitem.source = source;

    // 解码图片获取元数据
    const clip = await this.webavHelper.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    const audioMeta = clip.meta;
    trackitem.duration = audioMeta.duration / 1e6;
    trackitem.start = 0;
    trackitem.end = audioMeta.duration / 1e6;
    Object.assign(trackitem, opts);

    trackitem.audioDataLoader = this.webavHelper.genWaveData(trackitem).then((audioData) => {
      trackitem.audioData = audioData;
      return audioData;
    });

    // 添加轨道数据
    this.trackline.addToTrackLine(trackitem);

    return { object: trackitem, clip: clip as AudioClip };
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
    const trackitem = defineTextTrackItemConfig();

    // 解码图片获取元数据
    const source = await renderTxt2ImgBitmap(text, "font-size: 80px; color: red;");
    const clip = await this.webavHelper.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    trackitem.text = text;
    trackitem.name = text;
    trackitem.loading = false;
    trackitem.start = 0;
    trackitem.end = 5;
    Object.assign(trackitem, opts);

    // 添加轨道数据
    this.trackline.addToTrackLine(trackitem);

    return { object: trackitem, clip: clip as ImgClip };
  }

  /**
   * 添加源
   * @param type
   * @param source
   * @param opts
   */
  async addSource(type: string, source: string, opts: any = {}) {
    const processor = {
      [TRACKLINE_SOURCE_TYPE.VIDEO]: this.addMP4Source,
      [TRACKLINE_SOURCE_TYPE.IMAGE]: this.addImageSource,
      [TRACKLINE_SOURCE_TYPE.AUDIO]: this.addAudioSource,
      [TRACKLINE_SOURCE_TYPE.TEXT]: this.addTextSource,
    }[type];

    if (processor) return await processor.bind(this)(source, opts);
    throw new Error(`Invalid source type: ${String(type)}`);
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unwatch();
    this.timeline.release();
    this.trackline.release();
    this.webavHelper.release();
    super.release();
  }
}
