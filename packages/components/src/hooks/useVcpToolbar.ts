import { ElSlider } from "element-plus";
import { computed } from "vue";

import type { VcpCtx } from "@/types/vcpContext";
import type { VcpToolbarConfig } from "@/types/vcpToolbar";

import IconButton from "@/components/IconButton/index.vue";

export const useVcpToolbar = (ctx: VcpCtx) => {
  const leftToolbarConfigs = computed<VcpToolbarConfig[]>(() => [
    {
      key: "undo",
      component: IconButton,
      props: {
        iconClass: "ri-arrow-go-back-fill",
        tipsText: "撤销（'Ctrl' + 'Z'键）",
        effect: ctx.theme.value,
      },
      events: {
        click: () => console.log("undo"),
      },
    },
    {
      key: "redo",
      component: IconButton,
      props: {
        iconClass: "ri-arrow-go-forward-fill",
        tipsText: "重做（'Ctrl' + 'Y'键）",
        effect: ctx.theme.value,
      },
      events: {
        click: () => console.log("redo"),
      },
    },
    {
      key: "delete",
      component: IconButton,
      props: {
        iconClass: "ri-delete-bin-6-line",
        tipsText: "删除（'Delete'键）",
        effect: ctx.theme.value,
      },
      events: {
        click: () => console.log("delete"),
      },
    },
    {
      key: "copy",
      component: IconButton,
      props: {
        iconClass: "ri-file-copy-fill",
        tipsText: "复制",
        effect: ctx.theme.value,
      },
      events: {
        click: () => console.log("copy"),
      },
    },
    {
      key: "cut",
      component: IconButton,
      props: {
        iconClass: "ri-scissors-cut-fill",
        tipsText: "裁剪",
        effect: ctx.theme.value,
      },
      events: {
        click: () => console.log("cut"),
      },
    },
    {
      key: "mute",
      component: IconButton,
      props: {
        iconClass: "ri-volume-mute-line",
        tipsText: "声音",
        effect: ctx.theme.value,
      },
      events: {
        click: () => console.log("mute"),
      },
    },
    {
      key: "replace",
      component: IconButton,
      props: {
        iconClass: "ri-picture-in-picture-2-line",
        tipsText: "替换资源",
        effect: ctx.theme.value,
      },
      events: {
        click: () => console.log("replace"),
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
        effect: ctx.theme.value,
      },
      events: {
        onClick: () => console.log("play"),
      },
    },
  ]);

  const rightToolbarConfigs = computed<VcpToolbarConfig[]>(() => [
    {
      key: "autoAdsorb",
      component: IconButton,
      props: {
        iconClass: "ri-stacked-view",
        tipsText: "自动吸附",
        effect: ctx.theme.value,
        active: ctx.timeline.enableAutoAdsorb.value,
        style: { transform: "rotateZ(-90deg)" },
      },
      events: {
        click: () => (ctx.timeline.enableAutoAdsorb.value = !ctx.timeline.enableAutoAdsorb.value),
      },
    },
    {
      key: "zoomOut",
      component: IconButton,
      props: {
        iconClass: "ri-indeterminate-circle-line",
        tipsText: "缩小轨道（'ctrl'键 + '-'键/鼠标滚轮向下）",
        effect: ctx.theme.value,
      },
      events: {
        click: () => ctx.timeline.scale.value--,
      },
    },
    {
      key: "scale",
      component: ElSlider,
      props: {
        showTooltip: false,
        class: "vcp-toolbar__slider",
        modelValue: ctx.timeline.scale.value,
      },
      events: {
        "update:modelValue": (val: number) => (ctx.timeline.scale.value = val),
      },
    },
    {
      key: "zoomIn",
      component: IconButton,
      props: {
        iconClass: "ri-add-circle-line",
        tipsText: "放大轨道（'ctrl'键 + '+'键/鼠标滚轮向上）",
        effect: ctx.theme.value,
      },
      events: {
        click: () => ctx.timeline.scale.value++,
      },
    },
  ]);

  return {
    leftToolbarConfigs,
    centerToolbarConfigs,
    rightToolbarConfigs,
  };
};
