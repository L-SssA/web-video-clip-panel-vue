import { ElSlider } from "element-plus";
import { computed } from "vue";

import type { VcpCtx } from "@/types/vcpContext.ts";
import type { VcpToolbarConfig } from "@/types/vcpToolbar.ts";

import IconButton from "@/components/IconButton/index.vue";

export const useVcpToolbar = (ctx: VcpCtx) => {
  const theme = ctx.manager.data.theme;
  const activeTrackItem = ctx.manager.data.trackline.activeTrackItem;
  const leftToolbarConfigs = computed<VcpToolbarConfig[]>(() => [
    {
      key: "undo",
      component: IconButton,
      props: {
        iconClass: "ri-arrow-go-back-fill",
        tipsText: "撤销（'Ctrl' + 'Z'键）",
        effect: theme.value,
        disabled: !ctx.manager.data.trackline.undoAble.value,
      },
      events: {
        click: () => ctx.manager.data.undo(),
      },
    },
    {
      key: "redo",
      component: IconButton,
      props: {
        iconClass: "ri-arrow-go-forward-fill",
        tipsText: "重做（'Ctrl' + 'Y'键）",
        effect: theme.value,
        disabled: !ctx.manager.data.trackline.redoAble.value,
      },
      events: {
        click: () => ctx.manager.data.redo(),
      },
    },
    {
      key: "delete",
      component: IconButton,
      props: {
        iconClass: "ri-delete-bin-6-line",
        disabled: !(activeTrackItem.value && activeTrackItem.value.changeable),
        tipsText: "删除（'Delete'键）",
        effect: theme.value,
      },
      events: {
        click: () => ctx.manager.data.removeTrackitem(),
      },
    },
    {
      key: "copy",
      component: IconButton,
      props: {
        iconClass: "ri-file-copy-fill",
        disabled: !(activeTrackItem.value && activeTrackItem.value.changeable),
        tipsText: "复制",
        effect: theme.value,
      },
      events: {
        click: () => ctx.manager.data.copyTrackItem(),
      },
    },
    {
      key: "cut",
      component: IconButton,
      props: {
        iconClass: "ri-scissors-cut-fill",
        disabled: !(activeTrackItem.value && activeTrackItem.value.changeable),
        tipsText: "裁剪",
        effect: theme.value,
      },
      events: {
        click: () => ctx.manager.data.cutTrackItem(),
      },
    },
    {
      key: "mute",
      component: IconButton,
      props: {
        iconClass:
          activeTrackItem.value && "mute" in activeTrackItem.value && activeTrackItem.value.mute
            ? "ri-volume-mute-line"
            : "ri-volume-down-line",
        disabled: !(
          activeTrackItem.value &&
          activeTrackItem.value.changeable &&
          "mute" in activeTrackItem.value
        ),
        tipsText: "声音",
        effect: theme.value,
      },
      events: {
        click: () => {
          if (
            activeTrackItem.value &&
            activeTrackItem.value.changeable &&
            "mute" in activeTrackItem.value
          ) {
            activeTrackItem.value.mute = !activeTrackItem.value.mute;
          }
        },
      },
    },
  ]);

  const centerToolbarConfigs = computed<VcpToolbarConfig[]>(() => [
    {
      key: "play",
      component: IconButton,
      props: {
        iconClass: "ri-play-large-line",
        tipsText: "播放",
        effect: theme.value,
      },
      events: {
        onClick: () => console.log("play"),
      },
    },
  ]);

  const rightToolbarConfigs = computed<VcpToolbarConfig[]>(() => [
    {
      key: "zoomOut",
      component: IconButton,
      props: {
        iconClass: "ri-indeterminate-circle-line",
        tipsText: "缩小轨道（'ctrl'键 + '-'键/鼠标滚轮向下）",
        effect: theme.value,
      },
      events: {
        click: () => ctx.manager.data.timeline.scale.value--,
      },
    },
    {
      key: "scale",
      component: ElSlider,
      props: {
        showTooltip: false,
        class: "vcp-toolbar__slider",
        modelValue: ctx.manager.data.timeline.scale.value,
      },
      events: {
        "update:modelValue": (val: number) => (ctx.manager.data.timeline.scale.value = val),
      },
    },
    {
      key: "zoomIn",
      component: IconButton,
      props: {
        iconClass: "ri-add-circle-line",
        tipsText: "放大轨道（'ctrl'键 + '+'键/鼠标滚轮向上）",
        effect: theme.value,
      },
      events: {
        click: () => ctx.manager.data.timeline.scale.value++,
      },
    },
    {
      key: "autoAdsorb",
      component: IconButton,
      props: {
        iconClass: "ri-stacked-view",
        tipsText: "自动吸附",
        effect: theme.value,
        active: ctx.manager.data.timeline.enableAutoAdsorb.value,
        style: { transform: "rotateZ(-90deg)" },
      },
      events: {
        click: () =>
          (ctx.manager.data.timeline.enableAutoAdsorb.value =
            !ctx.manager.data.timeline.enableAutoAdsorb.value),
      },
    },
    {
      key: "theme",
      component: IconButton,
      props: {
        iconClass: theme.value === "light" ? "ri-sun-fill" : "ri-moon-fill",
        effect: theme.value,
      },
      events: {
        click: () => (theme.value = theme.value === "light" ? "dark" : "light"),
      },
    },
  ]);

  return {
    leftToolbarConfigs,
    centerToolbarConfigs,
    rightToolbarConfigs,
  };
};
