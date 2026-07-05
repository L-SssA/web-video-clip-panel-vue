# Core 模块架构说明

## 目录结构

```
packages/core/src/
├── data/                     # 数据管理层（纯数据，无UI逻辑）
│   └── Timeline.ts          # 时间线数据模型
├── renderers/               # 渲染器层（每个渲染器负责一类UI元素）
│   ├── BaseRenderer.ts      # 渲染器基类
│   └── TimelineRenderer.ts  # 时间线渲染器
├── managers/                # 管理层（协调数据和渲染）
│   ├── PixiAppManager.ts    # Pixi 应用管理器
│   └── RendererManager.ts   # 渲染器管理器
├── types/                   # 类型定义
│   ├── timeline.ts          # 时间线样式类型
│   └── renderer.ts          # 渲染器接口和上下文类型
├── utils/                   # 工具函数层（纯函数，无状态）
│   ├── eventCallback.ts     # 事件回调管理器
│   ├── timeline.ts          # 时间线绘制工具函数
│   └── tools.ts             # 通用工具函数
├── config/                  # 配置
├── hooks/                   # Vue Hooks
└── index.ts                 # 统一导出
```

## 架构分层

### 1. 数据层 (data/)
**职责**：纯粹的数据管理，不包含任何渲染逻辑

- **Timeline.ts**: 时间线数据模型
  - 管理响应式状态（fps、currentTime、scale等）
  - 计算派生数据（cursorLinePosition、gapWidth等）
  - 提供事件通知机制（onUpdate/offUpdate）
  - 暴露 setter 方法（setCurrentTime、setScale、setFps）

**特点**：
- 只关心数据，不关心如何渲染
- 通过事件系统通知数据变化
- 可独立测试

### 2. 渲染器层 (renderers/)
**职责**：负责具体的 UI 渲染逻辑

- **BaseRenderer.ts**: 渲染器基类
  - 定义渲染器接口（IRenderer）
  - 提供通用的初始化和销毁逻辑
  - 子类必须实现 `render` 方法

- **TimelineRenderer.ts**: 时间线渲染器
  - 绘制时间线顶部横线
  - 绘制刻度和标签
  - 绘制游标线
  - 实现增量更新判断（避免不必要的重绘）

**特点**：
- 每个渲染器负责一类 UI 元素
- 实现 IRenderer 接口
- 可独立初始化和销毁
- 支持增量更新优化性能

### 3. 管理层 (managers/)
**职责**：协调数据和渲染，控制生命周期

- **PixiAppManager.ts**: Pixi 应用管理器
  - 管理 Pixi Application 的生命周期
  - 负责初始化、配置、销毁
  - 注册 Pixi 插件
  - 提供 app 实例供渲染器使用

- **RendererManager.ts**: 渲染器管理器
  - 统一管理所有渲染器的注册、初始化和调用
  - 支持按名称渲染特定渲染器
  - 支持批量渲染所有渲染器
  - 统一的错误处理和资源清理

**特点**：
- 分离关注点（应用管理 vs 渲染管理）
- 支持动态注册/注销渲染器
- 便于扩展新的渲染器类型

### 4. 工具层 (utils/)
**职责**：提供纯函数工具，无状态

- **eventCallback.ts**: 事件回调管理器
  - 管理回调函数的注册、触发、移除
  - 被 Timeline 使用

- **timeline.ts**: 时间线绘制工具函数
  - buildTimelineHead: 构建顶部横线
  - buildTimelineGapsAndLabels: 构建刻度和标签
  - buildCursorLine: 构建游标线
  - 纯函数，接收参数返回绘制结果

- **tools.ts**: 通用工具函数
  - 格式化时间等辅助函数

**特点**：
- 纯函数，无副作用
- 易于测试和复用
- 不依赖具体实现

### 5. 类型定义 (types/)
**职责**：定义 TypeScript 类型和接口

- **timeline.ts**: TimelineStyles 接口
- **renderer.ts**: 
  - TimelineContext 接口（时间线上下文数据）
  - IRenderer 接口（渲染器接口定义）

## 数据流

```
用户操作/外部调用
    ↓
Timeline (数据层) - 更新状态
    ↓
触发 onUpdate 事件
    ↓
组件监听事件
    ↓
RendererManager.render('timeline', data, styles)
    ↓
TimelineRenderer.render(ctx, styles)
    ↓
调用工具函数绘制到 Pixi Canvas
```

## 扩展指南

### 添加新的轨道类型（如音频轨）

1. **创建数据模型** (可选)
   ```typescript
   // data/AudioTrack.ts
   export class AudioTrack {
     // 管理音频轨道数据
   }
   ```

2. **创建渲染器**
   ```typescript
   // renderers/AudioRenderer.ts
   export class AudioRenderer extends BaseRenderer {
     render(data: any, styles: any): void {
       // 实现音频轨道的渲染逻辑
     }
   }
   ```

3. **注册渲染器**
   ```typescript
   // VideoClipPanel.vue
   const audioRenderer = new AudioRenderer();
   rendererManager.register('audio', audioRenderer);
   ```

4. **触发渲染**
   ```typescript
   rendererManager.render('audio', audioData, audioStyles);
   ```

### 替换渲染引擎

如果需要从 Pixi.js 切换到其他渲染引擎：

1. 实现新的 IRenderer 接口
2. 创建新的 AppManager（如 CanvasAppManager）
3. 修改 RendererManager 使用新的 manager
4. 无需修改数据层和业务逻辑

## 优势总结

### 1. 职责清晰
- **数据层**：只管理状态和计算，不关心如何渲染
- **渲染层**：只负责绘制，不关心数据来源
- **管理层**：协调数据和渲染，控制生命周期
- **工具层**：纯函数，可复用和测试

### 2. 易于扩展
- 添加新轨道类型：创建新的 Renderer，注册到 RendererManager
- 添加新数据模型：创建新的数据类
- 替换渲染引擎：只需实现新的 IRenderer 接口

### 3. 便于测试
- 数据层可独立单元测试
- 渲染器可 Mock Pixi 进行隔离测试
- 工具函数本身就是纯函数，易于测试

### 4. 性能优化空间
- RendererManager 可实现批量渲染、脏矩形优化
- 每个渲染器可独立控制更新频率
- 支持按需加载渲染器
- TimelineRenderer 已实现增量更新判断

## 迁移说明

### 旧架构
```typescript
// 旧的导入和使用方式
import { PixiHelper, Timeline } from "@web-vcp/core";

const pixiHelper = new PixiHelper();
const timeline = new Timeline(50);

await pixiHelper.init(el);
pixiHelper.drawTimeline(timeline.ctx, styles);
```

### 新架构
```typescript
// 新的导入和使用方式
import { Timeline, PixiAppManager, RendererManager, TimelineRenderer } from "@web-vcp/core";

const timeline = new Timeline(50, 30);
const pixiAppManager = new PixiAppManager();
const rendererManager = new RendererManager(pixiAppManager);
const timelineRenderer = new TimelineRenderer();

rendererManager.register('timeline', timelineRenderer);
await pixiAppManager.init(el);
await rendererManager.initAll();
rendererManager.render('timeline', timeline.ctx, styles);
```

## 注意事项

1. **初始化顺序**：必须先初始化 PixiAppManager，再初始化 RendererManager
2. **资源释放**：组件卸载时要调用 destroyAll() 和 destroy() 释放资源
3. **事件时序**：确保数据更新 → 渲染触发的时序正确
4. **类型安全**：充分利用 TypeScript 类型系统，确保接口契约清晰
