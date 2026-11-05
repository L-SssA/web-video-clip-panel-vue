# @web-vcp/core

`@web-vcp/core` 是 Web Video Clip Panel 的核心数据与状态管理包，为画布和剪辑面板提供共享的编辑状态、资源管理及基础工具。

## 安装

```bash
pnpm add @web-vcp/core
```

需要在 Vue 3 项目中使用。

## 基本用法

```ts
import { TRACKLINE_SOURCE_TYPE, WebVcpManager } from "@web-vcp/core";

const manager = new WebVcpManager({
  data: {
    timeline: { scale: 50 },
    theme: "dark",
  },
});

// 添加视频资源；source 可以是 URL 或 File
await manager.addSource(TRACKLINE_SOURCE_TYPE.VIDEO, videoFile);

// 组件卸载或不再使用时释放资源
manager.destroy();
```

`WebVcpManager` 管理时间线、轨道及系统状态，可通过 `manager.data` 访问数据。包还导出相关数据类型、默认配置、预览及其他工具；完整的组件用法可参考 [`web-vcp`](../web-vcp/README.md)。
