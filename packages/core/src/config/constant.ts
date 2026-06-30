// 主轨道的 ID
export const MAIN_TRACK_ID = "main-line-001";

// 轨道高度
export const DEFAULT_TRACK_HEIGHT = {
  video: 64,
  audio: 46,
  text: 22,
  image: 64,
};

// 轨道颜色
export const DEFAULT_TRACK_COLOR = {
  video: "#4A90E2",
  audio: "#3A8F7B",
  text: "#A83245",
  image: "#A57DBB",
};

// 自动吸附距离（px）
export const AUTO_ADSORB_WIDTH = 10;

// 扣绿选项
export const DEFAULT_CHROMAKEY_OPTIONS = {
  keyColor: [0, 255, 0] as [number, number, number],
  similarity: 0.4,
  smoothness: 0.05,
  spill: 0.05,
};

// 相当于一个改变时间轴间隔配置的断点
export const TIMELINE_GAP_OPTIONS = [
  { breakPoint: 0.5, count: 10, frames: 60 },
  { breakPoint: 1, count: 10, frames: 30 },
  { breakPoint: 1.5, count: 10, frames: 15 },
  { breakPoint: 3, count: 10, frames: 9 },
  { breakPoint: 5, count: 10, frames: 6 },
  { breakPoint: 10, count: 10, frames: 3 },
  { breakPoint: 20, count: 5, frames: 3 },
  { breakPoint: 25, count: 10, frames: 1 },
  { breakPoint: 32, count: 5, frames: 1 },
  { breakPoint: 40, count: 3, frames: 1 },
  { breakPoint: Infinity, count: 2, frames: 1 }, // 默认值
];

// 抽帧最大宽度（px）
export const MAX_PREVIEW_SIZE = 100;
