import type { WebVcpManager } from "@web-vcp/core";
import type { Ref } from "vue";

export type VcpCtx = {
  theme: Ref<string>;
  webVcpManager: WebVcpManager;
};
