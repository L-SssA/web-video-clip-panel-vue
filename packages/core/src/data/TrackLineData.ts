import type { ComputedRef, Ref } from "vue";

import { computed, ref, watch } from "vue";

import type { TrackLineContext } from "@/types/trackline";
import type {
  AudioTrackLine,
  pictureTrackLine,
  VideoTrackLine,
  TrackLine,
} from "@/types/trackline";

import {
  DEFAULT_TRACKLINE_GAP_HEIGHT,
  DEFAULT_TRACKLINE_MARGIN_TOP,
  MAIN_TRACK_ID,
} from "@/config/constant";

import { BaseData } from "./BaseData";

export class TrackLineData extends BaseData {
  // 按类型顺序排列轨道
  readonly mergeTrackLineList: ComputedRef<TrackLine[]>;
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

  // 轨道默认上边距
  readonly marginTop: Ref<number>;
  // 轨道默认行间距
  readonly gapHeight: Ref<number>;

  // 监听器，用于停止watch
  private unwatch: Function;

  get ctx(): TrackLineContext {
    return {
      mergeTrackLineList: this.mergeTrackLineList.value,
      marginTop: this.marginTop.value,
      gapHeight: this.gapHeight.value,
    };
  }

  constructor(
    marginTop: number = DEFAULT_TRACKLINE_MARGIN_TOP,
    gapHeight: number = DEFAULT_TRACKLINE_GAP_HEIGHT,
  ) {
    super();
    this.marginTop = ref(marginTop);
    this.gapHeight = ref(gapHeight);

    // 所有轨道合并，用于显示
    this.mergeTrackLineList = computed(() => [
      ...this.pictureTrackLineList.value,
      this.mainTrackLine.value,
      ...this.audioTrackLineList.value,
    ]);

    this.unwatch = watch([this.mergeTrackLineList, this.marginTop], () => {
      this.updateEvent.triggerEvent(this.ctx);
    });
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unwatch();
    super.release();
  }
}
