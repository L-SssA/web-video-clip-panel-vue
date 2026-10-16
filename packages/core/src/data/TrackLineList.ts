import { type ComputedRef, type Ref, computed, ref } from "vue";

import type {
  AudioTrackLine,
  PictureTrackLine,
  TrackItem,
  TrackLine,
  TrackLineListSnapshot,
  VideoTrackLine,
} from "@/types/data";

import { MAIN_TRACK_ID } from "@/config/constant";
import deepCopy from "@/utils/tools";

export class TrackLineList {
  // 当前活跃的轨道
  readonly activeTrackLine: Ref<TrackLine | null> = ref(null);
  // 当前活跃的轨道片段
  readonly activeTrackItem: Ref<TrackItem | null> = ref(null);

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

  // 最大快照数
  readonly maxSnapshotSize: number;
  readonly undoAble: ComputedRef<boolean>;
  readonly redoAble: ComputedRef<boolean>;

  private snapshotList: TrackLineListSnapshot[] = [];
  private snapshotIndex = ref(-1);

  constructor(maxSnapshotSize: number) {
    this.maxSnapshotSize = maxSnapshotSize;
    this.undoAble = computed(() => this.snapshotIndex.value > -1);
    this.redoAble = computed(() => this.snapshotIndex.value < this.snapshotList.length - 1);
  }

  /**
   * 保存快照
   */
  saveSnapshot() {
    this.snapshotList.splice(this.snapshotIndex.value + 1);
    const snapshot = {
      picture: deepCopy(this.picture.value),
      main: deepCopy(this.main.value),
      audio: deepCopy(this.audio.value),
      activeLineId: this.activeTrackLine.value?.id,
      activeItemId: this.activeTrackItem.value?.id,
    };
    this.snapshotList.push(snapshot);
    this.snapshotIndex.value++;
  }

  /**
   * 撤销
   */
  undo() {
    const snapshot = this.snapshotList[this.snapshotIndex.value - 1];
    if (!snapshot) {
      this.applySnapshot({
        picture: [],
        main: { id: MAIN_TRACK_ID, type: "video", data: [], main: true, mute: false },
        audio: [],
      });
      this.snapshotIndex.value = -1;
    } else {
      this.applySnapshot(snapshot);
      this.snapshotIndex.value--;
    }
  }

  /**
   * 重做
   */
  redo() {
    const snapshot = this.snapshotList[this.snapshotIndex.value + 1];
    if (!snapshot) return;
    this.applySnapshot(snapshot);
    this.snapshotIndex.value++;
  }

  /**
   * 从快照中找到 active 并设置
   * @param snapshot 快照
   */
  applySnapshot(snapshot: TrackLineListSnapshot) {
    const { picture, main, audio, activeItemId, activeLineId } = snapshot;
    this.picture.value = deepCopy(picture);
    this.main.value = deepCopy(main);
    this.audio.value = deepCopy(audio);
    const mergeList = [...this.picture.value, this.main.value, ...this.audio.value];
    if (activeItemId != null || activeLineId != null) {
      let foundItem = activeItemId == null;
      let foundLine = activeLineId == null;
      for (const tl of mergeList) {
        // 如果没找到 activeLine，则对比id
        if (!foundLine && tl.id === activeLineId) {
          this.activeTrackLine.value = tl;
          foundLine = true;
        }

        // 如果没找到 activeItem，则循环寻找
        if (!foundItem) {
          for (const ti of tl.data) {
            if (ti.id == activeItemId) {
              this.activeTrackItem.value = ti;
              foundItem = true;
              break;
            }
          }
        }

        // 如果都找到了，则退出循环
        if (foundItem && foundLine) break;
      }
    }
  }
}
