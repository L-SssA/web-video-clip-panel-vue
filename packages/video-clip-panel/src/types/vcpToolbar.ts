import type { Component } from "vue";

export interface VcpToolbarConfig {
  key: string;
  component: Component;
  props: Record<string, any>;
  events: Record<string, any>;
}
