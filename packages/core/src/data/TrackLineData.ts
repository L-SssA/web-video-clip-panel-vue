import type { ComputedRef, Ref } from "vue";

import { computed, nextTick, ref, watch } from "vue";

import type {
  TrackItem,
  TrackLineContext,
  TrackLineDataOptions,
  TrackLineStyles,
  AudioTrackLine,
  pictureTrackLine,
  VideoTrackLine,
  TrackLine,
} from "@/types/data";

import {
  DEFAULT_AUDIO_BAR_HEIGHT,
  DEFAULT_AUDIO_BAR_SPACING,
  DEFAULT_AUDIO_BAR_WIDTH,
  DEFAULT_TRACK_HEIGHTS,
  DEFAULT_TRACKLINE_GAP_HEIGHT,
  DEFAULT_TRACKLINE_MARGIN_LEFT,
  DEFAULT_TRACKLINE_MARGIN_TOP,
  MAIN_TRACK_ID,
} from "@/config/constant";
import {
  DEFAULT_ICONS_SOURCES,
  DEFAULT_TRACK_COLOR,
  DEFAULT_TRACKLINE_STYLES,
  TRACKLINE_STYLES_MAP,
} from "@/config/theme";
import { isNumberInside } from "@/utils/tools";
import { defineTrackLineConfig } from "@/utils/trackline";

import { BaseData } from "./BaseData";

export class TrackLineData extends BaseData {
  // 画面轨道列表
  private pictureTrackLineList = ref<pictureTrackLine[]>([]);
  // 主轨道（video track）
  private mainTrackLine = ref<VideoTrackLine>({
    id: MAIN_TRACK_ID,
    type: "video",
    data: [],
    main: true,
    mute: false,
  });
  // 音频轨道列表
  private audioTrackLineList = ref<AudioTrackLine[]>([]);
  // 按类型顺序排列轨道
  readonly mergeTrackLineList: ComputedRef<TrackLine[]>;

  // 轨道默认上边距
  readonly marginTop: number;
  // 轨道默认行间距
  readonly gapHeight: number;
  // 轨道默认左侧偏移量
  readonly marginLeft: number;

  // 样式
  readonly trackHeights: Record<string, number>;
  readonly trackIcons: Record<string, string>;
  readonly trackitemColors: Record<string, string>;
  readonly styles: Ref<TrackLineStyles>;
  // 音频柱相关样式
  readonly audioBarWidth: number;
  readonly audioBarSpacing: number;
  readonly audioBarHeight: number;

  // 当前活跃的轨道
  public activeTrackLine: Ref<TrackLine | null> = ref(null);
  // 当前活跃的轨道片段
  public activeTrackItem: Ref<TrackItem | null> = ref(null);

  // 交互
  // 拖拽过程中出现重叠现象
  public draggingOverlap: Ref<boolean> = ref(false);
  // 左侧对齐线
  public showAlignmentLeft: Ref<boolean> = ref(false);
  public alignmentLeftPosition: Ref<number> = ref(0);
  // 右侧对齐线
  public showAlignmentRight: Ref<boolean> = ref(false);
  public alignmentRightPosition: Ref<number> = ref(0);
  // 将要移动到的轨道
  public targetTrackLineTo: Ref<TrackLine | null> = ref(null);
  // 从某轨道移出
  public leaveTracklineFrom: Ref<TrackLine | null> = ref(null);
  // 鼠标从 activeTrackLine 离开时的方向
  public leaveDirection: "bottom" | "top" | "" = "";
  // 需要创建一条新的 trackline
  public newlineforTrackitem: Ref<boolean> = ref(false);
  // 创建新的 trackline 的位置
  public directionToNewline: Ref<"bottom" | "top" | ""> = ref("");

  get ctx(): TrackLineContext {
    return {
      mergeTrackLineList: this.mergeTrackLineList.value,
      marginTop: this.marginTop,
      gapHeight: this.gapHeight,
      marginLeft: this.marginLeft,
      trackHeights: this.trackHeights,
      trackIcons: this.trackIcons,
      trackitemColors: this.trackitemColors,
      styles: this.styles.value,
      audioBarWidth: this.audioBarWidth,
      audioBarSpacing: this.audioBarSpacing,
      audioBarHeight: this.audioBarHeight,
    };
  }

  get observeList(): Ref[] {
    return [this.mergeTrackLineList, this.styles];
  }

