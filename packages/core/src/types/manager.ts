import type {
  SystemCommonContext,
  SystemCommonDataOptions,
  TimelineContext,
  TimelineDataOptions,
  TrackLineContext,
  TrackLineDataOptions,
} from "./data";
import type { WebavHelperOptions } from "./webav";

export interface DataManagerOptions {
  timeline: Partial<TimelineDataOptions>;
  trackline: Partial<TrackLineDataOptions>;
  system: Partial<SystemCommonDataOptions>;
  webav: Partial<WebavHelperOptions>;
}

export interface DataManagerContext {
  timeline: TimelineContext;
  trackline: TrackLineContext;
  system: SystemCommonContext;
}

export interface WebVcpManagerOptions {
  data: Partial<DataManagerOptions>;
  webav: Partial<WebavHelperOptions>;
}
