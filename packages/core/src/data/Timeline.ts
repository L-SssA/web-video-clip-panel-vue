import type { Ref } from "vue";

import { computed, ref, watch } from "vue";

import {
  AUTO_ADSORB_WIDTH,
  DEFAULT_FPS,
  DEFAULT_TIMELINE_SCALE,
  TIMELINE_DEFAULT_OFFSET,
  TIMELINE_GAP_OPTIONS,
} from "@/config/constant";

import { EventCallback } from "../utils/eventCallback";

/**
 * 时间线数据模型
 * 纯粹的数据管理，不包含任何渲染逻辑
 */
export class Timeline {
  // 帧率 default 30
  readonly fps: Ref<number>;
  // 当前时刻(秒) default 0
  readonly currentTime: Ref<number> = ref(0);
  // 游标线位置（计算属性）
  readonly cursorLinePosition: Ref<number>;

  // 时间线缩放值 default 50
  readonly scale: Ref<number>;
  // 时间线间隔宽度(px) default 0
  readonly gapWidth: Ref<number> = ref(0);
  // 时间线中每隔多少个间隔显示一个标签
  readonly gapsPerLabel: Ref<number> = ref(0);
  // 时间线中每个间隔包含的帧数
  readonly framesPerGap: Ref<number> = ref(0);
  // 时间线默认位移(px) default 60
  readonly marginLeft: Ref<number>;

  // 启用自动吸附 default true
  readonly enableAutoAdsorb: Ref<boolean> = ref(true);
  // 自动吸附的检测距离
  readonly autoAdsorbDistance: Ref<number>;

  // 更新事件管理
  private updateEvent = new EventCallback();
  // 监听器，用于停止watch
  private unwatch: Function;

  /**
   * 获取时间线上下文数据
   */
  get ctx() {
    return {
      // 时间相关
      fps: this.fps.value,
      currentTime: this.currentTime.value,
      // 时间线相关
      scale: this.scale.value,
      gapWidth: this.gapWidth.value,
      gapsPerLabel: this.gapsPerLabel.value,
      framesPerGap: this.framesPerGap.value,
      marginLeft: this.marginLeft.value,
      cursorLinePosition: this.cursorLinePosition.value,
    };
  }

  constructor(
    scale: number = DEFAULT_TIMELINE_SCALE,
    fps: number = DEFAULT_FPS,
    marginLeft: number = TIMELINE_DEFAULT_OFFSET,
    autoAdsorbDistance: number = AUTO_ADSORB_WIDTH,
  ) {
    this.scale = ref(scale);
    this.fps = ref(fps);
    this.marginLeft = ref(marginLeft);
    this.autoAdsorbDistance = ref(autoAdsorbDistance);

    // 计算游标线位置
    this.cursorLinePosition = computed(() => {
      // currentTime(秒) * fps -> 帧数
      // 帧数 / framesPerGap -> 刻度数
      // 刻度数 * gapWidth -> 实际坐标
      return (
        ((this.currentTime.value * this.fps.value) / this.framesPerGap.value) * this.gapWidth.value
      );
    });

    // 监听 scale 和 fps 变化，更新各项指标
    this.unwatch = watch(
      [this.scale, this.fps, this.marginLeft, this.autoAdsorbDistance],
      () => {
        this.calcTimelineGapWidth();
        this.updateEvent.triggerEvent(this.ctx);
      },
      { immediate: true },
    );
  }

  /**
   * 设置当前时间
   * @param time 时间（秒）
   */
  setCurrentTime(time: number): void {
    this.currentTime.value = time;
    this.updateEvent.triggerEvent(this.ctx);
  }

  /**
   * 设置缩放值
   * @param scale 缩放值
   */
  setScale(scale: number): void {
    this.scale.value = scale;
  }

  /**
   * 设置帧率
   * @param fps 帧率
   */
  setFps(fps: number): void {
    this.fps.value = fps;
  }

  /**
   * 计算时间线间隔宽度、间隔标签间隔和每个间隔包含的帧数
   */
  calcTimelineGapWidth(): void {
    // 根据缩放值，调整时间线间隔变化率
    const singleFrameWidth =
      this.scale.value > 50 ? 2 + (this.scale.value - 50) * 0.76 : 0.2 + this.scale.value * 0.036;

    // 根据每帧的宽度调整时间线的间隔和标签位置
    const option = TIMELINE_GAP_OPTIONS.find((option) => singleFrameWidth <= option.breakPoint);
    if (option) {
      this.gapsPerLabel.value = option.gaps;
      this.framesPerGap.value = option.frames;
    }
    this.gapWidth.value = this.framesPerGap.value * singleFrameWidth;
  }

  /**
   * 添加更新回调
   * @param callback 回调函数
   */
  onUpdate(callback: Function): void {
    if (this.updateEvent.hasEvent(callback)) return;
    this.updateEvent.onEvent(callback);
  }

  /**
   * 移除更新回调
   * @param callback 回调函数
   */
  offUpdate(callback: Function): void {
    this.updateEvent.offEvent(callback);
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unwatch();
    this.updateEvent.clearEvent();
  }
}