  constructor(options: Partial<TrackLineDataOptions> = {}) {
    super();

    const {
      marginTop = DEFAULT_TRACKLINE_MARGIN_TOP,
      gapHeight = DEFAULT_TRACKLINE_GAP_HEIGHT,
      marginLeft = DEFAULT_TRACKLINE_MARGIN_LEFT,
      trackHeights = {},
      trackIcons = {},
      trackitemColors = {},
      styles,
      audioBarWidth = DEFAULT_AUDIO_BAR_WIDTH,
      audioBarSpacing = DEFAULT_AUDIO_BAR_SPACING,
      audioBarHeight = DEFAULT_AUDIO_BAR_HEIGHT,
    } = options;

    this.marginTop = marginTop;
    this.gapHeight = gapHeight;
    this.marginLeft = marginLeft;
    this.audioBarWidth = audioBarWidth;
    this.audioBarSpacing = audioBarSpacing;
    this.audioBarHeight = audioBarHeight;

    this.trackHeights = { ...DEFAULT_TRACK_HEIGHTS, ...trackHeights };
    this.trackIcons = { ...DEFAULT_ICONS_SOURCES, ...trackIcons };
    this.trackitemColors = { ...DEFAULT_TRACK_COLOR, ...trackitemColors };
    this.styles = ref(DEFAULT_TRACKLINE_STYLES);
    this.updateStyles(styles);

    // 所有轨道合并，用于显示
    this.mergeTrackLineList = computed(() => [
      ...this.pictureTrackLineList.value,
      this.mainTrackLine.value,
      ...this.audioTrackLineList.value,
    ]);

    this.unwatch = watch(this.observeList, () => {
      this.triggerUpdate();
    });
  }

  /**
   * 设置主题
   * @param themeTag
   */
  setTheme(themeTag: string) {
    const theme = TRACKLINE_STYLES_MAP[themeTag] || DEFAULT_TRACKLINE_STYLES;
    this.updateStyles(theme);
  }

  /**
   * 更新样式
   * @param styles
   */
  updateStyles(styles: Partial<TrackLineStyles> = {}): void {
    this.styles.value = { ...this.styles.value, ...styles };
  }

  /**
   * 获取最长轨道的时长
   * @returns
   */
  getLongestTracklineSecond(): number {
    if (this.mergeTrackLineList.value.length > 0) {
      return this.mergeTrackLineList.value.reduce((max, trackline) => {
        return Math.max(
          max,
          trackline.data.reduce((max, item) => Math.max(max, item.end), 0),
        );
      }, 0);
    }
    return 0;
  }

  /**
   * 在 trackline 中 找到是否有重叠的 trackitem
   * @param trackitem 需要查找的 trackitem
   * @returns 重叠的 trackitem
   */
  findOverlapTrackItem(trackline: TrackLine, trackitem: TrackItem) {
    return trackline.data.find((t) => {
      return (
        // t.start <= trackitem.start < t.end
        isNumberInside(trackitem.start, t.start, t.end) ||
        trackitem.start === t.start ||
        // t.start < trackitem.end <= t.end
        isNumberInside(trackitem.end, t.start, t.end) ||
        trackitem.end == t.end
      );
    });
  }

  /**
   * 添加轨道数据
   * @param trackitem
   */
  addToTrackLine<T extends TrackItem>(trackitem: T): void {
    if (this.activeTrackLine.value && this.activeTrackLine.value.type === trackitem.type) {
      // 如果当前活跃轨道与当前添加的轨道类型相同，则将数据添加到当前轨道
      trackitem.parentId = this.activeTrackLine.value.id;
      // 查找是否出现重叠的问题
      const overlap = this.findOverlapTrackItem(this.activeTrackLine.value, trackitem);
      if (overlap != null) {
        // 如果重叠，则加入队尾
        trackitem.start = Math.max(...this.activeTrackLine.value.data.map((item) => item.end), 0);
        const duration = trackitem.end - trackitem.start || 5;
        trackitem.end = trackitem.start + duration;
      }
      this.activeTrackLine.value.data.push(trackitem);
      nextTick(() => (this.activeTrackItem.value = trackitem));
    } else {
      // 如果当前活跃轨道与当前添加的轨道类型不同，则创建新的轨道
      this.addToNewTrackLine(trackitem);
    }
  }

