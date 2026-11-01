import type { SystemCommonData } from "@web-vcp/core";

import { computed } from "vue";

export const useThemeProps = (systemData: SystemCommonData) => {
  const cssProps = computed(() => {
    return {
      "--vcp-color": systemData.styles.value.color,
      "--vcp-background-color-light": systemData.styles.value.backgroundColorLight,
      "--vcp-background-color": systemData.styles.value.backgroundColor,
      "--vcp-color-active": systemData.styles.value.colorActive,
    };
  });

  return {
    cssProps,
  };
};
