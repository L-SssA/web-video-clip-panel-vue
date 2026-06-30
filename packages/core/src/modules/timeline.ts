import type { Ref } from "vue";

import { ref } from "vue";

import { TIMELINE_GAP_OPTIONS } from "@/config/constant";

export class Timeline {
  // 时间线缩放值 default 50
  public scale: Ref<number>;
  // 时间线间隔宽度(px) default 0
  readonly gapWidth: Ref<number> = ref(0);
  // 时间线中每隔多少个间隔显示一个标签
  readonly gapsPerLabel: Ref<number> = ref(0);
  // 时间线中每个间隔包含的帧数
  readonly framesPerGap: Ref<number> = ref(0);

  constructor(scale: number = 50) {
    this.scale = ref(scale);
    this.calcTimelineGapWidth();
  }

  /**
   * 计算时间线间隔宽度、间隔标签间隔和每个间隔包含的帧数
   */
  calcTimelineGapWidth() {
    // 根据缩放值，调整时间线间隔变化率
    const singleFrameWidth =
      this.scale.value > 50 ? 2 + (this.scale.value - 50) * 0.76 : 0.2 + this.scale.value * 0.036;

    // 根据每帧的宽度调整时间线的间隔和标签位置
    const option = TIMELINE_GAP_OPTIONS.find((option) => singleFrameWidth <= option.breakPoint);
    if (option) {
      this.gapsPerLabel.value = option.count;
      this.framesPerGap.value = option.frames;
    }
    this.gapWidth.value = this.framesPerGap.value * singleFrameWidth;
  }
}
