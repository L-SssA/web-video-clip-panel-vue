import type { AudioClip, ImgClip, MP4Clip } from "@webav/av-cliper";
import type { Ref } from "vue";

import { renderTxt2ImgBitmap } from "@webav/av-cliper";
import { reactive, watch } from "vue";

import type { AudioTrackItem, ImageTrackItem, TextTrackItem, VideoTrackItem } from "@/types/data";
import type { DataManagerOptions, DataManagerContext } from "@/types/manager";

import { TRACKLINE_SOURCE_TYPE } from "@/config/constant";
import { BaseData } from "@/data/BaseData";
import { SystemCommonData } from "@/data/SystemCommonData";
import { TimelineData } from "@/data/TimelineData";
import { TrackLineData } from "@/data/TrackLineData";
import { pixelToTime, timeToPixel } from "@/utils/tools";
import {
  defineAudioTrackItemConfig,
  defineImageTrackItemConfig,
  defineTextTrackItemConfig,
  defineVideoTrackItemConfig,
} from "@/utils/trackline";
import WebavHelper from "@/webav/webavHelper";

export class DataManager extends BaseData {
  public timeline: TimelineData;
  public trackline: TrackLineData;
  public system: SystemCommonData;
  public unwatch: Function;

  // 事件标识
  private cursorMoving: boolean = false;
  private markX: number = 0;
  private markScrollOffset: number = 0;
  private markTrackitemData = {
    start: 0,
    end: 0,
    clipStart: 0,
    clipEnd: 0,
  };
  private trackitemDraging: boolean = false;
  private trackitemResing: boolean = false;
  private trackitemResizeSideTag: string = "";

  // webav 相关音视频解码工具
  private webav: WebavHelper;

  get ctx(): DataManagerContext {
    return {
      timeline: this.timeline.ctx,
      trackline: this.trackline.ctx,
      system: this.system.ctx,
    };
  }

  get observeList(): Ref[] {
    return [
      ...this.timeline.observeList,
      ...this.trackline.observeList,
      ...this.system.observeList,
    ];
  }

  constructor(options: Partial<DataManagerOptions> = {}) {
    super();
    // 数据处理器
    this.timeline = new TimelineData(options.timeline);
    this.trackline = new TrackLineData(options.trackline);
    this.system = new SystemCommonData(options.system);
    // 音视频解码
    this.webav = new WebavHelper(options.webav);

    this.unwatch = watch(this.observeList, () => this.triggerUpdate(), {
      immediate: true,
    });
  }

  /**
   * 触发数据更新（全量）
   */
  triggerUpdate() {
    super.triggerUpdate();
    this.timeline.triggerUpdate();
    this.trackline.triggerUpdate();
    this.system.triggerUpdate();
  }

  /**
   * 根据标识更新数据
   */
  triggerUpdateByTag() {
    // 处理游标线移动
    if (this.cursorMoving && this.system.mouseEvent) {
      const movedX = this.system.mouseEvent.clientX;
      this.setCurrentTimeByPixel(movedX);
    }
    // trackitem 拖拽移动
    if (this.trackitemDraging && this.system.mouseEvent) {
      const movedX = this.system.mouseEvent.clientX;
      this.moveTrackItemByPixel(movedX);
    }
    // trackitem 缩放移动
    if (this.trackitemResing && this.system.mouseEvent) {
      const movedX = this.system.mouseEvent.clientX;
      this.resizeTrackItemByPixel(movedX);
    }
  }

  /**
   * 清理事件标识
   */
  clearEventTag() {
    this.cursorMoving = false;
    this.markX = 0;
    this.markTrackitemData = {
      start: 0,
      end: 0,
      clipStart: 0,
      clipEnd: 0,
    };
    this.trackitemDraging = false;
    this.trackitemResing = false;
    this.trackitemResizeSideTag = "";
  }

  /**
   * 激活游标线移动
   */
  activateCursorLineMoving() {
    this.cursorMoving = true;
  }

