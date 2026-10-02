import type { TrackItem, TrackItemServiceContext } from "@/types/data";
import type { MarkedTrackItemData } from "@/types/manager";

import { isNumberInside, pixelToTime, timeToPixel } from "@/utils/tools";

import { BaseService } from "./BaseService";

export class TrackItemService extends BaseService {
  private markedX: number = 0;
  private markedScrollLeft: number = 0;
  private markedTrackItemData: MarkedTrackItemData = {
    start: 0,
    end: 0,
    clipStart: 0,
    clipEnd: 0,
  };
  private prevTrackItemData: MarkedTrackItemData | null = null;
  private nextTrackItemData: MarkedTrackItemData | null = null;
  private trackitemDraging: boolean = false;
  private trackitemResing: boolean = false;
  private trackitemResizeSideTag: string = "";

  get ctx(): TrackItemServiceContext {
    return {
      trackitemDraging: this.trackitemDraging,
      trackitemResing: this.trackitemResing,
    };
  }

  /**
   * trackitem 鼠标移动操作的无效校验
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
      this.markedScrollLeft = this._data.timeline.ctx.scrollLeft;
      // 保存必要的 trackitem 数据
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
    // trackitem 拖拽移动
    if (this.trackitemDraging && this._data.system.mouseEvent) {
      const movedX = this._data.system.mouseEvent.clientX;
      this.moveTrackItemByPixel(movedX);
      this.checkIsNeedNewLineForTrackItem();
      this.searchForAlignment();
    }
    // trackitem 缩放移动
    if (this.trackitemResing && this._data.system.mouseEvent) {
      const movedX = this._data.system.mouseEvent.clientX;
      this.resizeTrackItemByPixel(movedX);
      this.searchForAlignment();
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
   * 激活 trackitem 拖拽事件
   */
  activateTrackItemDraging() {
    if (this.invalidTrackItemMouseAction()) return;
    if (!this.saveTrackItemStatus()) return;
    this.trackitemDraging = true;
    this._data.trackline.activeTrackItem.value!.ghost = true;
  }

  /**
   * 停用 trackitem 拖拽事件
   */
  deactivateTrackItemDraging() {
    this.trackitemDraging = false;
    this._data.trackline.draggingOverlap.value = false;
    const activeTrackItem = this._data.trackline.activeTrackItem;
    if (activeTrackItem.value) activeTrackItem.value.ghost = false;
    this.resetMarks();
    this._data.trackline.resetAlignment();
    this.checkAndDoNewLineForTrackItem();
    // 因为拖拽存在移空 trackline 的情况，所以清理空 trackline
    this._data.trackline.cleanEmptyTrackline();
  }

  /**
   * 激活 trackitem 缩放事件
   * @param side: start | end 缩放的位置
   */
  activateTrackItemResizing(sideTag: string) {
    if (this.invalidTrackItemMouseAction()) return;
    if (!this.saveTrackItemStatus()) return;
    this.trackitemResing = true;
    this.trackitemResizeSideTag = sideTag;
  }

  /**
   * 停用 trackitem 缩放事件
   */
  deactivateTrackItemResizing() {
    this.trackitemResing = false;
    this.trackitemResizeSideTag = "";
    this.resetMarks();
    this._data.trackline.resetAlignment();
  }

