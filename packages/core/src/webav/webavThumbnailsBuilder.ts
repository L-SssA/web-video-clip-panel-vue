/**
 * WebAV 缩略图构建器
 */

import type { ImgClip, MP4Clip } from "@webav/av-cliper";

import type { ImageTrackItem, TrackItem, VideoTrackItem } from "@/types/data";
import type { MediaClip } from "@/types/webav";

import { MAX_PREVIEW_SIZE } from "@/config/constant";
import { getResizeImageBlob } from "@/utils/tools";

/**
 * WebAV 缩略图构建器类
 */
export class WebavThumbnailsBuilder {
  /**
   * 获取图像轨道项缩略图（支持静态图片和 GIF）
   * @param clip - 媒体片段实例
   * @param trackitem - 图像轨道项配置
   * @returns 返回缩略图 URL 数组的 Promise
   */
  async getImageThumbnails(clip: MediaClip, trackitem: ImageTrackItem, fps: number) {
    const { gif, originWidth, originHeight } = trackitem;

    // GIF 动画：逐帧提取缩略图
    if (gif) {
      const frames = [];
      let time = 0;
      const end = clip.meta.duration;

      if (end === Infinity) return [];

      const targetWidth = MAX_PREVIEW_SIZE;
      const targetHeight = (originHeight / originWidth) * targetWidth;

      while (time <= end) {
        const { video } = await (clip as ImgClip).tick(time);
        frames.push(
          URL.createObjectURL(await getResizeImageBlob(video, targetWidth, targetHeight)),
        );
        time += Math.floor(1e6 / fps);
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
  }

  /**
   * 获取视频轨道项缩略图
   * @param clip - 媒体片段实例
   * @param trackitem - 视频轨道项配置
   * @returns 返回缩略图 URL 数组的 Promise
   */
  async getVideoThumbnails(clip: MediaClip, trackitem: VideoTrackItem, fps: number) {
    const { duration } = trackitem;

    if (!clip) return [];

    // 使用 WebAV 内置方法生成视频缩略图
    const frames = await (clip as MP4Clip).thumbnails(100, {
      start: 0,
      end: duration * 1e6,
      step: Math.floor(1e6 / fps),
    });

    return frames.map((item) => URL.createObjectURL(item.img));
  }

  /**
   * 构建缩略图
   * @param clip - 媒体片段实例
   * @param trackitem - 轨道项配置
   * @returns 返回缩略图 URL 数组的 Promise
   */
  async buildThumbnails(clip: MediaClip, trackitem: TrackItem, fps: number) {
    switch (trackitem.type) {
      case "video":
        return this.getVideoThumbnails(clip, trackitem, fps);
      case "image":
        return this.getImageThumbnails(clip, trackitem, fps);
      default:
        return [] as string[];
    }
  }
}
