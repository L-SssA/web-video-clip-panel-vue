import type { Ref } from "vue";

import { watch } from "vue";

import type { DataManagerOptions, DataManagerContext } from "@/types/data";

import { TRACKLINE_SOURCE_TYPE } from "@/config/symbol";
import { BaseData } from "@/data/BaseData";
import { TimelineData } from "@/data/TimelineData";
import { TrackLineData } from "@/data/TrackLineData";
import { timeToPixel } from "@/utils/tools";

export class DataManager extends BaseData {
  timeline: TimelineData;
  trackline: TrackLineData;
  unwatch: Function;

  get ctx(): DataManagerContext {
    return {
      timeline: this.timeline.ctx,
      trackline: this.trackline.ctx,
    };
  }

  get observeList(): Ref[] {
    return [...this.timeline.observeList, ...this.trackline.observeList];
  }

  constructor(options: Partial<DataManagerOptions> = {}) {
    super();
    this.timeline = new TimelineData(options.timeline);
    this.trackline = new TrackLineData(options.trackline);

    this.unwatch = watch(this.observeList, () => {
      this.updateEvent.triggerEvent(this.ctx);
    });
  }

  /**
   * 根据像素设置当前时间
   * @param pixel
   */
  setCurrentTimeByPixel(pixel: number) {
    const maxTime = this.trackline.getLongestTracklineSecond();
    const { fps, framesPerGap, gapWidth } = this.timeline.ctx;
    const maxPixel = timeToPixel(maxTime, fps, framesPerGap, gapWidth);
    if (pixel > maxPixel) pixel = maxPixel;
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
      [TRACKLINE_SOURCE_TYPE.VIDEO]: this.trackline.addMP4Source,
      [TRACKLINE_SOURCE_TYPE.IMAGE]: this.trackline.addImageSource,
      [TRACKLINE_SOURCE_TYPE.AUDIO]: this.trackline.addAudioSource,
      [TRACKLINE_SOURCE_TYPE.TEXT]: this.trackline.addTextSource,
    }[type];

    if (processor) return await processor.bind(this.trackline)(source, opts);
    throw new Error(`Invalid source type: ${String(type)}`);
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unwatch();
    this.timeline.release();
    this.trackline.release();
    super.release();
  }
}
