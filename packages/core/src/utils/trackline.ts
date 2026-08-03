import { Application, Container, Graphics, Sprite, Text as PixiText, Assets } from "pixi.js";

import type {
  AudioTrackItem,
  ImageTrackItem,
  TrackItem,
  TrackLine,
  TrackLineContext,
  TrackLineStyles,
  VideoTrackItem,
} from "@/types/trackline";

import {
  DEFAULT_AUDIO_COLUMN_SPACING,
  DEFAULT_AUDIO_COLUMN_WIDTH,
  DEFAULT_COMMON_TRACK_COLOR,
  DEFAULT_COMMON_TRACK_HEIGHT,
  DEFAULT_ICON_SIZE,
  DEFAULT_TRACK_COLOR,
  DEFAULT_TRACKLINE_MARGIN_LEFT,
  DEFAULT_TRACKLINE_MARGIN_TOP,
  DYNC_AUDIO_BAR_HEIGHT,
  START_AUDIO_BAR_HEIGHT,
} from "@/config/constant";

import { formatSeconds } from "./tools";

export function buildTrackLine(
  trackline: TrackLine,
  app: Application,
  ctx: TrackLineContext,
  styles: Partial<TrackLineStyles>,
  tracklineTopOffset: number = 0,
  container: Container = new Container(),
  iconSprite: Sprite = new Sprite(),
  backgroundGraphics: Graphics = new Graphics(),
  tracklineContainer: Container = new Container(),
  trackitems: Container[] = [],
) {
  // 先做清理
  container.removeChildren();
  backgroundGraphics.clear();
  trackitems.forEach((trackitem) => trackitem.destroy());
  trackitems.splice(0);

  const {
    marginTop = DEFAULT_TRACKLINE_MARGIN_TOP,
    marginLeft = DEFAULT_TRACKLINE_MARGIN_LEFT,
    trackHeights,
  } = ctx;
  const {
    iconColor = "#888888",
    iconSize = DEFAULT_ICON_SIZE,
    backgroundColor = "#383838",
  } = styles;

  const { type } = trackline;
  const trackHeight = trackHeights[type] || DEFAULT_COMMON_TRACK_HEIGHT;

  container.position.set(0, marginTop + tracklineTopOffset);
  container.height = trackHeight;
  container.width = app.screen.width;

  // 设置图标样式
  iconSprite.tint = iconColor;
  iconSprite.anchor.set(0.5);
  iconSprite.width = iconSize;
  iconSprite.height = iconSize;
  iconSprite.position.set(marginLeft / 2, trackHeight / 2);
  container.addChild(iconSprite);

  const visibleWidth = app.screen.width - marginLeft;
  const visibleHeight = trackHeight;

  // 设定轨道容器样式
  tracklineContainer.position.set(marginLeft, 0);
  tracklineContainer.height = visibleHeight;
  tracklineContainer.width = visibleWidth;
  container.addChild(tracklineContainer);

  // 绘制轨道背景
  backgroundGraphics.rect(0, 0, visibleWidth, visibleHeight).fill(backgroundColor);
  tracklineContainer.addChild(backgroundGraphics);

  // 绘制轨道片段
  for (let i = 0; i < trackline.data.length; i++) {
    const trackitem = trackline.data[i];
    const trackitemContainer = buildTrackItem(trackitem, ctx, styles);
    trackitems.push(trackitemContainer);
  }
  if (trackitems.length) tracklineContainer.addChild(...trackitems);

  return {
    container,
    iconSprite,
    backgroundGraphics,
    tracklineContainer,
    trackitems,
  };
}

export function buildTrackItem(
  trackitem: TrackItem,
  ctx: TrackLineContext,
  styles: Partial<TrackLineStyles>,
) {
  const { trackHeights } = ctx;
  const { trackItemColors = DEFAULT_TRACK_COLOR } = styles;
  const { type, start, end, name } = trackitem;

  const trackHeight = trackHeights[type] || DEFAULT_COMMON_TRACK_HEIGHT;
  const itemColor = trackItemColors[type] || DEFAULT_COMMON_TRACK_COLOR;
  const fps = 30,
    framesPerGap = 9,
    gapWidth = 17.9999999;
  const fromPx = ((start * fps) / framesPerGap) * gapWidth;
  const toPx = ((end * fps) / framesPerGap) * gapWidth;
  const itemWidthPx = toPx - fromPx;

  const trackitemContainer = new Container();
  trackitemContainer.position.set(fromPx, 0);
  trackitemContainer.width = itemWidthPx;
  trackitemContainer.height = trackHeight;

  const mask = new Graphics().roundRect(0, 0, itemWidthPx, trackHeight, 4).fill(0xffffff);
  trackitemContainer.addChild(mask);
  trackitemContainer.mask = mask;

  const graphics = new Graphics();
  graphics.roundRect(0, 0, itemWidthPx, trackHeight, 4).fill(itemColor);
  trackitemContainer.addChild(graphics);

  const text = new PixiText({
    text: `${name} | ${formatSeconds(end - start)}`,
    style: { fontSize: 12, fill: 0xffffff },
  });
  text.position.set(5, 2);
  trackitemContainer.addChild(text);

  if (type === "image" || type == "video") {
    buildPicPreview(trackitemContainer, trackitem, itemWidthPx, trackHeight, framesPerGap);
  }

  if (type === "audio" || type === "video") {
    buildAudioPreview(trackitemContainer, trackitem, itemWidthPx, trackHeight, fps);
  }

  return trackitemContainer;
}

