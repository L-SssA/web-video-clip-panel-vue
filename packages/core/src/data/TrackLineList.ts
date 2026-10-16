import { type ComputedRef, computed, ref } from "vue";

import type { AudioTrackLine, PictureTrackLine, TrackLine, VideoTrackLine } from "@/types/data";

import { MAIN_TRACK_ID } from "@/config/constant";

export class TrackLineList {
  // 画面轨道列表
  readonly picture = ref<PictureTrackLine[]>([]);
  // 主轨道（video track）
  readonly main = ref<VideoTrackLine>({
    id: MAIN_TRACK_ID,
    type: "video",
    data: [],
    main: true,
    mute: false,
  });
  // 音频轨道列表
  readonly audio = ref<AudioTrackLine[]>([]);
  // 按类型顺序排列轨道
  readonly merge: ComputedRef<TrackLine[]> = computed(() => {
    return [...this.picture.value, this.main.value, ...this.audio.value];
  });
}
