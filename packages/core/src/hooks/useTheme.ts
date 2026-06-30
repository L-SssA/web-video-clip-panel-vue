import { computed } from "vue";

import { THEME_PROPERTIES, DEFAULT_PROPERTIES } from "../config/theme";

export const useTheme = (theme: string) => {
  const fixedTheme = computed(() => (theme === "dark" ? "dark" : "light"));

  const cssProps = computed(() => THEME_PROPERTIES[fixedTheme.value] || DEFAULT_PROPERTIES);

  return {
    theme: fixedTheme,
    cssProps,
  };
};
