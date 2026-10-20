import type { AudioClip, ImgClip, MP4Clip } from "@webav/av-cliper";

import { ref, type Ref } from "vue";

import type { TrackItem } from "@/types/data";

import { BaseService } from "./BaseService";

export class WebavPlayService extends BaseService {
  readonly playState: Ref<"playing" | "loading" | "paused"> = ref("paused");

  private _ctx: AudioContext = new AudioContext();
  private _sourceSet: Set<AudioBufferSourceNode> = new Set();
  // 播放开始时间（微秒）
  private _start: number = 0;
  // 播放结束时间（微秒）
  private _end: number = 0;
  // 播放间隔 1e6 / fps（微秒）
  private _step: number = 0;
  // 播放时间点（用于配合 AudioContext 进行音频播放）（秒）
  private _playAt: number = 0;
  // 当前渲染的时间点（微秒）
  private _renderTime: number = 0;
  // 渲染函数
  private _render?: (frames: (VideoFrame | ImageBitmap)[], time: number) => Promise<void>;
  // 首次循环标识
  private _firstLoop = true;
  // 定时器
  private _timer?: number;

  /**
   * 播放当前列表
   * @param start 从（秒）开始播放
   * @param func 渲染函数
   */
  async play(start: number = 0, func?: typeof this._render) {
    // 先停止
    this.stop();
    this.playState.value = "loading";
    // 确认所有轨道数据加载完成
    await this._data.sourcesReady;

    // 初始化数据
    this._start = start * 1e6;
    this._renderTime = this._start;
    this._end = this._data.trackline.getLongestTracklineSecond() * 1e6;
    this._step = Math.round(1000 / this._data.timeline.fps.value) * 1000;
    this._render = func;
    this._firstLoop = true;
    // 启动音频上下文
    this._ctx.resume();

    this.playState.value = "playing";
    // 启动 loop
    this._runLoop();
  }

  private _runLoop() {
    this._timer = setInterval(async () => this._loop(), this._step / 1000);
  }

  /**
   * 播放的处理循环
   */
  private async _loop() {
    if (
      this._step <= 0 ||
      this._start > this._end ||
      this._renderTime > this._end ||
      this.playState.value !== "playing"
    ) {
      this.stop();
      return;
    }

    if (this._firstLoop) {
      this._warmup();
      this._firstLoop = false;
    }

    // tick
    const { frames, audios } = await this._tick();

    // render
    if (this._render) await this._render(frames, this._renderTime);
    this._applyAudioData(audios);
    this._data.timeline.currentTime.value = this._renderTime / 1e6;

    // 释放资源
    frames.forEach((frame) => frame.close());

    this._renderTime += this._step;
  }

  /**
   * 预热
   */
  private async _warmup() {
    // 初始化播放时间点
    this._playAt = this._ctx.currentTime;
    // 做一次 tick，
    // 因为音频数据的 tick 机制是：
    // 截取从上一次访问的时间点到这一次的时间点的数据，
    // 提前 tick 一次相当于确定截取的开始时间点
    const { frames } = await this._tick();
    // 不需要渲染，直接关闭即可
    frames.forEach((frame) => frame.close());
  }

  /**
   * 读取当前 renderTime 的渲染数据
   */
  private async _tick() {
    const mergeList = this._data.trackline.mergeList.value;
    const tickTime = Math.round(this._renderTime);

    const tickTasks: ReturnType<typeof this._tickFromTrackItem>[] = [];
    mergeList.forEach((tl) => {
      tl.data.forEach((ti) => {
        if (ti.type === "audio" && ti.mute) return;
        if (ti.start * 1e6 <= this._renderTime && this._renderTime <= ti.end * 1e6) {
          tickTasks.push(this._tickFromTrackItem(ti, Math.floor(tickTime)));
        }
      });
    });
    const res = await Promise.all(tickTasks);

    const frames: (VideoFrame | ImageBitmap)[] = [];
    const audios: Float32Array<ArrayBufferLike>[][] = [];
    res.forEach(({ video, audio }) => {
      video && frames.push(video);
      audio && audios.push(audio);
    });

    return { frames, audios };
  }

  /**
   * 从轨道片段数据中 tick 画面和音频数据
   * @param trackitem 轨道片段数据
   * @param time 时间点（微秒）
   */
  private async _tickFromTrackItem(trackitem: TrackItem, time: number) {
    const data: { video?: VideoFrame | ImageBitmap; audio?: Float32Array<ArrayBufferLike>[] } = {};
    // 获取 clip
    const clip = await this._data.webav.createClipFromCache(trackitem);
    if (!clip) return data;
    await clip.ready;

    // 根据类型分别处理
    if (trackitem.type === "video") {
      // video
      const { video, audio } = await (clip as MP4Clip).tick(time);
      data.video = video;
      if (!trackitem.mute) data.audio = audio;
      return data;
    } else if (trackitem.type === "audio") {
      // audio
      const { audio } = await (clip as AudioClip).tick(time);
      if (!trackitem.mute) data.audio = audio;
      return data;
    } else {
      // image / text
      const duration = (clip as ImgClip).meta.duration;
      if (duration !== Infinity) {
        // gif
        const loopTime = time % duration;
        const { video } = await (clip as ImgClip).tick(loopTime);
        if (video) data.video = video;
      } else {
        const { video } = await (clip as ImgClip).tick(time);
        if (video) data.video = video;
      }
      return data;
    }
  }

  /**
   * 应用音频数据
   * @param data 音频数据
   */
  private _applyAudioData(data: Float32Array<ArrayBufferLike>[][]) {
    this._playAt = Math.max(this._ctx.currentTime, this._playAt);
    let addTime = 0;
    for (const audio of data) {
      const audioSource = this._createAudioSource(audio);
      if (!audioSource) continue;
      this._sourceSet.add(audioSource);
      audioSource.start(this._playAt);
      audioSource.connect(this._ctx.destination);
      audioSource.onended = () => {
        audioSource.disconnect();
        this._sourceSet.delete(audioSource);
      };
      addTime = Math.max(addTime, audioSource?.buffer?.duration ?? 0);
    }
    this._playAt += addTime;
  }

  /**
   * 生成 audioSource
   * @param audio 音频数据
   */
  private _createAudioSource(audio: Float32Array<ArrayBufferLike>[]) {
    const len = audio[0]?.length ?? 0;
    if (len === 0) return;
    const buf = this._ctx.createBuffer(2, len, 48000);
    buf.copyToChannel(audio[0] as Float32Array<ArrayBuffer>, 0);
    buf.copyToChannel(audio[1] as Float32Array<ArrayBuffer>, 1);
    const audioSource = this._ctx.createBufferSource();
    audioSource.buffer = buf;
    return audioSource;
  }

  /**
   * 暂停播放
   */
  pause() {
    this.stop();
  }

  /**
   * 停止播放
   */
  stop() {
    this._ctx.suspend();
    for (const source of this._sourceSet) {
      source.stop();
      source.disconnect();
    }
    this._sourceSet.clear();
    this.playState.value = "paused";
    this._firstLoop = false;
    clearInterval(this._timer);
    this._timer = undefined;
  }
}
