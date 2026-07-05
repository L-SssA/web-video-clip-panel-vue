import type { Timeline, RendererManager } from "@web-vcp/core";
import type { Ref } from "vue";

export type VcpCtx = {
  theme: Ref<string>;
  timeline: Timeline;
  rendererManager: RendererManager;
};
