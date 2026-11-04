# Web Video Clip Panel Vue

一个基于 Vue 3 的 Web 视频剪辑面板，提供时间线以及视频、图片、音频和文本素材的管理能力。

## 技术栈

- [Vue 3](https://cn.vuejs.org/guide/introduction.html)：用于构建用户界面的渐进式 JavaScript 框架。
- [WebAV](https://github.com/WebAV-Tech/WebAV)：基于 WebCodecs 的 Web 音视频处理 SDK。
- [Element Plus](https://github.com/element-plus/element-plus)：基于 Vue 3 的组件库。
- [Remix Icon](https://github.com/Remix-Design/RemixIcon)：开源图标库。
- [Vue Konva](https://github.com/konvajs/vue-konva)：用于在 Vue 中集成 Konva 2D 画布的组件库。

## 本地体验

### 环境要求

- Node.js
- pnpm

### 启动项目

```bash
git clone https://github.com/L-SssA/web-video-clip-panel-vue.git
cd web-video-clip-panel-vue
pnpm install
pnpm dev
```

启动后，在浏览器中打开 [http://localhost:5173/](http://localhost:5173/)。

### 在线体验

[在线体验地址](https://l-sssa.github.io/web-video-clip-panel-vue/)

## 快速开始

在已有 Vue 3 项目中安装：

```bash
npm install web-vcp
# 或使用 pnpm
pnpm add web-vcp
```

在应用入口（例如 `main.ts`）中引入组件样式：

```ts
import "web-vcp/style.css";
```

以下示例展示如何创建管理器、渲染画布和剪辑面板并添加素材。`web-vcp` 聚合导出核心功能、画布和剪辑面板。
```vue
<template>
  <div class="page-container">
    <VideoClipCanvas class="page-canvas" :manager="manager"></VideoClipCanvas>
    <div class="page-utils">
      <button @click="addVideoSource">添加视频</button>
      <button @click="addImageSource">添加图片</button>
      <button @click="addAudioSource">添加音频</button>
    </div>
    <VideoClipPanel class="page-panel" :manager="manager"></VideoClipPanel>
  </div>
</template>

<script setup lang="ts">
import { TRACKLINE_SOURCE_TYPE, VideoClipPanel, WebVcpManager, openSingleFilePicker, VideoClipCanvas } from "web-vcp";
import { toRef } from "vue";

const manager = new WebVcpManager({
  data: { timeline: { scale: 50 }, theme: "dark" },
});

const systemStyles = manager.data.system.styles
const backgroundColor = toRef(() => systemStyles.value.backgroundColor)
const backgroundColorLight = toRef(() => systemStyles.value.backgroundColorLight)

const addVideoSource = async () => {
  // 添加网络地址
  // manager.addSource(TRACKLINE_SOURCE_TYPE.VIDEO, 'http://127.0.0.1:5500/video.mp4')

  // 添加本地文件
  const file = await openSingleFilePicker("video/*")
  if (!file) return
  manager.addSource(TRACKLINE_SOURCE_TYPE.VIDEO, file)
}

const addImageSource = async () => {
  // 添加网络地址
  // manager.addSource(TRACKLINE_SOURCE_TYPE.IMAGE, 'http://127.0.0.1:5500/pic1.jpg')

  // 添加本地文件
  const file = await openSingleFilePicker("image/*")
  if (!file) return
  manager.addSource(TRACKLINE_SOURCE_TYPE.IMAGE, file)
}

const addAudioSource = async () => {
  // 添加网络地址
  // manager.addSource(TRACKLINE_SOURCE_TYPE.AUDIO, 'http://127.0.0.1:5500/audio.mp3')

  // 添加本地文件
  const file = await openSingleFilePicker("audio/*")
  if (!file) return
  manager.addSource(TRACKLINE_SOURCE_TYPE.AUDIO, file)
}
</script>

<style scoped lang="scss">
.page-container {
  width: 100vw;
  height: 100vh;
  padding: 0;
  background-color: v-bind(backgroundColor);

  .page-canvas {
    height: calc(100vh - 32px - 16px - 300px);
    background-color: #eeeeee;
  }

  .page-utils {
    padding: 8px 10px;

    :deep(.el-button.is-text:not(.is-disabled)) {

      &:active,
      &:hover {
        background-color: v-bind(backgroundColorLight);
      }
    }
  }

  .page-panel {
    height: 300px;
  }
}
</style>
``` 

## 许可证

[MIT](./LICENSE)
