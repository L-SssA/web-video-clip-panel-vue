import type { DataManager, RendererManager, TimelineRenderer } from "@web-vcp/core";
import type { Ref } from "vue";

export type VcpCtx = {
  theme: Ref<string>;
  dataManager: DataManager;
  timelineRenderer: TimelineRenderer;
  rendererManager: RendererManager;
};
