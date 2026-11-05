# @web-vcp/video-clip-canvas

提供视频预览画布组件 `VideoClipCanvas`，用于显示并调整当前剪辑画面中的素材。组件通过 `WebVcpManager` 与核心数据及剪辑面板共享状态。

## 安装

```bash
pnpm add @web-vcp/video-clip-canvas
```

需要在 Vue 3 项目中使用。

## 使用

```vue
<script setup lang="ts">
import { WebVcpManager } from "@web-vcp/core";
import { VideoClipCanvas } from "@web-vcp/video-clip-canvas";
import "@web-vcp/video-clip-canvas/style.css";

const manager = new WebVcpManager();
</script>

<template>
  <VideoClipCanvas :manager="manager" class="preview" />
</template>

<style scoped>
.preview {
  height: 400px;
}
</style>
```

`manager` 为可选属性；如果要与剪辑面板或其他组件协同编辑，请创建一个 `WebVcpManager` 并传给相关组件共用。
