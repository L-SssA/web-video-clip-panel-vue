import AudioIcon from "@/assets/images/AudioIcon.png";
import ImageIcon from "@/assets/images/ImageIcon.png";
import TextIcon from "@/assets/images/TextIcon.png";
import VideoIcon from "@/assets/images/VideoIcon.png";

/**************** 时间线配置 ****************/
// 相当于一个改变时间轴间隔配置的断点
export const TIMELINE_GAP_OPTIONS = [
  { breakPoint: 0.5, gaps: 10, frames: 60 },
  { breakPoint: 1, gaps: 10, frames: 30 },
  { breakPoint: 1.5, gaps: 10, frames: 15 },
  { breakPoint: 3, gaps: 10, frames: 9 },
  { breakPoint: 5, gaps: 10, frames: 6 },
  { breakPoint: 10, gaps: 10, frames: 3 },
  { breakPoint: 20, gaps: 5, frames: 3 },
  { breakPoint: 25, gaps: 10, frames: 1 },
  { breakPoint: 32, gaps: 5, frames: 1 },
  { breakPoint: 40, gaps: 3, frames: 1 },
  { breakPoint: Infinity, gaps: 2, frames: 1 }, // 默认值
];

// 默认时间线缩放
export const DEFAULT_TIMELINE_SCALE = 50;

// 默认帧率
export const DEFAULT_FPS = 30;

// 时间轴默认左侧偏移量（px）
export const DEFAULT_TIMELINE_MARGIN_LEFT = 64;

// 时间轴默认样式
export const DEFAULT_TIMELINE_STYLES = {
  lineColor: "#555555",
  lineWidth: 2,
  fontColor: "#888888",
  fontSize: 12,
  cursorLineColor: "#f5f5f5",
  cursorLineWidth: 2,
};

// 自动吸附距离（px）
export const AUTO_ADSORB_WIDTH = 10;

/**************** 轨道配置 ****************/
// 轨道默认上边距（px）
export const DEFAULT_TRACKLINE_MARGIN_TOP = 30;

// 轨道默认行间距（px）
export const DEFAULT_TRACKLINE_GAP_HEIGHT = 10;

// 主轨道的 ID
export const MAIN_TRACK_ID = Symbol("main-track-id");

// 默认图标源
export const DEFAULT_ICONS_SOURCES = {
  videoIcon: VideoIcon,
  audioIcon: AudioIcon,
  textIcon: TextIcon,
  imageIcon: ImageIcon,
} as Record<string, string>;

// 默认图标大小（px）
export const DEFAULT_ICON_SIZE = 26;

// 默认轨道左侧偏移量（px）
export const DEFAULT_TRACKLINE_MARGIN_LEFT = 64;

// 轨道高度
export const DEFAULT_TRACK_HEIGHTS = {
  video: 64,
  audio: 46,
  text: 22,
  image: 64,
};

// 通用轨道高度
export const DEFAULT_COMMON_TRACK_HEIGHT = 64;

// 轨道颜色
export const DEFAULT_TRACK_COLOR = {
  video: "#4A90E2",
  audio: "#3A8F7B",
  text: "#A83245",
  image: "#A57DBB",
};

// 通用轨道颜色
export const DEFAULT_COMMON_TRACK_COLOR = "#6d6d6d";

// 音频柱的宽度
export const DEFAULT_AUDIO_COLUMN_WIDTH = 2;

// 音频柱的间隔
export const DEFAULT_AUDIO_COLUMN_SPACING = 2;

// 音频柱可变化的高度
export const DYNC_AUDIO_BAR_HEIGHT = 10;

// 音频柱0值高度
export const START_AUDIO_BAR_HEIGHT = 0;

// 默认轨道样式
export const DEFAULT_TRACKLINE_STYLES = {
  icons: DEFAULT_ICONS_SOURCES,
  iconColor: "#888888",
  iconSize: DEFAULT_ICON_SIZE,
  backgroundColor: "#383838",
  trackItemColors: DEFAULT_TRACK_COLOR,
};

// 扣绿选项
export const DEFAULT_CHROMAKEY_OPTIONS = {
  keyColor: [0, 255, 0] as [number, number, number],
  similarity: 0.4,
  smoothness: 0.05,
  spill: 0.05,
};

// 抽帧最大宽度（px）
export const MAX_PREVIEW_SIZE = 100;
