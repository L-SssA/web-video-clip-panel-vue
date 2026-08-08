import type { DataManager, RendererManager } from "@web-vcp/core";
import type { Ref } from "vue";

export type VcpCtx = {
  theme: Ref<string>;
  dataManager: DataManager;
  rendererManager: RendererManager;
};
