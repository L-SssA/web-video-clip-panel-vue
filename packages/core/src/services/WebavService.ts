// import type { AudioClip, ImgClip, MP4Clip } from "@webav/av-cliper";

import { renderTxt2ImgBitmap } from "@webav/av-cliper";
import { reactive } from "vue";

import type { AudioTrackItem, ImageTrackItem, TextTrackItem, VideoTrackItem } from "@/types/data";

import { loadAudioUrlMetadata, loadImageMetadata, loadVideoUrlMetadata } from "@/utils/tools";
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
  async addMP4Source(source: string, opts: Partial<VideoTrackItem> = {}): Promise<VideoTrackItem> {
    // 获取视频元数据
    const metadata = await loadVideoUrlMetadata(source);
    if (!metadata) throw new Error("加载资源失败");

    const { fps } = this._data.timeline.ctx;
    // 创建空的轨道数据
    const trackitem = reactive(defineVideoTrackItemConfig());
    trackitem.source = source;
    trackitem.originWidth = metadata.width;
    trackitem.originHeight = metadata.height;
    trackitem.duration = metadata.duration;
    trackitem.start = 0;
    trackitem.end = metadata.duration;
    Object.assign(trackitem, opts);

    this._data.webav
      .loadClip(trackitem, source)
      .then(() => {
        trackitem.clipReady = true;
        return Promise.allSettled([
          this._data.webav.getThumbnails(trackitem, fps).then((previewList) => {
            trackitem.previewList = previewList;
            return previewList;
          }),
          this._data.webav.genWaveData(trackitem, fps).then((audioData) => {
            trackitem.audioData = audioData;
            return audioData;
          }),
        ]);
      })
      .then(() => {
        trackitem.previewReady = true;
      });

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackitem);

    return trackitem;
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
  ): Promise<ImageTrackItem> {
    // 获取图片元数据
    const metadata = await loadImageMetadata(source);
    if (!metadata) throw new Error("加载资源失败");

    const { fps } = this._data.timeline.ctx;
    // 创建空的轨道数据
    const trackitem = reactive(defineImageTrackItemConfig());
    trackitem.source = source;
    trackitem.originWidth = metadata.width;
    trackitem.originHeight = metadata.height;
    trackitem.start = 0;
    trackitem.end = 5;
    Object.assign(trackitem, opts);

    this._data.webav
      .loadClip(trackitem, source)
      .then(() => {
        return this._data.webav.getThumbnails(trackitem, fps).then((previewList) => {
          trackitem.previewList = previewList;
          return previewList;
        });
      })
      .then(() => {
        trackitem.previewReady = true;
      });

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackitem);

    return trackitem;
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
  ): Promise<AudioTrackItem> {
    // 解码图片获取元数据
    const metadata = await loadAudioUrlMetadata(source);
    if (!metadata) throw new Error("加载资源失败");

    const { fps } = this._data.timeline.ctx;
    // 创建空的轨道数据
    const trackitem = reactive(defineAudioTrackItemConfig());
    trackitem.source = source;
    trackitem.duration = metadata.duration;
    trackitem.start = 0;
    trackitem.end = metadata.duration;
    Object.assign(trackitem, opts);

    this._data.webav
      .loadClip(trackitem, source)
      .then(() => {
        trackitem.clipReady = true;
        return this._data.webav.genWaveData(trackitem, fps).then((audioData) => {
          trackitem.audioData = audioData;
          return audioData;
        });
      })
      .then(() => {
        trackitem.previewReady = true;
      });

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackitem);

    return trackitem;
  }

  /**
   * 添加文本
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  async addTextSource(text: string, opts: Partial<TextTrackItem> = {}): Promise<TextTrackItem> {
    // 解码图片获取元数据
    const source = await renderTxt2ImgBitmap(text, opts.style || "font-size: 16px; color: black;");
    const metadata = await loadImageMetadata(source);
    if (!metadata) throw new Error("加载资源失败");

    // 创建空的轨道数据
    const trackitem = reactive(defineTextTrackItemConfig());

    trackitem.text = text;
    trackitem.name = text;
    trackitem.start = 0;
    trackitem.end = 5;
    Object.assign(trackitem, opts);

    this._data.webav.loadClip(trackitem, source).then(() => {
      trackitem.clipReady = true;
      trackitem.previewReady = true;
    });

    // 添加轨道数据
    this._data.trackline.addToTrackLine(trackitem);

    return trackitem;
  }
}
