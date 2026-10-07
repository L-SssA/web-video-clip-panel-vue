import type { DataManager } from "@/managers/DataManager";
import type { ImageTrackItem, VideoTrackItem, AudioTrackItem } from "@/types/data";

import { SimpleScheduler, type Task } from "./scheduler";
import { timeToPixel } from "./tools";

const drawScheduler = new SimpleScheduler();

/**
 * 绘制图像预览
 * @param data 数据源
 * @param dataCtx 数据管理器上下文
 * @param renderCtx 渲染上下文
 * @returns void
 */
export function drawImagePreview(
  data: VideoTrackItem | ImageTrackItem,
  dataManager: DataManager,
  renderCtx: CanvasRenderingContext2D,
) {
  // 清空画布
  const { width: viewWidth, height: viewHeight } = renderCtx.canvas;
  renderCtx.clearRect(0, 0, viewWidth, viewHeight);
  // 清空绘制任务
  drawScheduler.delete(data.id);

  // 绘制新内容
  const { originWidth, originHeight } = data;
  const { trackHeights, audioBarHeight } = dataManager.ctx.trackline;
  const previewHeight = trackHeights[data.type] - audioBarHeight - 20;
  const previewWidth = (originWidth / originHeight) * previewHeight;
  if (!previewWidth) return;

  // 获取绘制的时间点列表
  const timePoints = getTimePointList(data, dataManager, viewWidth, previewWidth);

  if (!timePoints.length) return;

  // 绘制预览列表
  const taskList = [] as Task[];
  timePoints.forEach((time, index) => {
    const x = index * previewWidth;
    if (x > viewWidth) return;
    const task = async () => {
      const { video } = (await dataManager.webav.tick(data, Math.ceil(time * 1e6))) || {};
      if (!video) return;
      renderCtx.drawImage(video, x, 0, previewWidth, viewHeight);
      video.close();
    };
    taskList.push(task);
  });
  drawScheduler.add(taskList, data.id);
}

/**
 * 计算需要绘制的时间点列表
 * @param data 数据源
 * @param dataCtx 数据管理器上下文
 * @param targetFrameCount 目标帧数
 * @param gif 是否是gif
 * @returns 绘制列表
 */
export function getTimePointList(
  data: VideoTrackItem | ImageTrackItem,
  dataManager: DataManager,
  viewWidth: number,
  previewWidth: number,
) {
  const { framesPerGap, fps, gapWidth } = dataManager.ctx.timeline;
  const { type, clipStart, clipEnd } = data;

  const targetFrameCount = Math.ceil(viewWidth / previewWidth);
  if (!targetFrameCount) return [];

  const meta = dataManager.webav.getClipMeta(data.id);
  if (!meta) return [];

  if (type === "image" && meta.duration && meta.duration !== Infinity) {
    // gif动图循环
    const seconds = Math.ceil((meta.duration / 1e6) * 100) / 100;
    const loopFrameCount = Math.ceil(
      timeToPixel(meta.duration / 1e6, fps, framesPerGap, gapWidth) / previewWidth,
    );
    const loopList = Array<number>(loopFrameCount)
      .fill(0)
      .map((_, idx) => Math.ceil(idx * (seconds / loopFrameCount) * 100) / 100);
    const repeatCount = targetFrameCount / loopList.length;
    return Array<number[]>(repeatCount).fill(loopList).flat();
  } else if (type === "image") {
    // 静态图片
    return Array<number>(targetFrameCount + 1).fill(0);
  } else {
    // 视频平铺
    const seconds = Math.ceil((meta.duration / 1e6) * 100) / 100;
    const timeFrom = Math.floor(clipStart);
    const timeTo = Math.floor(seconds - clipEnd);
    const stepGo = (timeTo - timeFrom) / targetFrameCount;

    return Array<number>(targetFrameCount + 1)
      .fill(0)
      .map((_, idx) => Math.ceil((timeFrom + idx * stepGo) * 100) / 100);
  }
}

/**
 * 绘制音频预览
 * @param data 数据源
 * @param dataCtx 数据管理器上下文
 * @param renderCtx 渲染上下文
 * @returns void
 */
export function drawAudioPreview(
  data: VideoTrackItem | AudioTrackItem,
  dataManager: DataManager,
  renderCtx: CanvasRenderingContext2D,
) {
  // 清空画布
  const { width: viewWidth, height: viewHeight } = renderCtx.canvas;
  renderCtx.clearRect(0, 0, viewWidth, viewHeight);

  // 绘制新内容
  const { fps } = dataManager.ctx.timeline;
  const { audioBarWidth, audioBarSpacing } = dataManager.ctx.trackline;
  const { audioData, clipStart, clipEnd, duration } = data;
  if (!audioData || !audioData.length) return;

  // 获取绘制列表
  // 获取
  let dataCount = 0;
  if ("duration" in data) dataCount = data.duration * fps;
  else dataCount = Math.floor(duration * fps);
  // 可容纳的音频柱数量
  const targetAudioBarCount = Math.floor(viewWidth / (audioBarWidth + audioBarSpacing));
  const dataFrom = Math.floor(clipStart * fps);
  const dataTo = Math.floor(dataCount - clipEnd * fps);
  const stepGo = (dataTo - dataFrom) / targetAudioBarCount;
  const drawList = [];
  for (let i = dataFrom; i < dataTo; i += stepGo) {
    let data = audioData[Math.round(i)];
    if (data === undefined) data = audioData[dataTo - 1];
    drawList.push(data);
  }

  // 从第几个音频柱开始绘制
  const dyncAudioBarHeight = viewHeight * 0.5; // 音频柱可变化的高度
  const startAudioBarHeight = viewHeight * 0.5; // 音频柱0值高度

  if (!drawList.length) return;
  drawList.forEach((value, index) => {
    const barHeight = Math.round(value * dyncAudioBarHeight + startAudioBarHeight);
    const x = Math.round(index * (audioBarWidth + audioBarSpacing));
    const y = Math.round(dyncAudioBarHeight - barHeight + startAudioBarHeight);
    if (x > viewWidth) return;
    // 设置柱子的颜色
    renderCtx.fillStyle = "#ffffff";
    // 绘制矩形柱子
    renderCtx.fillRect(x, y, audioBarWidth, barHeight);
  });
}
