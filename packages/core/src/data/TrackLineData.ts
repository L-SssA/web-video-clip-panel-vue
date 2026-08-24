import type { ComputedRef, Ref } from "vue";

import { renderTxt2ImgBitmap, type AudioClip, type ImgClip, type MP4Clip } from "@webav/av-cliper";
import { computed, nextTick, ref, watch } from "vue";

import type {
  AudioTrackItem,
  ImageTrackItem,
  TextTrackItem,
  TrackItem,
  TrackLineContext,
  TrackLineDataOptions,
  TrackLineStyles,
  VideoTrackItem,
} from "@/types/trackline";
import type {
  AudioTrackLine,
  pictureTrackLine,
  VideoTrackLine,
  TrackLine,
} from "@/types/trackline";

import {
  DEFAULT_TRACK_HEIGHTS,
  DEFAULT_TRACKLINE_GAP_HEIGHT,
  DEFAULT_TRACKLINE_MARGIN_LEFT,
  DEFAULT_TRACKLINE_MARGIN_TOP,
  DEFAULT_TRACKLINE_STYLES,
  MAIN_TRACK_ID,
} from "@/config/constant";
import {
  defineAudioTrackItemConfig,
  defineImageTrackItemConfig,
  defineTextTrackItemConfig,
  defineTrackLineConfig,
  defineVideoTrackItemConfig,
} from "@/utils/trackline";
import WebavHelper from "@/webav/webavHelper";

import { BaseData } from "./BaseData";

export class TrackLineData extends BaseData {
  // 画面轨道列表
  private pictureTrackLineList = ref<pictureTrackLine[]>([]);
  // 主轨道（video track）
  private mainTrackLine = ref<VideoTrackLine>({
    id: MAIN_TRACK_ID,
    type: "video",
    data: [],
    main: true,
    mute: false,
  });
  // 音频轨道列表
  private audioTrackLineList = ref<AudioTrackLine[]>([]);
  // 按类型顺序排列轨道
  readonly mergeTrackLineList: ComputedRef<TrackLine[]>;

  // 轨道默认上边距
  readonly marginTop: number;
  // 轨道默认行间距
  readonly gapHeight: number;
  // 轨道默认左侧偏移量
  readonly marginLeft: number;

  // 样式
  readonly styles: Ref<TrackLineStyles>;

  // 监听器，用于停止watch
  private unwatch: Function;
  private trackHeights: Record<string, number>;

  // webav 相关音视频解码工具
  private webavHelper: WebavHelper;
  // 当前活跃的轨道
  public activeTrackLine: TrackLine | null = null;
  // 当前活跃的轨道片段
  public activeTrackItem: TrackItem | null = null;

  get ctx(): TrackLineContext {
    return {
      mergeTrackLineList: this.mergeTrackLineList.value,
      marginTop: this.marginTop,
      gapHeight: this.gapHeight,
      marginLeft: this.marginLeft,
      trackHeights: this.trackHeights,
      styles: this.styles.value,
    };
  }

  get observeList(): Ref[] {
    return [this.mergeTrackLineList, this.styles];
  }

  constructor(options: Partial<TrackLineDataOptions> = {}) {
    super();

    const { webav: webavOptions } = options;
    // 音视频解码
    this.webavHelper = new WebavHelper(webavOptions);

    const {
      marginTop = DEFAULT_TRACKLINE_MARGIN_TOP,
      gapHeight = DEFAULT_TRACKLINE_GAP_HEIGHT,
      marginLeft = DEFAULT_TRACKLINE_MARGIN_LEFT,
      trackHeights = DEFAULT_TRACK_HEIGHTS,
      styles,
    } = options;

    this.marginTop = marginTop;
    this.gapHeight = gapHeight;
    this.marginLeft = marginLeft;

    this.trackHeights = { ...DEFAULT_TRACK_HEIGHTS, ...trackHeights };
    this.styles = ref(DEFAULT_TRACKLINE_STYLES);
    this.updateStyles(styles);

    // 所有轨道合并，用于显示
    this.mergeTrackLineList = computed(() => [
      ...this.pictureTrackLineList.value,
      this.mainTrackLine.value,
      ...this.audioTrackLineList.value,
    ]);

    this.unwatch = watch(this.observeList, () => {
      this.updateEvent.triggerEvent(this.ctx);
    });
  }

  /**
   * 更新样式
   * @param styles
   */
  updateStyles(styles: Partial<TrackLineStyles> = {}): void {
    this.styles.value = { ...this.styles.value, ...styles };
  }

  /**
   * 获取最长轨道的时长
   * @returns
   */
  getLongestTracklineSecond(): number {
    if (this.mergeTrackLineList.value.length > 0) {
      return this.mergeTrackLineList.value.reduce((max, trackLine) => {
        return Math.max(
          max,
          trackLine.data.reduce((max, item) => Math.max(max, item.end), 0),
        );
      }, 0);
    }
    return 0;
  }