  /**
   * 激活 trackitem 拖拽事件
   */
  activateTrackItemDraging() {
    if (this.invalidTrackItemMouseAction()) return;
    if (!this.saveStatusBeforeAction()) return;
    this.trackitemDraging = true;
  }

  /**
   * 激活 trackitem 缩放事件
   * @param side: start | end 缩放的位置
   */
  activateTrackItemResizing(sideTag: string) {
    if (this.invalidTrackItemMouseAction()) return;
    if (!this.saveStatusBeforeAction()) return;
    this.trackitemResing = true;
    this.trackitemResizeSideTag = sideTag;
  }

  /**
   * trackitem 鼠标移动操作的无效校验
   */
  invalidTrackItemMouseAction() {
    return (
      !this.system.mouseEvent ||
      !this.trackline.activeTrackItem.value ||
      !this.trackline.activeTrackItem.value.changeable
    );
  }

  /**
   * 保存操作前的状态
   */
  saveStatusBeforeAction() {
    if (!this.system.mouseEvent || !this.trackline.activeTrackItem.value) return false;
    this.markX = this.system.mouseEvent.clientX;
    this.markScrollOffset = this.timeline.ctx.scrollOffset;
    // 保存必要的 trackitem 数据
    const { start, end, clipStart, clipEnd } = this.trackline.activeTrackItem.value;
    Object.assign(this.markTrackitemData, { start, end, clipStart, clipEnd });
    return true;
  }

  /**
   * 设置主题
   * @param themeTag
   */
  setTheme(themeTag: string) {
    this.timeline.setTheme(themeTag);
    this.trackline.setTheme(themeTag);
    this.system.setTheme(themeTag);
  }

  /**
   * 根据像素设置当前时间
   * @param pixel
   */
  setCurrentTimeByPixel(pixel: number) {
    const maxTime = this.trackline.getLongestTracklineSecond();
    const { fps, framesPerGap, gapWidth, marginLeft } = this.timeline.ctx;
    const minPixel = marginLeft;
    const maxPixel = timeToPixel(maxTime, fps, framesPerGap, gapWidth) + marginLeft;
    if (pixel > maxPixel) pixel = maxPixel;
    if (pixel < minPixel) pixel = minPixel;
    this.timeline.setCurrentTimeByPixel(pixel);
  }

  /**
   * 根据像素移动 trackitem
   * @param pixelX 移动的 x 像素
   */
  moveTrackItemByPixel(pixelX: number) {
    if (!this.trackline.activeTrackItem.value) return;

    // 计算移动像素转换为秒数
    let offsetSeconds = this.calcOffsetSeconds(pixelX);

    // 移动 trackitem
    const { start, end } = this.markTrackitemData;
    if (start + offsetSeconds < 0) offsetSeconds = -start; // 0 边界
    this.trackline.activeTrackItem.value.start = start + offsetSeconds;
    this.trackline.activeTrackItem.value.end = end + offsetSeconds;
  }

