import type { Ref } from "vue";

import { watch } from "vue";

import type { DataManagerOptions, DataManagerContext } from "@/types/manager";

import { TRACKLINE_SOURCE_TYPE, PANEL_EVENT_TYPE } from "@/config/constant";
import { BaseData } from "@/data/BaseData";
import { SystemCommonData } from "@/data/SystemCommonData";
import { TimelineData } from "@/data/TimelineData";
import { TrackLineData } from "@/data/TrackLineData";
import { CursorLineService } from "@/services/CursorLineService";
import { ElEventService } from "@/services/ElEventService";
import { TrackItemService } from "@/services/TrackItemService";
import { WebavService } from "@/services/WebavService.ts";
import { timeToPixel } from "@/utils/tools";
import WebavHelper from "@/webav/webavHelper";

export class DataManager extends BaseData {
  public timeline: TimelineData;
  public trackline: TrackLineData;
  public system: SystemCommonData;
  public unwatch: Function;

  // webav 相关音视频解码工具
  public webav: WebavHelper;

  // webav 相关逻辑
  private webavService: WebavService;
  // 用户事件相关逻辑
  private elEventService: ElEventService;
  // cursorline 相关逻辑
  private cursorLineService: CursorLineService;
  // trackitem 相关逻辑
  private trackitemService: TrackItemService;

  get ctx(): DataManagerContext {
    return {
      timeline: this.timeline.ctx,
      trackline: this.trackline.ctx,
      system: this.system.ctx,
      service: {
        ...this.trackitemService.ctx,
        ...this.cursorLineService.ctx,
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

  constructor(options: Partial<DataManagerOptions> = {}) {
    super();
    // 数据处理器
    this.timeline = new TimelineData(options.timeline);
    this.trackline = new TrackLineData(options.trackline);
    this.system = new SystemCommonData(options.system);
    // 音视频解码
    this.webav = new WebavHelper(options.webav);

    // service 实例
    this.webavService = new WebavService(this);
    this.elEventService = new ElEventService(this);
    this.cursorLineService = new CursorLineService(this);
    this.trackitemService = new TrackItemService(this);

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
  async addSource(type: string, source: string, opts: any = {}) {
    const processor = {
      [TRACKLINE_SOURCE_TYPE.VIDEO]: this.webavService.addMP4Source.bind(this.webavService),
      [TRACKLINE_SOURCE_TYPE.IMAGE]: this.webavService.addImageSource.bind(this.webavService),
      [TRACKLINE_SOURCE_TYPE.AUDIO]: this.webavService.addAudioSource.bind(this.webavService),
      [TRACKLINE_SOURCE_TYPE.TEXT]: this.webavService.addTextSource.bind(this.webavService),
    }[type];

    if (processor) return await processor(source, opts);
    throw new Error(`Invalid source type: ${String(type)}`);
  }

  /**
   * 设置用于监听鼠标移动事件的元素
   * @param el 页面元素
   */
  setElementToListenMouseMove(el: HTMLElement | null) {
    this.elEventService.setElementToListenMouseMove(el);
  }

  /**
   * 根据标识更新数据
   */
  triggerUpdateByTag() {
    this.trackitemService.triggerUpdateByTag();
    this.cursorLineService.triggerUpdateByTag();
  }

  /**
   * 停用事件
   */
  deactiveEvents() {
    this.trackitemService.deactiveEvents();
    this.cursorLineService.deactiveEvents();
  }

  /**
   * 激活事件
   * @param eventType 事件名称
   * @param args 调用参数
   */
  activeEvent(eventType: string, ...args: any[]) {
    const activeFunc = (
      {
        [PANEL_EVENT_TYPE.CURSOR_LINE_MOVE]: this.cursorLineService.activateCursorLineMoving.bind(
          this.cursorLineService,
        ),
        [PANEL_EVENT_TYPE.TRACK_ITEM_DRAG]: this.trackitemService.activateTrackItemDraging.bind(
          this.trackitemService,
        ),
        [PANEL_EVENT_TYPE.TRACK_ITEM_RESIZE]: this.trackitemService.activateTrackItemResizing.bind(
          this.trackitemService,
        ),
      } as Record<string, Function>
    )[eventType];

    if (activeFunc) activeFunc(...args);
  }

  /**
   * 监听鼠标接近边缘
   */
  onMouseCloseEdge(func: (edgeSide: string) => void) {
    this.elEventService.onMouseCloseEdge(func);
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unwatch();
    // 释放 data
    this.timeline.release();
    this.trackline.release();
    // 释放 helper
    this.webav.release();
    // 释放 service 实例
    this.elEventService.release();

    super.release();
  }
}
