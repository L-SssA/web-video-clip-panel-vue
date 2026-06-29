// 主轨道的 ID
export const MainTrackId = "main-line-001";

// 轨道高度
export const TrackLineHeightMap = {
  video: 64,
  audio: 46,
  text: 22,
  image: 64,
};

// 轨道颜色
export const TrackColorMap = {
  video: "#4A90E2",
  audio: "#3A8F7B",
  text: "#A83245",
  image: "#A57DBB",
};

// 自动吸附距离（px）
export const AutoAdsorbWidth = 10;

export const ChromakeyOptions = {
  keyColor: [0, 135, 60] as [number, number, number],
  similarity: 0.3,
  smoothness: 0.05,
};

// 相当于一个改变时间轴间隔配置的断点
export const TimelineGapOptions = [
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

// 抽帧最大宽高（之一）
export const MaxPreviewSize = 900;
