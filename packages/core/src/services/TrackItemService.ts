import type { TrackItem } from "@/types/data";
import type { MarkedTrackItemData } from "@/types/manager";

import { isNumberInside, pixelToTime } from "@/utils/tools";

import { BaseService } from "./BaseService";

export class TrackItemService extends BaseService {
  private markedX: number = 0;
  private markedScrollOffset: number = 0;
  private markedTrackItemData: MarkedTrackItemData = {
    start: 0,
    end: 0,
    clipStart: 0,
    clipEnd: 0,
  };
  private prevTrackItemData: MarkedTrackItemData | null = null;
  private nextTrackItemData: MarkedTrackItemData | null = null;
  private trackItemDraging: boolean = false;
  private trackItemResing: boolean = false;
  private trackItemResizeSideTag: string = "";

  /**
   * trackItem 鼠标移动操作的无效校验
   */
  invalidTrackItemMouseAction() {
    return (
      !this._data.system.mouseEvent ||
      !this._data.trackline.activeTrackItem.value ||
      !this._data.trackline.activeTrackItem.value.changeable
    );
  }

  /**
   * 保存操作前的状态
   */
  saveTrackItemStatus() {
    if (
      !this._data.system.mouseEvent ||
      !this._data.trackline.activeTrackItem.value ||
      !this._data.trackline.activeTrackLine.value
    )
      return false;
    try {
      this.markedX = this._data.system.mouseEvent.clientX;
      this.markedScrollOffset = this._data.timeline.ctx.scrollOffset;
      // 保存必要的 trackItem 数据
      const { start, end, clipStart, clipEnd } = this._data.trackline.activeTrackItem.value;
      Object.assign(this.markedTrackItemData, { start, end, clipStart, clipEnd });
      // 保存 activeTrackItem 前后的 item
      const activeTrackLine = this._data.trackline.activeTrackLine.value;
      const { prevTrackItem, nextTrackItem } = activeTrackLine.data.reduce<{
        prevTrackItem: TrackItem | null;
        nextTrackItem: TrackItem | null;
      }>(
        ({ prevTrackItem, nextTrackItem }, t) => {
          if (t.end <= start && (prevTrackItem == null || t.end > prevTrackItem.end))
            prevTrackItem = t;
          if (t.start >= end && (nextTrackItem == null || t.start < nextTrackItem.start))
            nextTrackItem = t;
          return { prevTrackItem, nextTrackItem };
        },
        { prevTrackItem: null, nextTrackItem: null },
      );
      if (prevTrackItem) {
        const { start, end, clipStart, clipEnd } = prevTrackItem;
        this.prevTrackItemData = { start, end, clipStart, clipEnd };
      }
      if (nextTrackItem) {
        const { start, end, clipStart, clipEnd } = nextTrackItem;
        this.nextTrackItemData = { start, end, clipStart, clipEnd };
      }
      return true;
    } catch (e) {
      console.warn(`saveStatusBeforeAction 出现异常: ${e}`);
      return false;
    }
  }

  /**
   * 根据标识更新数据
   */
  triggerUpdateByTag() {
    // trackItem 拖拽移动
    if (this.trackItemDraging && this._data.system.mouseEvent) {
      const movedX = this._data.system.mouseEvent.clientX;
      this.moveTrackItemByPixel(movedX);
    }
    // trackItem 缩放移动
    if (this.trackItemResing && this._data.system.mouseEvent) {
      const movedX = this._data.system.mouseEvent.clientX;
      this.resizeTrackItemByPixel(movedX);
    }
  }

  /**
   * 停用事件
   */
  deactiveEvents() {
    this.deactivateTrackItemDraging();
    this.deactivateTrackItemResizing();
  }

  /**
   * 清理事件标识
   */
  resetMarks() {
    this.markedX = 0;
    this.markedTrackItemData = {
      start: 0,
      end: 0,
      clipStart: 0,
      clipEnd: 0,
    };
    this.prevTrackItemData = null;
    this.nextTrackItemData = null;
  }

  /**
   * 激活 trackItem 拖拽事件
   */
  activateTrackItemDraging() {
    if (this.invalidTrackItemMouseAction()) return;
    if (!this.saveTrackItemStatus()) return;
    this.trackItemDraging = true;
    this._data.trackline.activeTrackItem.value!.ghost = true;
  }

  /**
   * 停用 trackItem 拖拽事件
   */
  deactivateTrackItemDraging() {
    this.trackItemDraging = false;
    this._data.trackline.draggingOverlap.value = false;
    const activeTrackItem = this._data.trackline.activeTrackItem;
    if (activeTrackItem.value) activeTrackItem.value.ghost = false;
    this.resetMarks();
  }

  /**
   * 激活 trackItem 缩放事件
   * @param side: start | end 缩放的位置
   */
  activateTrackItemResizing(sideTag: string) {
    if (this.invalidTrackItemMouseAction()) return;
    if (!this.saveTrackItemStatus()) return;
    this.trackItemResing = true;
    this.trackItemResizeSideTag = sideTag;
  }

  /**
   * 停用 trackItem 缩放事件
   */
  deactivateTrackItemResizing() {
    this.trackItemResing = false;
    this.trackItemResizeSideTag = "";
    this.resetMarks();
  }

