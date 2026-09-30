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
    const trackitem = reactive(defineVideoTrackItemConfig());
    trackitem.source = source;

    // 解码视频获取元数据
    const clip = await this._data.webav.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    const videoMeta = clip.meta;
    trackitem.originWidth = videoMeta.width;
    trackitem.originHeight = videoMeta.height;
    trackitem.start = 0;
    trackitem.fps = this._data.timeline.ctx.fps;
    trackitem.duration = videoMeta.duration / 1e6;
    trackitem.end = videoMeta.duration / 1e6;
    trackitem.frameCount = Math.floor(this._data.timeline.ctx.fps * trackitem.duration);
    Object.assign(trackitem, opts);

    trackitem.previewListLoader = this._data.webav.getThumbnails(trackitem).then((previewList) => {
      trackitem.previewList = previewList;
      return previewList;
    });
    trackitem.audioDataLoader = this._data.webav.genWaveData(trackitem).then((audioData) => {
      trackitem.audioData = audioData;
      return audioData;
    });

    Promise.allSettled([trackitem.previewListLoader, trackitem.audioDataLoader]).then(
      () => (trackitem.loading = false),
    );

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackitem);

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
    const trackitem = reactive(defineImageTrackItemConfig());
    trackitem.source = source;

    // 解码图片获取元数据
    const clip = await this._data.webav.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    const imageMeta = clip.meta;
    trackitem.originWidth = imageMeta.width;
    trackitem.originHeight = imageMeta.height;
    trackitem.start = 0;
    trackitem.end = 5;
    Object.assign(trackitem, opts);

    trackitem.previewListLoader = this._data.webav.getThumbnails(trackitem).then((previewList) => {
      trackitem.previewList = previewList;
      trackitem.loading = false;
      return previewList;
    });

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackitem);

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
    const trackitem = reactive(defineAudioTrackItemConfig());
    trackitem.source = source;

    // 解码图片获取元数据
    const clip = await this._data.webav.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    const audioMeta = clip.meta;
    trackitem.duration = audioMeta.duration / 1e6;
    trackitem.start = 0;
    trackitem.end = audioMeta.duration / 1e6;
    Object.assign(trackitem, opts);

    trackitem.audioDataLoader = this._data.webav.genWaveData(trackitem).then((audioData) => {
      trackitem.audioData = audioData;
      trackitem.loading = false;
      return audioData;
    });

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackitem);

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
    const trackitem = reactive(defineTextTrackItemConfig());

    // 解码图片获取元数据
    const source = await renderTxt2ImgBitmap(text, "font-size: 80px; color: red;");
    const clip = await this._data.webav.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    trackitem.text = text;
    trackitem.name = text;
    trackitem.loading = false;
    trackitem.start = 0;
    trackitem.end = 5;
    Object.assign(trackitem, opts);

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackitem);

    return { object: trackitem, clip: clip as ImgClip };
  }
}
