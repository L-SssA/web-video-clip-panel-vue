import type { TimelineData, RendererManager, TimelineRenderer } from "@web-vcp/core";
import type { Ref } from "vue";

export type VcpCtx = {
  theme: Ref<string>;
  timeline: TimelineData;
  timelineRenderer: TimelineRenderer;
  rendererManager: RendererManager;
};
