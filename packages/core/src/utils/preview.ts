import { reactive } from "vue";

import type { DataManagerContext } from "@/types/data";
import type { ImageTrackItem, VideoTrackItem, AudioTrackItem } from "@/types/trackline";

/**
 * 绘制图像预览
 * @param data 数据源
 * @param dataCtx 数据管理器上下文
 * @param renderCtx 渲染上下文
 * @returns void
 */
export function drawImagePreview(
  data: VideoTrackItem | ImageTrackItem,
  dataCtx: DataManagerContext,
  renderCtx: CanvasRenderingContext2D,
) {
  // 清空画布
  const { width: viewWidth, height: viewHeight } = renderCtx.canvas;
  renderCtx.clearRect(0, 0, viewWidth, viewHeight);

  // 绘制新内容
  const { originWidth, originHeight } = data;
  const { trackHeights, audioBarHeight } = dataCtx.trackline;
  const previewHeight = trackHeights[data.type] - audioBarHeight - 20;
  const previewWidth = (originWidth / originHeight) * previewHeight;
  if (!previewWidth) return;

  const targetFrameCount = Math.ceil(viewWidth / previewWidth);
  if (!targetFrameCount) return;

  // 获取绘制列表
  const drawList = getDrawList(data, dataCtx, targetFrameCount, "gif" in data && data.gif);

  if (!drawList.length) reactive;
  // 绘制预览列表
  drawList.forEach((url, index) => {
    const x = index * previewWidth;
    if (x > viewWidth) return;
    const img = new Image();
    img.src = url;
    img.onload = function () {
      renderCtx.drawImage(img, x, 0, previewWidth, viewHeight);
      img.remove();
    };
  });
}

/**
 * 从数据源中计算出绘制列表
 * @param data 数据源
 * @param dataCtx 数据管理器上下文
 * @param targetFrameCount 目标帧数
 * @param gif 是否是gif
 * @returns 绘制列表
 */
export function getDrawList(
  data: VideoTrackItem | ImageTrackItem,
  dataCtx: DataManagerContext,
  targetFrameCount: number,
  gif: boolean,
) {
  const { framesPerGap, fps } = dataCtx.timeline;
  const { previewList = [], clipStart, clipEnd } = data;

  if (!previewList.length) return [];

  const drawList: string[] = [];
  if (gif) {
    // gif动图循环
    const loopList = previewList.filter((_, index) => index % framesPerGap === 0);
    const repeatCount = Math.ceil(targetFrameCount / loopList.length);
    drawList.push(...Array<string[]>(repeatCount).fill(loopList).flat());
  } else {
    // 单帧或多帧平铺
    let frameCount = 1;
    if ("frameCount" in data) frameCount = data.frameCount;

    const dataFrom = Math.floor(clipStart * fps);
    const dataTo = Math.floor(frameCount - clipEnd * fps);
    const stepGo = (dataTo - dataFrom) / targetFrameCount;

    for (let i = dataFrom; i < dataTo + stepGo; i += stepGo) {
      let data = previewList[Math.floor(i)];
      if (!data) data = previewList[dataTo - 1] || previewList[previewList.length - 1];
      drawList.push(data);
    }
  }

  return drawList;
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
  dataCtx: DataManagerContext,
  renderCtx: CanvasRenderingContext2D,
) {
  // 清空画布
  const { width: viewWidth, height: viewHeight } = renderCtx.canvas;
  renderCtx.clearRect(0, 0, viewWidth, viewHeight);

  // 绘制新内容
  const { fps } = dataCtx.timeline;
  const { audioBarWidth, audioBarSpacing } = dataCtx.trackline;
  const { audioData, clipStart, clipEnd, duration } = data;
  if (!audioData || !audioData.length) return;

  // 获取绘制列表
  // 获取
  let dataCount = 0;
  if ("frameCount" in data) dataCount = data.frameCount;
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