  /**
   * 根据像素移动 trackitem
   * @param pixelX 移动的 x 像素
   */
  moveTrackItemByPixel(pixelX: number) {
    const { activeTrackLine, activeTrackItem, draggingOverlap, targetTrackLineTo } =
      this._data.trackline;

    if (!activeTrackItem.value) return;
    // 如果存在需要移动到的目标轨道，则先做移动
    if (targetTrackLineTo.value && targetTrackLineTo.value.id !== activeTrackLine.value?.id) {
      this._data.trackline.moveTrackitem(activeTrackItem.value, targetTrackLineTo.value);
      activeTrackLine.value = targetTrackLineTo.value;
    }

    // 计算移动像素转换为秒数
    let offsetSeconds = this.calcOffsetSeconds(pixelX);

    // 计算边界
    const { start, end } = this.markedTrackItemData;
    if (start + offsetSeconds < 0) offsetSeconds = -start;

    // 计算自动吸附: 分别计算 start 和 end 的自动吸附，取偏移量最小的应用
    const offsetSecondsStart = this.searchForAutoAdsorb(start + offsetSeconds) - start;
    const offsetSecondsEnd = this.searchForAutoAdsorb(end + offsetSeconds) - end;
    if (Math.abs(offsetSecondsStart) < Math.abs(offsetSecondsEnd)) {
      offsetSeconds = offsetSecondsStart;
    } else {
      offsetSeconds = offsetSecondsEnd;
    }

    const movedStart = start + offsetSeconds;
    const movedEnd = end + offsetSeconds;

    // 计算相对关系
    draggingOverlap.value = false;

    // 计算相对关系 -> 计算重叠关系
    activeTrackLine.value?.data.forEach((ti) => {
      if (activeTrackItem.value?.id === ti.id) return;
      // 如果该 activeTrackItem 与其他 trackitem 重叠，则标记为重叠
      if (
        // ti.start <= movedStart < ti.end
        isNumberInside(movedStart, ti.start, ti.end) ||
        movedStart === ti.start ||
        // ti.start < movedEnd <= ti.end
        isNumberInside(movedEnd, ti.start, ti.end) ||
        movedEnd === ti.end
      ) {
        draggingOverlap.value = true;
      }
    });

    // 移动 trackitem
    activeTrackItem.value.start = movedStart;
    activeTrackItem.value.end = movedEnd;
  }

