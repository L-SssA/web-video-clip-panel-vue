export interface ToolConfig {
  name: string;
  icon: string;
  tips?: string;
  onclick: () => void;
}
export const leftToolConfigs: ToolConfig[] = [
  {
    name: "undo",
    icon: "ri-arrow-go-back-fill",
    tips: "撤销（'Ctrl' + 'Z'键）",
    onclick: () => console.log("undo"),
  },
  {
    name: "redo",
    icon: "ri-arrow-go-forward-fill",
    tips: "重做（'Ctrl' + 'Y'键）",
    onclick: () => console.log("redo"),
  },
  {
    name: "delete",
    icon: "ri-delete-bin-6-line",
    tips: "删除（'Delete'键）",
    onclick: () => console.log("delete"),
  },
  {
    name: "copy",
    icon: "ri-file-copy-fill",
    tips: "复制",
    onclick: () => console.log("delete"),
  },
  {
    name: "copy",
    icon: "ri-file-copy-fill",
    tips: "复制",
    onclick: () => console.log("delete"),
  },
  {
    name: "cut",
    icon: "ri-scissors-cut-fill",
    tips: "裁剪",
    onclick: () => console.log("cut"),
  },
  {
    name: "mute",
    icon: "ri-volume-mute-line",
    tips: "声音",
    onclick: () => console.log("mute"),
  },
  {
    name: "replace",
    icon: "ri-picture-in-picture-2-line",
    tips: "替换资源",
    onclick: () => console.log("replace"),
  },
];

export const centerToolConfigs: ToolConfig[] = [
  {
    name: "play",
    icon: "ri-play-large-line",
    tips: "播放",
    onclick: () => console.log("play"),
  },
];

export const rightToolConfigs: ToolConfig[] = [
  {
    name: "autoAdsorb",
    icon: "ri-stacked-view",
    tips: "自动吸附",
    onclick: () => console.log("autoAdsorb"),
  },
  {
    name: "zoomOut",
    icon: "ri-indeterminate-circle-line",
    tips: "缩小轨道（'ctrl'键 + '-'键/鼠标滚轮向下）",
    onclick: () => console.log("zoomOut"),
  },
  {
    name: "zoomIn",
    icon: "ri-add-circle-line",
    tips: "放大轨道（'ctrl'键 + '+'键/鼠标滚轮向上）",
    onclick: () => console.log("zoomIn"),
  },
];