  /**
   * 添加轨道数据
   * @param trackItem
   */
  private addToTrackLine<T extends TrackItem>(trackItem: T): void {
    const duration = trackItem.end - trackItem.start || 5;
    if (this.activeTrackLine && this.activeTrackLine.type === trackItem.type) {
      // 如果当前活跃轨道与当前添加的轨道类型相同，则将数据添加到当前轨道
      trackItem.parentId = this.activeTrackLine.id;
      trackItem.start = Math.max(...this.activeTrackLine.data.map((item) => item.end), 0);
      trackItem.end = trackItem.start + duration;
      this.activeTrackLine.data.push(trackItem);
      nextTick(() => (this.activeTrackItem = trackItem));
    } else {
      // 如果当前活跃轨道与当前添加的轨道类型不同，则创建新的轨道
      const newTrackLine = defineTrackLineConfig<T>(trackItem.type);
      trackItem.parentId = newTrackLine.id;
      newTrackLine.data.push(trackItem);
      if (newTrackLine.type === "audio") {
        this.audioTrackLineList.value.push(newTrackLine as AudioTrackLine);
      } else {
        this.pictureTrackLineList.value.push(newTrackLine as pictureTrackLine);
      }
      trackItem.end = trackItem.start + duration;
      this.activeTrackLine = newTrackLine;
      nextTick(() => (this.activeTrackItem = trackItem));
    }
  }

  /**
   * 添加MP4源
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  async addMP4Source(
    source: string,
    opts: Partial<VideoTrackItem> = {},
  ): Promise<{ object: VideoTrackItem; clip: MP4Clip }> {
    // 创建空的轨道数据
    const emptyData = defineVideoTrackItemConfig();
    emptyData.source = source;

    // 解码视频获取元数据
    const clip = await this.webavHelper.loadClip(emptyData, source);
    if (!clip) throw new Error("加载资源失败");
    const videoMeta = clip.meta;
    emptyData.originWidth = videoMeta.width;
    emptyData.originHeight = videoMeta.height;
    emptyData.start = 0;
    emptyData.fps = 30;
    emptyData.duration = videoMeta.duration / 1e6;
    emptyData.end = videoMeta.duration / 1e6;
    emptyData.frameCount = Math.floor(30 * emptyData.duration);
    Object.assign(emptyData, opts);

    // 添加轨道数据
    this.addToTrackLine(emptyData);

    return { object: emptyData, clip: clip as MP4Clip };
  }

  /**
   * 添加图片资源
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  // 添加图片资源
  async addImageSource(
    source: string,
    opts: Partial<ImageTrackItem> = {},
  ): Promise<{ object: ImageTrackItem; clip: ImgClip }> {
    // 创建空的轨道数据
    const emptyData = defineImageTrackItemConfig();
    emptyData.source = source;

    // 解码图片获取元数据
    const clip = await this.webavHelper.loadClip(emptyData, source);
    if (!clip) throw new Error("加载资源失败");
    const imageMeta = clip.meta;
    emptyData.originWidth = imageMeta.width;
    emptyData.originHeight = imageMeta.height;
    emptyData.start = 0;
    emptyData.end = 5;
    Object.assign(emptyData, opts);

    // 添加轨道数据
    this.addToTrackLine(emptyData);

    return { object: emptyData, clip: clip as ImgClip };
  }

  /**
   * 添加音频资源
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  async addAudioSource(
    source: string,
    opts: Partial<AudioTrackItem> = {},
  ): Promise<{ object: AudioTrackItem; clip: AudioClip }> {
    // 创建空的轨道数据
    const emptyData = defineAudioTrackItemConfig();
    emptyData.source = source;

    // 解码图片获取元数据
    const clip = await this.webavHelper.loadClip(emptyData, source);
    if (!clip) throw new Error("加载资源失败");
    const audioMeta = clip.meta;
    emptyData.duration = audioMeta.duration / 1e6;
    emptyData.start = 0;
    emptyData.end = audioMeta.duration / 1e6;
    Object.assign(emptyData, opts);

    // 添加轨道数据
    this.addToTrackLine(emptyData);

    return { object: emptyData, clip: clip as AudioClip };
  }

  /**
   * 添加文本
   * @param source
   * @param changeable
   * @param opts
   * @returns
   */
  async addTextSource(
    text: string,
    opts: Partial<TextTrackItem> = {},
  ): Promise<{ object: TextTrackItem; clip: ImgClip }> {
    // 创建空的轨道数据
    const emptyData = defineTextTrackItemConfig();

    // 解码图片获取元数据
    const source = await renderTxt2ImgBitmap(text, "font-size: 80px; color: red;");
    const clip = await this.webavHelper.loadClip(emptyData, source);
    if (!clip) throw new Error("加载资源失败");
    emptyData.text = text;
    emptyData.name = text;
    emptyData.loading = false;
    emptyData.start = 0;
    emptyData.end = 5;
    Object.assign(emptyData, opts);

    // 添加轨道数据
    this.addToTrackLine(emptyData);

    return { object: emptyData, clip: clip as ImgClip };
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unwatch();
    this.webavHelper.release();
    super.release();
  }
}
