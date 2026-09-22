import type { ComputedRef, Ref } from "vue";

import { computed, nextTick, ref, watch } from "vue";

import type {
  ActionType,
  TrackItem,
  TrackLineContext,
  TrackLineDataOptions,
  TrackLineStyles,
} from "@/types/trackline";
import type {
  AudioTrackLine,
  pictureTrackLine,
  VideoTrackLine,
  TrackLine,
} from "@/types/trackline";

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
  readonly trackItemColors: Record<string, string>;
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
  // 交互的事件类型
  public actionType: Ref<ActionType | ""> = ref("");

  get ctx(): TrackLineContext {
    return {
      mergeTrackLineList: this.mergeTrackLineList.value,
      marginTop: this.marginTop,
      gapHeight: this.gapHeight,
      marginLeft: this.marginLeft,
      trackHeights: this.trackHeights,
      trackIcons: this.trackIcons,
      trackItemColors: this.trackItemColors,
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
      trackItemColors = {},
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
    this.trackItemColors = { ...DEFAULT_TRACK_COLOR, ...trackItemColors };
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
      return this.mergeTrackLineList.value.reduce((max, trackLine) => {
        return Math.max(
          max,
          trackLine.data.reduce((max, item) => Math.max(max, item.end), 0),
        );
      }, 0);
    }
    return 0;
  }

  /**
   * 添加轨道数据
   * @param trackItem
   */
  addToTrackLine<T extends TrackItem>(trackItem: T): void {
    const duration = trackItem.end - trackItem.start || 5;
    if (this.activeTrackLine.value && this.activeTrackLine.value.type === trackItem.type) {
      // 如果当前活跃轨道与当前添加的轨道类型相同，则将数据添加到当前轨道
      trackItem.parentId = this.activeTrackLine.value.id;
      // 查找是否出现重叠的问题
      const overlap =
        this.activeTrackLine.value.data.findIndex((t) => {
          return (
            // t.start <= trackItem.start < t.end
            isNumberInside(trackItem.start, t.start, t.end) ||
            trackItem.start === t.start ||
            // t.start < trackItem.end <= t.end
            isNumberInside(trackItem.end, t.start, t.end) ||
            trackItem.end == t.end
          );
        }) > -1;
      if (overlap) {
        // 如果重叠，则加入队尾
        trackItem.start = Math.max(...this.activeTrackLine.value.data.map((item) => item.end), 0);
        trackItem.end = trackItem.start + duration;
      }
      this.activeTrackLine.value.data.push(trackItem);
      nextTick(() => (this.activeTrackItem.value = trackItem));
    } else {
      // 如果当前活跃轨道与当前添加的轨道类型不同，则创建新的轨道
      const newTrackLine = defineTrackLineConfig<T>(trackItem.type);
      trackItem.parentId = newTrackLine.id;
      newTrackLine.data.push(trackItem);
      if (newTrackLine.type === "audio") {
        this.audioTrackLineList.value.push(newTrackLine as AudioTrackLine);
      } else {
        this.pictureTrackLineList.value.push(newTrackLine as pictureTrackLine);
      }
      trackItem.end = trackItem.start + duration;
      this.activeTrackLine.value = newTrackLine;
      nextTick(() => (this.activeTrackItem.value = trackItem));
    }
  }

  /**
   * 释放资源
   */
  release(): void {
    super.release();
  }
}