  /**
   * 将 trackitem 添加到新的轨道
   * @param trackitem 目标 trackitem
   */
  addToNewTrackLine<T extends TrackItem>(trackitem: T): void {
    const newTrackLine = defineTrackLineConfig<T>(trackitem.type);
    trackitem.parentId = newTrackLine.id;
    newTrackLine.data.push(trackitem);
    if (newTrackLine.type === "audio") {
      this.audioTrackLineList.value.push(newTrackLine as AudioTrackLine);
    } else {
      this.pictureTrackLineList.value.push(newTrackLine as pictureTrackLine);
    }
    const duration = trackitem.end - trackitem.start || 5;
    trackitem.end = trackitem.start + duration;
    this.activeTrackLine.value = newTrackLine;
    nextTick(() => (this.activeTrackItem.value = trackitem));
  }

  /**
   * 记录要移动到的目标 TrackLine
   * @param trackline 将要移动到的 TrackLine
   */
  markEnterTrackLineInfo(trackline: TrackLine) {
    if (this.activeTrackItem.value?.type !== trackline.type) return;
    this.targetTrackLineTo.value = trackline;
    if (this.leaveTracklineFrom.value?.id === trackline.id) {
      // 如果离开的id与进入的id相同，则代表重新进入该轨道
      this.leaveTracklineFrom.value = null;
    }
  }

  /**
   * 记录从 trackline 离开的信息
   * @param trackline 离开的轨道
   * @param event 离开的事件信息
   */
  markLeaveTrackLineInfo(trackline: TrackLine, event: MouseEvent) {
    if (trackline.id !== this.activeTrackLine.value?.id) return;
    const domHeight = (event.target as HTMLElement | null)?.clientHeight;
    if (!domHeight) return;
    this.leaveDirection = event.offsetY >= domHeight / 2 ? "bottom" : "top";
    this.leaveTracklineFrom.value = trackline;
  }

  /**
   * 将 trackitem 移动到目标 trackline, trackline 为空时，只做移出
   * @param trackitem 需要移动的 trackitem
   * @param trackline 需要移动到的 trackline
   */
  moveTrackitem(trackitem: TrackItem, trackline: TrackLine | null = null) {
    if (trackitem.parentId === trackline?.id) return;
    const parentTrackline = this.mergeTrackLineList.value.find((t) => t.id === trackitem.parentId);
    if (parentTrackline) {
      parentTrackline.data = parentTrackline.data.filter((t) => t.id !== trackitem.id);
    }
    if (trackline) {
      trackitem.parentId = trackline.id;
      trackline.data.push(trackitem);
    }
  }

  /**
   * 将 trackline 移动到目标轨道的旁边
   * @param trackline 需要移动的 trackline
   * @param targetId 目标位置的临近轨道 id
   * @param direction 临近轨道的移动方向 top | bottom
   */
  moveTrackline(trackline: TrackLine, targetId?: string | symbol, direction?: string) {
    // 画面轨道和音频轨道存在不同的列表中
    if (trackline.type === "audio") {
      this.moveTrackInList(trackline, this.audioTrackLineList, targetId, direction);
    } else {
      this.moveTrackInList(trackline, this.pictureTrackLineList, targetId, direction);
    }
  }

  /**
   * 将 trackline 移动到目标轨道的旁边
   * @param trackline 需要移动的 trackline
   * @param tracklist tracklist
   * @param targetId 目标位置的临近轨道 id
   * @param direction 临近轨道的移动方向 top | bottom
   */
  private moveTrackInList<T extends TrackLine>(
    trackline: T,
    tracklist: Ref<T[]>,
    targetId?: string | symbol,
    direction?: string,
  ) {
    const newList = tracklist.value.filter((tl) => tl.id !== trackline.id);
    let targetIdx = newList.findIndex((tl) => tl.id === targetId);

    if (targetIdx > -1) {
      if (direction === "bottom") targetIdx++;
      newList.splice(targetIdx, 0, trackline);
    } else {
      newList.push(trackline);
    }
    tracklist.value = newList;
  }

  // 重置对齐线
  resetAlignment() {
    this.showAlignmentLeft.value = false;
    this.showAlignmentRight.value = false;
    this.alignmentLeftPosition.value = 0;
    this.alignmentRightPosition.value = 0;
  }

  /**
   * 清除空的 trackline
   */
  cleanEmptyTrackline() {
    const tracklineEmpty = (tl: TrackLine) => tl.data.length;
    this.pictureTrackLineList.value = this.pictureTrackLineList.value.filter(tracklineEmpty);
    this.audioTrackLineList.value = this.audioTrackLineList.value.filter(tracklineEmpty);
  }

  /**
   * 释放资源
   */
  release(): void {
    super.release();
  }
}
