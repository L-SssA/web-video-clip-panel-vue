import type { Ref } from "vue";

import { ref, watch } from "vue";

import type { TrackItem } from "@/types/data";
import type { DataManagerOptions, DataManagerContext } from "@/types/manager";

import { TRACKLINE_SOURCE_TYPE, PANEL_EVENT_TYPE } from "@/config/constant";
import { BaseData } from "@/data/BaseData";
import { SystemCommonData } from "@/data/SystemCommonData";
import { TimelineData } from "@/data/TimelineData";
import { TrackLineData } from "@/data/TrackLineData";
import { CursorLineService } from "@/services/CursorLineService";
import { ElEventService } from "@/services/ElEventService";
import { TrackItemService } from "@/services/TrackItemService";
import { WebavPlayService } from "@/services/WebavPlayService";
import { WebavSourceService } from "@/services/WebavSourceService";
import { timeToPixel } from "@/utils/tools";
import WebavHelper from "@/webav/WebavHelper";

export class DataManager extends BaseData {
  readonly timeline: TimelineData;
  readonly trackline: TrackLineData;
  readonly system: SystemCommonData;
  readonly theme: Ref<string>;
  readonly playState: Ref<"playing" | "loading" | "paused">;

  // webav 相关音视频解码工具
  readonly webav: WebavHelper;

  // 音视频编解码相关逻辑
  private _sourceService: WebavSourceService;
  private _playService: WebavPlayService;
  // 用户事件相关逻辑
  private _elEventService: ElEventService;
  // cursorline 相关逻辑
  private _cursorLineService: CursorLineService;
  // trackitem 相关逻辑
  private _trackitemService: TrackItemService;

  // 监听主题变化
  private _unwatchTheme: Function;

  get ctx(): DataManagerContext {
    return {
      timeline: this.timeline.ctx,
      trackline: this.trackline.ctx,
      system: this.system.ctx,
      service: {
        ...this._trackitemService.ctx,
        ...this._cursorLineService.ctx,
      },
    };
  }

  get observeList(): Ref[] {
    return [
      ...this.timeline.observeList,
      ...this.trackline.observeList,
      ...this.system.observeList,
    ];
  }

  get sourcesReady() {
    return this._sourceService.allReady;
  }

