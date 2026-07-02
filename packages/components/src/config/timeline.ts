import type { TimelineStyles } from "@web-vcp/core";

export const darkStyles = {
  lineColor: "#555555",
  lineWidth: 2,
  fontColor: "#888888",
  fontSize: 12,
  cursorLineColor: "#f5f5f5",
  cursorLineWidth: 2,
};

export const defaultStyles = {
  lineColor: "#bbbbbb",
  lineWidth: 2,
  fontColor: "#888888",
  fontSize: 12,
  cursorLineColor: "#333333",
  cursorLineWidth: 2,
};

export const timelineStylesMap: Record<string, TimelineStyles> = {
  dark: darkStyles,
};