  /**
   * 根据像素缩放 trackitem
   * @param pixelX 移动的 x 像素
   */
  resizeTrackItemByPixel(pixelX: number) {
    if (!this._data.trackline.activeTrackItem.value) return;

    // 计算移动像素转换为秒数
    let offsetSeconds = this.calcOffsetSeconds(pixelX);

    // 缩放 trackitem
    const { start, end, clipStart, clipEnd } = this.markedTrackItemData;
    const { type } = this._data.trackline.activeTrackItem.value;
    const { gapWidth, fps, framesPerGap } = this._data.timeline.ctx;

    const oneGapEqualToSeconds = pixelToTime(gapWidth, fps, framesPerGap, gapWidth);

    if (this.trackitemResizeSideTag === "start") {
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

      // 自动吸附
      offsetSeconds = this.searchForAutoAdsorb(start + offsetSeconds) - start;

      // 视频和音频片段的裁剪边界
      if (["video", "audio"].includes(type)) {
        if (clipStart + offsetSeconds < 0) offsetSeconds = -clipStart;
        this._data.trackline.activeTrackItem.value.clipStart = clipStart + offsetSeconds;
      }
      this._data.trackline.activeTrackItem.value.start = start + offsetSeconds;
    } else if (this.trackitemResizeSideTag === "end") {
      // 缩放片段右侧
      // 1. 左侧边界:start+[时间线一格宽度], 左侧片段的end; 右侧边界:右侧片段的start
      // 2. 片段为[视频]或[音频]片段时, 考虑剪辑边界 clipEnd 必须 >= 0

      // 左侧边界
      if (end + offsetSeconds < start + oneGapEqualToSeconds) {
        offsetSeconds = start + oneGapEqualToSeconds - end;
      }
      if (this.prevTrackItemData && end + offsetSeconds < this.prevTrackItemData.end) {
        offsetSeconds = this.prevTrackItemData.end - end;
      }

      // 自动吸附
      offsetSeconds = this.searchForAutoAdsorb(end + offsetSeconds) - end;

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
    const offsetScroll = this._data.timeline.ctx.scrollLeft - this.markedScrollLeft;
    // 移动的 pixel 转换为时间
    const { fps, framesPerGap, gapWidth } = this._data.timeline.ctx;
    let offsetSeconds = pixelToTime(offsetX + offsetScroll, fps, framesPerGap, gapWidth);
    return offsetSeconds;
  }

  /**
   * 计算自动吸附的偏移秒数
   * @param tartgetSecond 目标时间点
   */
  searchForAutoAdsorb(tartgetSecond: number) {
    const { enableAutoAdsorb, autoAdsorbDistance, fps, framesPerGap, gapWidth } =
      this._data.timeline.ctx;
    if (!enableAutoAdsorb) return tartgetSecond;
    const autoAdsorbDistanceSeconds = pixelToTime(autoAdsorbDistance, fps, framesPerGap, gapWidth);
    // 查找范围内的吸附点，去重并排序
    const { mergeTrackLineList, activeTrackItem } = this._data.trackline;
    const points = new Set<number>();
    mergeTrackLineList.value.forEach((tl) => {
      tl.data.forEach((ti) => {
        if (ti.id === activeTrackItem.value?.id) return;
        if (Math.abs(ti.start - tartgetSecond) <= autoAdsorbDistanceSeconds) points.add(ti.start);
        if (Math.abs(ti.end - tartgetSecond) <= autoAdsorbDistanceSeconds) points.add(ti.end);
      });
    });
    // 无有效附着点，返回
    if (points.size <= 0) return tartgetSecond;

    const sortedAbsorbPoints = [...points].sort(
      (a, b) => Math.abs(b - tartgetSecond) - Math.abs(a - tartgetSecond),
    );

    return sortedAbsorbPoints[0];
  }

  /**
   * 查找对齐线位置
   */
  searchForAlignment() {
    // 重置对齐线状态
    this._data.trackline.resetAlignment();

    const {
      mergeTrackLineList,
      activeTrackItem,
      showAlignmentLeft,
      alignmentLeftPosition,
      showAlignmentRight,
      alignmentRightPosition,
    } = this._data.trackline;

    if (!activeTrackItem.value) return;

    const { fps, framesPerGap, gapWidth, scrollLeft, marginLeft } = this._data.timeline.ctx;
    const { start, end } = activeTrackItem.value;

    // 计算相对关系 -> 计算对齐关系
    mergeTrackLineList.value.forEach((tl) => {
      tl.data.forEach((ti) => {
        if (ti.id === activeTrackItem.value?.id) return;
        // 左侧定位线
        if (start === ti.start || start === ti.end) {
          showAlignmentLeft.value = true;
          alignmentLeftPosition.value =
            timeToPixel(start, fps, framesPerGap, gapWidth) - scrollLeft + marginLeft;
        }
        // 右侧定位线
        if (end === ti.start || end === ti.end) {
          showAlignmentRight.value = true;
          alignmentRightPosition.value =
            timeToPixel(end, fps, framesPerGap, gapWidth) - scrollLeft + marginLeft;
        }
      });
    });
  }

  /**
   * 检查是否需要为 trackitem 创建新的 trackline
   */
  checkIsNeedNewLineForTrackItem() {
    const {
      draggingOverlap,
      newlineforTrackitem,
      directionToNewline,
      leaveTracklineFrom,
      leaveDirection,
      activeTrackLine,
    } = this._data.trackline;
    // 先重置状态
    newlineforTrackitem.value = false;
    // 出现从当前轨道离开且没有进入新的轨道时，需要创建新的 trackline
    // 当前活跃轨道与当前离开轨道id相等时，视为上述条件
    if (activeTrackLine.value?.id === leaveTracklineFrom.value?.id) {
      directionToNewline.value = leaveDirection;
      newlineforTrackitem.value = true;
    }
    // 出现重叠时，需要创建新的 trackline
    else if (draggingOverlap.value) {
      // 指定创建位置为当前 trackline 的下
      directionToNewline.value = "bottom";
      newlineforTrackitem.value = true;
    }
  }

  /**
   * 检查并创建新的 trackline
   */
  checkAndDoNewLineForTrackItem() {
    const { activeTrackLine, activeTrackItem, newlineforTrackitem, directionToNewline } =
      this._data.trackline;
    if (!newlineforTrackitem.value || !activeTrackItem.value) return;
    const targetId = activeTrackLine.value?.id;
    // 将当前 trackitem 移出 trackline
    this._data.trackline.moveTrackitem(activeTrackItem.value);
    // 将当前 trackitem 添加到新的 trackline
    this._data.trackline.addToNewTrackLine(activeTrackItem.value);
    // 将 trackline 移动到正确的位置
    const parentTrackline = this._data.trackline.mergeTrackLineList.value.find(
      (tl) => tl.id === activeTrackItem.value?.parentId,
    );
    this._data.trackline.moveTrackline(parentTrackline!, targetId, directionToNewline.value);
    newlineforTrackitem.value = false;
  }
}
