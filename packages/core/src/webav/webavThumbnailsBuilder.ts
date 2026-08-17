/**
 * WebAV 缩略图构建器
 */

import type { ImgClip, MP4Clip } from "@webav/av-cliper";

import type { ImageTrackItem, TrackItem, VideoTrackItem } from "@/types/trackline";
import type { MediaClip, WebavThumbnailsBuilderFunction } from "@/types/webav";

import { MAX_PREVIEW_SIZE } from "@/config/constant";
import { getResizeImageBlob } from "@/utils/tools";

/**
 * 获取图像轨道项缩略图（支持静态图片和 GIF）
 * @param clip - 媒体片段实例
 * @param trackItem - 图像轨道项配置
 * @returns 返回缩略图 URL 数组的 Promise
 */
export const getImageThumbnails = async (clip: MediaClip, trackItem: TrackItem) => {
  const { gif, originWidth, originHeight } = trackItem as ImageTrackItem;

  // GIF 动画：逐帧提取缩略图
  if (gif) {
    const frames = [];
    let time = 0;
    const end = clip.meta.duration;

    if (end === Infinity) return [];

    const targetWidth = MAX_PREVIEW_SIZE;
    const targetHeight = (originHeight / originWidth) * targetWidth;

    // 每 33ms（约30fps）提取一帧
    while (time <= end) {
      const { video } = await (clip as ImgClip).tick(time);
      frames.push(URL.createObjectURL(await getResizeImageBlob(video, targetWidth, targetHeight)));
      time += 33000;
    }
    return frames;
  } else {
    // 静态图片：只提取第一帧
    const { video } = await (clip as ImgClip).tick(0);
    const targetWidth = MAX_PREVIEW_SIZE;
    const targetHeight = (originHeight / originWidth) * targetWidth;
    const imageBlob = await getResizeImageBlob(video, targetWidth, targetHeight);
    return [URL.createObjectURL(imageBlob)];
  }
};

/**
 * 获取视频轨道项缩略图
 * @param clip - 媒体片段实例
 * @param trackItem - 视频轨道项配置
 * @returns 返回缩略图 URL 数组的 Promise
 */
export const getVideoThumbnails = async (clip: MediaClip, trackItem: TrackItem) => {
  const { duration } = trackItem as VideoTrackItem;

  if (!clip) return [];

  // 使用 WebAV 内置方法生成视频缩略图
  const frames = await (clip as MP4Clip).thumbnails(100, {
    start: 0,
    end: duration * 1e6,
    step: 33000,
  });

  return frames.map((item) => URL.createObjectURL(item.img));
};

/**
 * WebAV 缩略图构建器类
 */
export class WebavThumbnailsBuilder {
  private builders: Record<string, WebavThumbnailsBuilderFunction | undefined> = {
    video: getVideoThumbnails,
    image: getImageThumbnails,
    text: getImageThumbnails,
  };

  /**
   * 构建缩略图
   * @param clip - 媒体片段实例
   * @param trackItem - 轨道项配置
   * @returns 返回缩略图 URL 数组的 Promise
   */
  public buildThumbnails(clip: MediaClip, trackItem: TrackItem) {
    const builder = this.builders[trackItem.type];
    if (!builder) return Promise.resolve([] as string[]);
    return builder(clip, trackItem);
  }
}
