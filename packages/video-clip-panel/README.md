# @web-vcp/video-clip-panel

提供剪辑时间线面板组件 `VideoClipPanel`，用于管理视频、图片、音频和文本素材的轨道及剪辑操作。组件通过 `WebVcpManager` 与核心数据及画布共享状态。

## 安装

```bash
pnpm add @web-vcp/video-clip-panel
```

需要在 Vue 3 项目中使用。

## 使用

```vue
<script setup lang="ts">
import { WebVcpManager } from "@web-vcp/core";
import { VideoClipPanel } from "@web-vcp/video-clip-panel";
import "@web-vcp/video-clip-panel/style.css";

const manager = new WebVcpManager();
</script>

<template>
  <VideoClipPanel :manager="manager" class="editor-panel" />
</template>

<style scoped>
.editor-panel {
  height: 300px;
}
</style>
```

`manager` 为可选属性；如果要与画布或其他组件协同编辑，请创建一个 `WebVcpManager` 并传给相关组件共用。
