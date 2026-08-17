import type { DataManagerOptions } from "./data";
import type { WebavHelperOptions } from "./webav";

export interface WebVcpManagerOptions {
  data: Partial<DataManagerOptions>;
  webav: Partial<WebavHelperOptions>;
}
