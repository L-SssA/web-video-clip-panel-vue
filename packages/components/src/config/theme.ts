export const DEFAULT_PROPERTIES = {
  "--vcp-color": "#333333",
  "--vcp-color-light": "#cccccc",
  "--vcp-background-color": "#f5f5f5",
  "--vcp-color-active": "#409eff",
};

export const DARK_PROPERTIES = {
  "--vcp-color": "#f5f5f5",
  "--vcp-color-light": "#454545",
  "--vcp-background-color": "#333333",
  "--vcp-color-active": "#409eff",
};

export const THEME_PROPERTIES: Record<string, any> = {
  light: DEFAULT_PROPERTIES,
  dark: DARK_PROPERTIES,
};
