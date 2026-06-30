<template>
  <ToolbarLayout class="vcp-toolbar">
    <template #left>
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-arrow-go-back-fill" tipsText="撤销（'Ctrl' + 'Z'键）"
        @click="() => console.log('undo')" />
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-arrow-go-forward-fill" tipsText="重做（'Ctrl' + 'Y'键）"
        @click="() => console.log('redo')" />
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-delete-bin-6-line" tipsText="删除（'Delete'键）"
        @click="() => console.log('delete')" />
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-file-copy-fill" tipsText="复制"
        @click="() => console.log('copy')" />
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-scissors-cut-fill" tipsText="裁剪"
        @click="() => console.log('cut')" />
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-volume-mute-line" tipsText="声音"
        @click="() => console.log('mute')" />
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-picture-in-picture-2-line" tipsText="替换资源"
        @click="() => console.log('replace')" />
    </template>
    <template #center>
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-play-large-line" tipsText="播放"
        @click="() => console.log('play')" />
    </template>
    <template #right>
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-stacked-view" style="transform: rotateZ(-90deg);"
        tipsText="自动吸附" @click="() => console.log('autoAdsorb')" />
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-indeterminate-circle-line"
        tipsText="缩小轨道（'ctrl'键 + '-'键/鼠标滚轮向下）" @click="() => console.log('zoomOut')" />
      <ElSlider class="vcp-toolbar__tool-item vcp-toolbar__slider" style="width: 160px" :show-tooltip="false" />
      <IconButton class="vcp-toolbar__tool-item" iconClass="ri-add-circle-line" tipsText="放大轨道（'ctrl'键 + '+'键/鼠标滚轮向上）"
        @click="() => console.log('zoomIn')" />
    </template>
  </ToolbarLayout>
</template>

<script setup lang="ts">
import ToolbarLayout from "./ToolbarLayout.vue";
import IconButton from "@/components/IconButton/index.vue";
</script>

<style scoped lang="scss">
.vcp-toolbar {
  width: 100%;
  padding: 8px 10px;
  box-sizing: border-box;

  .vcp-toolbar__tool-item {
    margin: 0 10px;
  }

  .vcp-toolbar__slider {
    :deep() {
      .el-slider__runway {
        background-color: #454545;
      }

      .el-slider__bar {
        background-color: #ffffff;
      }

      .el-slider__button {
        border: none;
        width: 12px;
        height: 12px;
      }
    }
  }
}
</style>