  constructor(options: Partial<DataManagerOptions> = {}) {
    super();
    // 数据处理器
    this.timeline = new TimelineData(options.timeline);
    this.trackline = new TrackLineData(options.trackline);
    this.system = new SystemCommonData(options.system);

    // 音视频解码
    this.webav = new WebavHelper(options.webav);

    // service 实例
    this._sourceService = new WebavSourceService(this);
    this._playService = new WebavPlayService(this);
    this._elEventService = new ElEventService(this);
    this._cursorLineService = new CursorLineService(this);
    this._trackitemService = new TrackItemService(this);

    this.playState = this._playService.playState;

    this.theme = ref(options.theme || "light");

    this.unwatch = watch(this.observeList, () => this.triggerUpdate(), {
      immediate: true,
    });

    this._unwatchTheme = watch(this.theme, (themeTag) => this.setTheme(themeTag), {
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
   * 添加源
   * @param type
   * @param source
   * @param opts
   */
  async addSource(type: string, source: string | File, opts: any = {}) {
    switch (type) {
      case TRACKLINE_SOURCE_TYPE.VIDEO:
        return this._sourceService.addMP4Source(source, opts);
      case TRACKLINE_SOURCE_TYPE.IMAGE:
        return this._sourceService.addImageSource(source, opts);
      case TRACKLINE_SOURCE_TYPE.AUDIO:
        return this._sourceService.addAudioSource(source, opts);
      case TRACKLINE_SOURCE_TYPE.TEXT:
        if (source instanceof File) throw new Error(`${TRACKLINE_SOURCE_TYPE.TEXT} 不支持文件输入`);
        return this._sourceService.addTextSource(source, opts);
      default:
        throw new Error(`不支持的资源类型: ${String(type)}`);
    }
  }

  /**
   *  根据 id 获取 WebavSourceLoader
   * @param id
   */
  getWebavSourceLoaderById(id: string | symbol) {
    return this._sourceService.getLoaderById(id);
  }

  /**
   * 移除 trackitem
   * @param trackitem 需要删除的 trackitem
   * @param saveSnapshot 保存快照
   */
  removeTrackitem(trackitem: TrackItem | null = this.trackline.activeTrackItem.value) {
    if (!trackitem) return;
    this.trackline.removeTrackitem(trackitem);
    if (trackitem.id === this.trackline.activeTrackItem.value?.id) {
      this.trackline.activeTrackItem.value = null;
    }
    this.trackline.saveSnapshot();
  }

  /**
   * 复制 trackitem
   * @param trackitem 要复制的 trackitem
   */
  copyTrackItem(trackitem: TrackItem | null = this.trackline.activeTrackItem.value) {
    if (!trackitem) return;
    // 如果这个片段的clip不存在，则可以判断为这个片段无效或这个片段加载未完成
    if (!this.webav.clipExists(trackitem.id)) return;

    // 复制新片段
    const newTrackItem = this.trackline.copyTrackItem(trackitem);

    // 获取 loader，一方面确定 loader 是否存在，另一方面防止 loader 未完成导致复制片段失败
    const loader = this._sourceService.copyLoaderById(newTrackItem.id, trackitem.id);
    if (!loader) return;
    // 虽然是异步函数，但不需要等待，触发这个复制操作即可
    loader.then(() => this.webav.copyClip(newTrackItem.id, trackitem));

    // 将当前 trackitem 添加到新的 trackline
    const newTrackLine = this.trackline.addToNewTrackLine(newTrackItem);
    // 将 trackline 移动到当前轨道的下方
    const targetTrackLine = this.trackline.mergeList.value.find(
      (tl) => tl.id === trackitem.parentId,
    );
    if (targetTrackLine) this.trackline.moveTrackline(newTrackLine, targetTrackLine.id, "bottom");
    this.trackline.activeTrackLine.value = newTrackLine;
    this.trackline.activeTrackItem.value = newTrackItem;
    // 保存快照
    this.trackline.saveSnapshot();
  }

  /**
   * 裁剪 trackitem
   * @param trackitem 要裁剪的 trackitem
   * @param cutTime 裁剪时间点
   */
  cutTrackItem(
    trackitem: TrackItem | null = this.trackline.activeTrackItem.value,
    cutTime: number = this.timeline.currentTime.value,
  ) {
    if (!trackitem) return;
    // 裁剪时间点要在片段之间
    if (cutTime <= trackitem.start || cutTime >= trackitem.end) return;
    // 找到父级轨道，新 trackitem 需要放到同一轨道
    const parentLine = this.trackline.mergeList.value.find((tl) => tl.id === trackitem.parentId);
    if (!parentLine) return;

    // 复制 trackitem
    const newTrackItem = this.trackline.copyTrackItem(trackitem);

    // 获取 loader，一方面确定 loader 是否存在，另一方面防止 loader 未完成导致复制片段失败
    const loader = this._sourceService.copyLoaderById(newTrackItem.id, trackitem.id);
    if (!loader) return;
    // 虽然是异步函数，但不需要等待，触发这个复制操作即可
    loader.then(() => this.webav.copyClip(newTrackItem.id, trackitem));
    this._sourceService.copyLoaderById(newTrackItem.id, trackitem.id);

    // 裁剪旧item和新item，新item放在旧item后面
    newTrackItem.start = cutTime;
    trackitem.end = cutTime;
    if (trackitem.type === "video" || trackitem.type === "audio") {
      // 有 duration 的片段，要更新 clipStart 和 clipEnd
      newTrackItem.clipStart = trackitem.clipStart + (trackitem.end - trackitem.start);
      trackitem.clipEnd = trackitem.clipEnd + (newTrackItem.end - newTrackItem.start);
    }
    parentLine.data.push(newTrackItem);
    // 保存快照
    this.trackline.saveSnapshot();
  }

  /**
   * 撤销
   */
  undo() {
    this.trackline.undo();
  }

  /**
   * 重做
   */
  redo() {
    this.trackline.redo();
  }

  /**
   * 播放轨道
   */
  play() {
    this._playService.play(this.timeline.currentTime.value);
  }

  /**
   * 暂停播放
   */
  pause() {
    this._playService.pause();
  }

  /**
   * 设置用于监听鼠标移动事件的元素
   * @param el 页面元素
   */
  setElementToListenMouseMove(el: HTMLElement | null) {
    this._elEventService.setElementToListenMouseMove(el);
  }

  /**
   * 根据标识更新数据
   */
  triggerUpdateByTag() {
    this._trackitemService.triggerUpdateByTag();
    this._cursorLineService.triggerUpdateByTag();
  }

  /**
   * 停用事件
   */
  deactiveEvents() {
    this._trackitemService.deactiveEvents();
    this._cursorLineService.deactiveEvents();
  }

  /**
   * 激活事件
   * @param eventType 事件名称
   * @param args 调用参数
   */
  activeEvent(eventType: string, ...args: any[]) {
    const activeFunc = (
      {
        [PANEL_EVENT_TYPE.CURSOR_LINE_MOVE]: this._cursorLineService.activateCursorLineMoving.bind(
          this._cursorLineService,
        ),
        [PANEL_EVENT_TYPE.TRACK_ITEM_DRAG]: this._trackitemService.activateTrackItemDraging.bind(
          this._trackitemService,
        ),
        [PANEL_EVENT_TYPE.TRACK_ITEM_RESIZE]: this._trackitemService.activateTrackItemResizing.bind(
          this._trackitemService,
        ),
      } as Record<string, Function>
    )[eventType];

    if (activeFunc) activeFunc(...args);
  }

  /**
   * 监听鼠标接近边缘
   */
  onMouseCloseEdge(func: (edgeSide: string) => void) {
    this._elEventService.onMouseCloseEdge(func);
  }

  /**
   * 释放资源
   */
  release(): void {
    // 释放 data
    this.timeline.release();
    this.trackline.release();
    // 释放 helper
    this.webav.release();
    // 释放 service 实例
    this._elEventService.release();

    this._unwatchTheme();

    super.release();
  }
}
