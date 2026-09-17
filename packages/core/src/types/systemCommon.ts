/**
 * 系统通用样式
 */
export interface SystemCommonStyles {
  color: string;
  colorLight: string;
  backgroundColor: string;
  colorActive: string;
}

/**
 * 轨道线上下文数据
 */
export interface SystemCommonContext {
  styles: SystemCommonStyles;
}

/**
 * 系统通用数据
 */
export interface SystemCommonDataOptions {
  styles: Partial<SystemCommonStyles>;
}
