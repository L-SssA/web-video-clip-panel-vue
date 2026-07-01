import type { Ref } from "vue";

import { ref, watch } from "vue";

import { TIMELINE_GAP_OPTIONS } from "@/config/constant";

import { EventCallback } from "./EventCallback";

export class Timeline {
  // 时间线缩放值 default 50
  readonly scale: Ref<number>;
  // 时间线间隔宽度(px) default 0
  readonly gapWidth: Ref<number> = ref(0);
  // 时间线中每隔多少个间隔显示一个标签
  readonly gapsPerLabel: Ref<number> = ref(0);
  // 时间线中每个间隔包含的帧数
  readonly framesPerGap: Ref<number> = ref(0);
  // 更新事件管理
  private updateEvent = new EventCallback();
  // 监听器，用于停止watch
  private unwatch: Function;

  get ctx() {
    return {
      scale: this.scale.value,
      gapWidth: this.gapWidth.value,
      gapsPerLabel: this.gapsPerLabel.value,
      framesPerGap: this.framesPerGap.value,
    };
  }

  constructor(scale: number = 50) {
    this.scale = ref(scale);

    this.unwatch = watch(
      this.scale,
      () => {
        this.calcTimelineGapWidth();
        this.updateEvent.triggerEvent(this.ctx);
      },
      { immediate: true },
    );
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

  /**
   * 添加更新回调
   * @param callback
   */
  onUpdate(callback: Function) {
    if (this.updateEvent.hasEvent(callback)) return;
    this.updateEvent.onEvent(callback, true, this.ctx);
  }

  /**
   * 移除更新回调
   * @param callback
   */
  offUpdate(callback: Function) {
    this.updateEvent.offEvent(callback);
  }

  /**
   * 释放资源
   */
  release() {
    this.unwatch();
    this.updateEvent.clearEvent();
  }
}
