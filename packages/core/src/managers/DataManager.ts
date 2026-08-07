import type { Ref } from "vue";

import { watch } from "vue";

import type { DataManagerOptions, DataManagerContext } from "@/types/data";

import { BaseData } from "@/data/BaseData";
import { TimelineData } from "@/data/TimelineData";
import { TrackLineData } from "@/data/TrackLineData";

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

  setCurrentTimeByPixel(pixel: number) {
    this.timeline.setCurrentTimeByPixel(pixel);
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unwatch();
    super.release();
  }
}