export function buildPicPreview(
  trackitemContainer: Container,
  trackitem: VideoTrackItem | ImageTrackItem,
  itemWidthPx: number,
  trackHeight: number,
  framesPerGap: number,
) {
  const { type, previewList = [], originWidth, originHeight } = trackitem;
  const previewHeight = trackHeight - 30;
  const previewWidth = (originWidth / originHeight) * previewHeight;

  const picPreviewLineBg = new Graphics();
  picPreviewLineBg.rect(0, 20, itemWidthPx, previewHeight).fill("#80808080");
  trackitemContainer.addChild(picPreviewLineBg);

  if (!previewList.length || !previewWidth) return;
  const previewFrameCount = Math.ceil(itemWidthPx / previewWidth);
  if (!previewFrameCount) return;
  if (type === "video") {
    buildVideoPicPreview(
      trackitemContainer,
      trackitem,
      previewFrameCount,
      previewWidth,
      previewHeight,
      itemWidthPx,
    );
  } else if (type === "image") {
    buildImagePicPreview(
      trackitemContainer,
      trackitem,
      previewFrameCount,
      previewWidth,
      previewHeight,
      itemWidthPx,
      framesPerGap,
    );
  }
}

export function buildVideoPicPreview(
  trackitemContainer: Container,
  trackitem: VideoTrackItem,
  previewFrameCount: number,
  previewWidth: number,
  previewHeight: number,
  itemWidthPx: number,
) {
  const { duration, clipStart, clipEnd, previewList = [] } = trackitem;

  const picPreview = new Graphics();
  const drawData = [];
  const frameCount = Math.floor(duration * 30);
  const dataFrom = Math.floor(clipStart * 30);
  const dataTo = Math.floor(frameCount - clipEnd * 30);
  const stepGo = (dataTo - dataFrom) / previewFrameCount;

  for (let i = dataFrom; i < dataTo + stepGo; i += stepGo) {
    let data = previewList[Math.floor(i)];
    if (!data) data = previewList[dataTo - 1] || previewList[previewList.length - 1];
    drawData.push(data);
  }

  if (!drawData.length) return;

  drawData.forEach((url, index) => {
    const x = index * previewWidth;
    if (x > itemWidthPx || x < -previewWidth) return;
    Assets.load(url).then((texture) => {
      picPreview.texture(texture, 0xffffff, x, 20, previewWidth, previewHeight);
    });
  });

  trackitemContainer.addChild(picPreview);
}

export function buildImagePicPreview(
  trackitemContainer: Container,
  trackitem: ImageTrackItem,
  previewFrameCount: number,
  previewWidth: number,
  previewHeight: number,
  itemWidthPx: number,
  framesPerGap: number,
) {
  const { previewList = [], gif } = trackitem;
  const picPreview = new Graphics();
  const drawData = [];
  if (gif) {
    const loopList = previewList.filter((_, index) => index % framesPerGap === 0);
    const repeatCount = Math.ceil(previewFrameCount / loopList.length);
    drawData.push(...Array<string[]>(repeatCount).fill(loopList).flat());
  } else {
    drawData.push(...Array<string>(previewFrameCount).fill(previewList[0]));
  }

  if (!drawData.length) return;

  drawData.forEach((url, index) => {
    const x = index * previewWidth;
    if (x > itemWidthPx || x < -previewWidth) return;
    Assets.load(url).then((texture) => {
      picPreview.texture(texture, 0xffffff, x, 20, previewWidth, previewHeight);
    });
  });

  trackitemContainer.addChild(picPreview);
}

export function buildAudioPreview(
  trackitemContainer: Container,
  trackitem: VideoTrackItem | AudioTrackItem,
  itemWidthPx: number,
  trackHeight: number,
  fps: number,
) {
  const { type, audioData, clipStart, clipEnd, duration } = trackitem;
  const audioPreview = new Graphics();

  // 根据展示宽度提取音频数据值，计算音频柱的个数
  const audioBarCount = Math.floor(
    itemWidthPx / (DEFAULT_AUDIO_COLUMN_WIDTH + DEFAULT_AUDIO_COLUMN_SPACING),
  );
  const frameCount = Math.floor(duration * fps);
  const dataFrom = Math.floor(clipStart * 30);
  const dataTo = Math.floor(frameCount - clipEnd * 30);
  const stepGo = (dataTo - dataFrom) / audioBarCount;
  const drawData = [];
  for (let i = dataFrom; i < dataTo + stepGo; i += stepGo) {
    let data = audioData[Math.round(i)];
    if (data == null) data = audioData[dataTo - 1] || 0;
    drawData.push(data);
  }
  if (!drawData.length) return;

  // 绘制音频柱
  drawData.forEach((data, index) => {
    const x = Math.round(index * (DEFAULT_AUDIO_COLUMN_WIDTH + DEFAULT_AUDIO_COLUMN_SPACING));
    let barHeight = Math.round(data * DYNC_AUDIO_BAR_HEIGHT + START_AUDIO_BAR_HEIGHT);
    if (type == "audio") barHeight *= 2;
    if (barHeight <= 0) return;
    // 绘制矩形柱子
    audioPreview
      .moveTo(x + DEFAULT_AUDIO_COLUMN_WIDTH, trackHeight)
      .lineTo(x + DEFAULT_AUDIO_COLUMN_WIDTH, trackHeight - barHeight)
      .stroke({ color: 0xffffff, width: DEFAULT_AUDIO_COLUMN_WIDTH });
  });

  trackitemContainer.addChild(audioPreview);
}
