import type { Reactive, Ref } from "vue";

import { reactive, ref, watch } from "vue";

import type {
  Rect,
  SystemCommonContext,
  SystemCommonDataOptions,
  SystemCommonStyles,
} from "@/types/data";

import { DEFAULT_CLOSE_EDGE_DISTANCE } from "@/config/constant";
import { DEFAULT_SYSTEM_COMMON_STYLES, SYSTEM_COMMON_STYLES_MAP } from "@/config/theme";

import { BaseData } from "./BaseData";

export class SystemCommonData extends BaseData {
  public mouseEvent: MouseEvent | null = null;

  // 面板边缘检测距离
  public closeEdgeDistance: number;

  // 面板高度
  readonly panelRect: Rect = reactive({ width: 0, height: 0 });
  // 画布高度
  readonly canvasRect: Rect = reactive({ width: 0, height: 0 });

  // 样式
  readonly styles: Ref<SystemCommonStyles>;

  /**
   * 获取系统通用上下文数据
   */
  get ctx(): SystemCommonContext {
    return {
      styles: this.styles.value,
      panelRect: this.panelRect,
      canvasRect: this.canvasRect,
      closeEdgeDistance: this.closeEdgeDistance,
    };
  }

  get observeList(): Ref[] {
    return [this.styles];
  }

  constructor(options: Partial<SystemCommonDataOptions> = {}) {
    super();

    const { styles, closeEdgeDistance = DEFAULT_CLOSE_EDGE_DISTANCE } = options;

    this.closeEdgeDistance = closeEdgeDistance;

    this.styles = ref(DEFAULT_SYSTEM_COMMON_STYLES);
    this.updateStyles(styles);

    this._unwatch = watch(this.observeList, () => {
      this.triggerUpdate();
    });
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
