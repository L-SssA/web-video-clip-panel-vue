import type { DataManager, TrackItem } from "@web-vcp/core";

/**
 * 根据轨道 trackitem 数据计算背景颜色
 * @param trackitem trackitem 数据
 * @param dataManager DataManager 数据管理器
 */
export function getBackgroundColor(trackitem: TrackItem, dataManager: DataManager) {
  return trackitem.changeable
    ? dataManager.trackline.trackitemColors[trackitem.type]
    : dataManager.trackline.trackitemColors["unknown"] || "#686868";
}