  /**
   * 根据像素缩放 trackitem
   * @param pixelX 移动的 x 像素
   */
  resizeTrackItemByPixel(pixelX: number) {
    if (!this.trackline.activeTrackItem.value) return;

    // 计算移动像素转换为秒数
    let offsetSeconds = this.calcOffsetSeconds(pixelX);

    // 缩放 trackitem
    const { start, end, clipStart, clipEnd } = this.markTrackitemData;
    const { type } = this.trackline.activeTrackItem.value;
    const { gapWidth, fps, framesPerGap } = this.timeline.ctx;

    const oneGapEqualToSeconds = pixelToTime(gapWidth, fps, framesPerGap, gapWidth);

    if (this.trackitemResizeSideTag === "start") {
      // 缩放片段左侧
      // 1. 左侧边界:0, 右侧边界:end-[时间线一格宽度]
      // 2. 片段为[视频]或[音频]片段时, 考虑剪辑边界 clipStart 必须 >= 0
      if (start + offsetSeconds < 0) offsetSeconds = -start; // 左侧边界
      if (start + offsetSeconds > end - oneGapEqualToSeconds)
        offsetSeconds = end - oneGapEqualToSeconds - start; // 右侧边界
      if (["video", "audio"].includes(type)) {
        if (clipStart + offsetSeconds < 0) offsetSeconds = -clipStart; // 视频和音频片段的裁剪边界
        this.trackline.activeTrackItem.value.clipStart = clipStart + offsetSeconds;
      }
      this.trackline.activeTrackItem.value.start = start + offsetSeconds;
    } else if (this.trackitemResizeSideTag === "end") {
      // 缩放片段右侧
      // 1. 左侧边界:start+[时间线一格宽度], 右侧边界:分类讨论
      // 2. 片段为[视频]或[音频]片段时, 考虑剪辑边界 clipEnd 必须 >= 0
      if (end + offsetSeconds < start + oneGapEqualToSeconds)
        offsetSeconds = start + oneGapEqualToSeconds - end; // 左侧边界
      if (["video", "audio"].includes(type)) {
        if (clipEnd - offsetSeconds < 0) offsetSeconds = clipEnd; // 视频和音频片段的裁剪边界
        this.trackline.activeTrackItem.value.clipEnd = clipEnd - offsetSeconds;
      }
      this.trackline.activeTrackItem.value.end = end + offsetSeconds;
    }
  }

  /**
   * 根据移动的像素计算等价的秒数
   * @param pixelX 移动的像素
   * @returns 等价的秒数
   */
  calcOffsetSeconds(pixelX: number) {
    // 移动 pixel
    const offsetX = pixelX - this.markX;
    // 移动中的滚动
    const offsetScroll = this.timeline.ctx.scrollOffset - this.markScrollOffset;
    // 移动的 pixel 转换为时间
    const { fps, framesPerGap, gapWidth } = this.timeline.ctx;
    let offsetSeconds = pixelToTime(offsetX + offsetScroll, fps, framesPerGap, gapWidth);
    return offsetSeconds;
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
    const trackitem = reactive(defineVideoTrackItemConfig());
    trackitem.source = source;

    // 解码视频获取元数据
    const clip = await this.webav.loadClip(trackitem, source);
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

    trackitem.previewListLoader = this.webav.getThumbnails(trackitem).then((previewList) => {
      trackitem.previewList = previewList;
      return previewList;
    });
    trackitem.audioDataLoader = this.webav.genWaveData(trackitem).then((audioData) => {
      trackitem.audioData = audioData;
      return audioData;
    });

    Promise.allSettled([trackitem.previewListLoader, trackitem.audioDataLoader]).then(
      () => (trackitem.loading = false),
    );

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
    const trackitem = reactive(defineImageTrackItemConfig());
    trackitem.source = source;

    // 解码图片获取元数据
    const clip = await this.webav.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    const imageMeta = clip.meta;
    trackitem.originWidth = imageMeta.width;
    trackitem.originHeight = imageMeta.height;
    trackitem.start = 0;
    trackitem.end = 5;
    Object.assign(trackitem, opts);

    trackitem.previewListLoader = this.webav.getThumbnails(trackitem).then((previewList) => {
      trackitem.previewList = previewList;
      trackitem.loading = false;
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
    const trackitem = reactive(defineAudioTrackItemConfig());
    trackitem.source = source;

    // 解码图片获取元数据
    const clip = await this.webav.loadClip(trackitem, source);
    if (!clip) throw new Error("加载资源失败");
    const audioMeta = clip.meta;
    trackitem.duration = audioMeta.duration / 1e6;
    trackitem.start = 0;
    trackitem.end = audioMeta.duration / 1e6;
    Object.assign(trackitem, opts);

    trackitem.audioDataLoader = this.webav.genWaveData(trackitem).then((audioData) => {
      trackitem.audioData = audioData;
      trackitem.loading = false;
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
    const trackitem = reactive(defineTextTrackItemConfig());

    // 解码图片获取元数据
    const source = await renderTxt2ImgBitmap(text, "font-size: 80px; color: red;");
    const clip = await this.webav.loadClip(trackitem, source);
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
    this.webav.release();
    super.release();
  }
}
