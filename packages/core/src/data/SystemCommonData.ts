import type { Ref } from "vue";

import { ref } from "vue";

import type {
  SystemCommonContext,
  SystemCommonDataOptions,
  SystemCommonStyles,
} from "@/types/systemCommon";

import { DEFAULT_SYSTEM_COMMON_STYLES, SYSTEM_COMMON_STYLES_MAP } from "@/config/theme";

import { BaseData } from "./BaseData";

export class SystemCommonData extends BaseData {
  // 样式
  readonly styles: Ref<SystemCommonStyles>;

  /**
   * 获取系统通用上下文数据
   */
  get ctx(): SystemCommonContext {
    return {
      styles: this.styles.value,
    };
  }

  get observeList(): Ref[] {
    return [this.styles];
  }

  constructor(options: Partial<SystemCommonDataOptions> = {}) {
    super();

    const { styles } = options;

    this.styles = ref(DEFAULT_SYSTEM_COMMON_STYLES);
    this.updateStyles(styles);
  }

  /**
   * 设置主题
   * @param themeTag
   */
  setTheme(themeTag: string) {
    const theme = SYSTEM_COMMON_STYLES_MAP[themeTag] || DEFAULT_SYSTEM_COMMON_STYLES;
    this.updateStyles(theme);
  }

  /**
   * 更新样式
   * @param styles
   */
  updateStyles(styles: Partial<SystemCommonStyles> = {}): void {
    this.styles.value = { ...this.styles.value, ...styles };
  }
}
