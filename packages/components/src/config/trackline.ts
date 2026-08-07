import type { TrackLineStyles } from "@web-vcp/core";

export const darkStyles = {
  iconColor: "#888888",
  backgroundColor: "#383838",
};

export const defaultStyles = {
  iconColor: "#888888",
  backgroundColor: "#dedede",
};

export const tracklineStylesMap: Record<string, Partial<TrackLineStyles>> = {
  dark: darkStyles,
};
