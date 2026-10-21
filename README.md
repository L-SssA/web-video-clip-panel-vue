# Web Video Clip Panel Vue

一个基于 Vue 3 的 Web 视频剪辑面板组件，提供时间线及视频、图片、音频等素材的管理能力。

## 技术栈

- [Vue 3](https://cn.vuejs.org/guide/introduction.html)：用于构建用户界面的渐进式 JavaScript 框架。
- [WebAV](https://github.com/WebAV-Tech/WebAV)：基于 WebCodecs 的 Web 音视频处理 SDK。
- [Element Plus](https://github.com/element-plus/element-plus)：基于 Vue 3 的组件库。
- [Remix Icon](https://github.com/Remix-Design/RemixIcon)：开源图标库。

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

暂未提供在线体验地址。

## 快速开始

以下示例展示如何在 Vue 3 项目中创建管理器、渲染剪辑面板并添加素材。示例依赖本仓库的 `@web-vcp/components` workspace 包。

```vue
<template>
  <VideoClipPanel :manager="manager" />

  <ElButton @click="addVideo">添加视频</ElButton>
  <ElButton @click="addImage">添加图片</ElButton>
  <ElButton @click="addAudio">添加音频</ElButton>
</template>

<script setup lang="ts">
import {
  TRACKLINE_SOURCE_TYPE,
  VideoClipPanel,
  WebVcpManager,
} from "@web-vcp/components";
import { ElButton } from "element-plus";

const manager = new WebVcpManager({
  data: {
    timeline: { scale: 50 },
    theme: "dark",
  },
});

const addVideo = () =>
  manager.addSource(TRACKLINE_SOURCE_TYPE.VIDEO, "http://127.0.0.1:5500/video.mp4");

const addImage = () =>
  manager.addSource(TRACKLINE_SOURCE_TYPE.IMAGE, "http://127.0.0.1:5500/pic1.jpg");

const addAudio = () =>
  manager.addSource(TRACKLINE_SOURCE_TYPE.AUDIO, "http://127.0.0.1:5500/audio.mp3");
</script>
```

请将示例中的素材地址替换为实际可访问的视频、图片或音频地址。`TRACKLINE_SOURCE_TYPE` 还支持 `TEXT` 类型。
