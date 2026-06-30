import type { Ref } from "vue";

import { computed } from "vue";

import { THEME_PROPERTIES, DEFAULT_PROPERTIES } from "../config/theme";

export const useTheme = (theme: Ref<string>) => {
  const fixedTheme = computed(() => {
    return theme.value === "dark" ? "dark" : "light";
  });

  const cssProps = computed(() => THEME_PROPERTIES[fixedTheme.value] || DEFAULT_PROPERTIES);

  return {
    theme: fixedTheme,
    cssProps,
  };
};
