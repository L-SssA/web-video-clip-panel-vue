import type {
  AudioTrackItem,
  BaseTrackItem,
  ImageTrackItem,
  SourceType,
  TextTrackItem,
  TrackItem,
  TrackLine,
  VideoTrackItem,
} from "@/types/trackline";

import { generateUUID } from "./tools";

/**
 * 生成一份基础轨道片段数据，包含基础的默认值
 * @param id 唯一 id
 * @param type 轨道类型
 * @returns 基础轨道片段数据
 */
export function defineBaseTrackItemConfig(id: string, type: SourceType): BaseTrackItem {
  return {
    id,
    parentId: "",
    type, // 资源类型
    name: "", // 资源名称
    start: 0,
    end: 0,
    changeable: true,
    reloadFlag: true,
    loading: true,
    ghost: false,
    clipStart: 0, // 裁剪开始时间
    clipEnd: 0, // 裁剪结束时间
  };
}

/**
 * 生成一份视频轨道片段数据，包含基础的默认值
 * @returns 视频轨道片段数据
 */
export function defineVideoTrackItemConfig(): VideoTrackItem {
  const id = generateUUID();
  const baseConfig = defineBaseTrackItemConfig(id, "video");
  baseConfig.name = "视频";
  return {
    ...baseConfig,
    type: "video",
    source: "", // 视频源
    audioSource: "", // 音频源
    previewListLoader: Promise.resolve([]), // 轨道预览图片加载器
    previewList: [], // 轨道预览图片
    audioDataLoader: Promise.resolve([]), // 轨道音频波形图加载器
    audioData: [],
    /* 视频信息 */
    originWidth: 0,
    originHeight: 0,
    fps: 30,
    frameCount: 0,
    previewDuration: 0,
    duration: 0,
    /* 配置项 */
    mute: false,
    volume: 1.0, // 音量
    enableChromaKey: false,
  };
}

/**
 * 生成一份音频轨道片段数据，包含基础的默认值
 * @returns 音频轨道片段数据
 */
export function defineAudioTrackItemConfig(): AudioTrackItem {
  const id = generateUUID();
  const baseConfig = defineBaseTrackItemConfig(id, "audio");
  baseConfig.name = "音频";
  return {
    ...baseConfig,
    type: "audio",
    source: "", // 音频源
    audioDataLoader: Promise.resolve([]), // 轨道音频波形图加载器
    audioData: [],
    /* 音频信息 */
    duration: 0,
    /* 配置项 */
    volume: 1.0, // 音量
    mute: false,
  };
}

/**
 * 生成一份文本轨道片段数据，包含基础的默认值
 * @returns 文本轨道片段数据
 */
export function defineTextTrackItemConfig(): TextTrackItem {
  const id = generateUUID();
  const baseConfig = defineBaseTrackItemConfig(id, "text");
  baseConfig.name = "文本";
  return {
    ...baseConfig,
    type: "text",
    text: "",
  };
}

/**
 * 生成一份图片轨道片段数据，包含基础的默认值
 * @returns 图片轨道片段数据
 */
export function defineImageTrackItemConfig(): ImageTrackItem {
  const id = generateUUID();
  const baseConfig = defineBaseTrackItemConfig(id, "image");
  baseConfig.name = "图片";
  return {
    ...baseConfig,
    type: "image",
    source: "", // 图片源
    previewListLoader: Promise.resolve([]), // 轨道预览图片加载器
    previewList: [],
    /* 图片信息 */
    gif: false,
    originWidth: 0,
    originHeight: 0,
  };
}

export function defineTrackLineConfig<T extends TrackItem = TrackItem>(
  type: SourceType,
  data: T[] = [],
): TrackLine<T> {
  return { id: generateUUID(), type, data };
}
