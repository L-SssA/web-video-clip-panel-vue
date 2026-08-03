import type { TimelineData, RendererManager, TimelineRenderer, TrackLineData } from "@web-vcp/core";
import type { Ref } from "vue";

export type VcpCtx = {
  theme: Ref<string>;
  timeline: TimelineData;
  trackline: TrackLineData;
  timelineRenderer: TimelineRenderer;
  rendererManager: RendererManager;
};