  /**
   * 根据像素移动 trackItem
   * @param pixelX 移动的 x 像素
   */
  moveTrackItemByPixel(pixelX: number) {
    if (!this._data.trackline.activeTrackItem.value) return;

    // 计算移动像素转换为秒数
    let offsetSeconds = this.calcOffsetSeconds(pixelX);

    const { start, end } = this.markedTrackItemData;
    // 0 边界
    if (start + offsetSeconds < 0) offsetSeconds = -start;

    const movedStart = start + offsetSeconds;
    const movedEnd = end + offsetSeconds;

    // 如果该 activeTrackItem 与其他 trackItem 重叠，则标记为重叠
    this._data.trackline.draggingOverlap.value = Boolean(
      this._data.trackline.activeTrackLine.value?.data.some(
        (t) =>
          this._data.trackline.activeTrackItem.value?.id !== t.id &&
          // t.start <= movedStart < t.end
          (isNumberInside(movedStart, t.start, t.end) ||
            movedStart == t.start ||
            // t.start < movedEnd <= t.end
            isNumberInside(movedEnd, t.start, t.end) ||
            movedEnd == t.end),
      ),
    );

    // 移动 trackItem
    this._data.trackline.activeTrackItem.value.start = movedStart;
    this._data.trackline.activeTrackItem.value.end = movedEnd;
  }

  /**
   * 根据像素缩放 trackItem
   * @param pixelX 移动的 x 像素
   */
  resizeTrackItemByPixel(pixelX: number) {
    if (!this._data.trackline.activeTrackItem.value) return;

    // 计算移动像素转换为秒数
    let offsetSeconds = this.calcOffsetSeconds(pixelX);

    // 缩放 trackItem
    const { start, end, clipStart, clipEnd } = this.markedTrackItemData;
    const { type } = this._data.trackline.activeTrackItem.value;
    const { gapWidth, fps, framesPerGap } = this._data.timeline.ctx;

    const oneGapEqualToSeconds = pixelToTime(gapWidth, fps, framesPerGap, gapWidth);

    if (this.trackItemResizeSideTag === "start") {
      // 缩放片段左侧
      // 1. 左侧边界:0,左侧片段的end; 右侧边界:end-[时间线一格宽度],右侧片段的start
      // 2. 片段为[视频]或[音频]片段时, 考虑剪辑边界 clipStart 必须 >= 0

      // 左侧边界
      if (start + offsetSeconds < 0) offsetSeconds = -start;
      if (this.prevTrackItemData && start + offsetSeconds < this.prevTrackItemData.end) {
        offsetSeconds = this.prevTrackItemData.end - start;
      }

      // 右侧边界
      if (start + offsetSeconds > end - oneGapEqualToSeconds) {
        offsetSeconds = end - oneGapEqualToSeconds - start;
      }
      if (this.nextTrackItemData && start + offsetSeconds > this.nextTrackItemData.start) {
        offsetSeconds = this.nextTrackItemData.start - start;
      }

      // 视频和音频片段的裁剪边界
      if (["video", "audio"].includes(type)) {
        if (clipStart + offsetSeconds < 0) offsetSeconds = -clipStart;
        this._data.trackline.activeTrackItem.value.clipStart = clipStart + offsetSeconds;
      }
      this._data.trackline.activeTrackItem.value.start = start + offsetSeconds;
    } else if (this.trackItemResizeSideTag === "end") {
      // 缩放片段右侧
      // 1. 左侧边界:start+[时间线一格宽度],左侧片段的end; 右侧边界:右侧片段的start
      // 2. 片段为[视频]或[音频]片段时, 考虑剪辑边界 clipEnd 必须 >= 0

      // 左侧边界
      if (end + offsetSeconds < start + oneGapEqualToSeconds) {
        offsetSeconds = start + oneGapEqualToSeconds - end;
      }
      if (this.prevTrackItemData && end + offsetSeconds < this.prevTrackItemData.end) {
        offsetSeconds = this.prevTrackItemData.end - end;
      }

      // 右侧边界
      if (this.nextTrackItemData && end + offsetSeconds > this.nextTrackItemData.start) {
        offsetSeconds = this.nextTrackItemData.start - end;
      }

      // 视频和音频片段的裁剪边界
      if (["video", "audio"].includes(type)) {
        if (clipEnd - offsetSeconds < 0) offsetSeconds = clipEnd;
        this._data.trackline.activeTrackItem.value.clipEnd = clipEnd - offsetSeconds;
      }
      this._data.trackline.activeTrackItem.value.end = end + offsetSeconds;
    }
  }

  /**
   * 根据移动的像素计算等价的秒数
   * @param pixelX 移动的像素
   * @returns 等价的秒数
   */
  calcOffsetSeconds(pixelX: number) {
    // 移动 pixel
    const offsetX = pixelX - this.markedX;
    // 移动中的滚动
    const offsetScroll = this._data.timeline.ctx.scrollOffset - this.markedScrollOffset;
    // 移动的 pixel 转换为时间
    const { fps, framesPerGap, gapWidth } = this._data.timeline.ctx;
    let offsetSeconds = pixelToTime(offsetX + offsetScroll, fps, framesPerGap, gapWidth);
    return offsetSeconds;
  }
}
