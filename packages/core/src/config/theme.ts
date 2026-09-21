import type { TimelineStyles } from "@/types/timeline";
import type { TrackLineStyles } from "@/types/trackline";

// ==================== 时间线样式 ====================
export const DARK_TIMELINE_STYLES = {
  lineColor: "#555555",
  lineWidth: 2,
  fontColor: "#888888",
  fontSize: 12,
  cursorLineColor: "#f5f5f5",
  cursorLineWidth: 2,
};

export const DEFAULT_TIMELINE_STYLES = {
  lineColor: "#bbbbbb",
  lineWidth: 2,
  fontColor: "#888888",
  fontSize: 12,
  cursorLineColor: "#686868",
  cursorLineWidth: 2,
};

export const TIMELINE_STYLES_MAP: Record<string, Partial<TimelineStyles>> = {
  dark: DARK_TIMELINE_STYLES,
};

// ==================== 轨道样式 ====================
export const TRACKLINE_DARK_STYLES = {
  iconColor: "#888888",
  backgroundColor: "#383838",
  activeBgColor: "#3c3c3c",
};

// 默认图标源
export const DEFAULT_ICONS_SOURCES = {
  video: "ri-video-line",
  audio: "ri-disc-line",
  text: "ri-text",
  image: "ri-image-line",
} as Record<string, string>;

// 默认图标大小（px）
export const DEFAULT_ICON_SIZE = 26;

// 轨道颜色
export const DEFAULT_TRACK_COLOR = {
  video: "#4A90E2",
  audio: "#3A8F7B",
  text: "#A83245",
  image: "#A57DBB",
  unknown: "#686868",
};

export const DEFAULT_TRACKLINE_STYLES = {
  iconColor: "#888888",
  iconSize: DEFAULT_ICON_SIZE,
  backgroundColor: "#e4e4e4",
  activeBgColor: "#d8d8d8",
};

export const TRACKLINE_STYLES_MAP: Record<string, Partial<TrackLineStyles>> = {
  dark: TRACKLINE_DARK_STYLES,
};

// ==================== 通用样式 ====================
export const DEFAULT_SYSTEM_COMMON_STYLES = {
  color: "#333333",
  colorLight: "#cccccc",
  backgroundColor: "#f5f5f5",
  colorActive: "#409eff",
};

export const DARK_SYSTEM_COMMON_STYLES = {
  color: "#f5f5f5",
  colorLight: "#454545",
  backgroundColor: "#333333",
  colorActive: "#409eff",
};

export const SYSTEM_COMMON_STYLES_MAP: Record<string, any> = {
  light: DEFAULT_SYSTEM_COMMON_STYLES,
  dark: DARK_SYSTEM_COMMON_STYLES,
};
