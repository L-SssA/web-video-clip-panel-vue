import type { CanvasTileMapState } from "@/canvas/CanvasTileMapState";
import type { AABB, PathCommand } from "@/types/canvas";

/**
 * 计算两个 AABB 包围盒是否有交叉
 * @param a A 包围盒
 * @param b B 包围盒
 */
export function aabbIntersect(a: AABB, b: AABB): boolean {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

/**
 * 从路径指令提取局部AABB（粗包围盒，取控制点）
 * @param cmds 路径指令
 */
export function getPathAABB(cmds: PathCommand[]): AABB | null {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const cmd of cmds) {
    const [x, y] = cmd.args;
    if (typeof x !== "number" || typeof y !== "number") continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  if (minX === Infinity) return null;
  return { minX, minY, maxX, maxY };
}

/**
 * 将局部AABB乘变换矩阵，得到世界AABB
 * @param aabb AABB 包围盒
 * @param matrix 局部变换矩阵
 * @returns
 */
export function transformAABB(aabb: AABB, matrix: DOMMatrix): AABB {
  const pts = [
    matrix.transformPoint({ x: aabb.minX, y: aabb.minY }),
    matrix.transformPoint({ x: aabb.maxX, y: aabb.minY }),
    matrix.transformPoint({ x: aabb.minX, y: aabb.maxY }),
    matrix.transformPoint({ x: aabb.maxX, y: aabb.maxY }),
  ];
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

/**
 * 将当前状态全部同步到tile ctx
 * @param tCtx 真实渲染上下文
 * @param state CanvasTileMapState
 */
export function syncTileStyle(tCtx: CanvasRenderingContext2D, state: CanvasTileMapState) {
  tCtx.fillStyle = state.fillStyle;
  tCtx.strokeStyle = state.strokeStyle;
  tCtx.lineWidth = state.lineWidth;
  tCtx.lineCap = state.lineCap;
  tCtx.lineJoin = state.lineJoin;
  tCtx.miterLimit = state.miterLimit;
  tCtx.font = state.font;
  tCtx.textAlign = state.textAlign;
  tCtx.textBaseline = state.textBaseline;
  tCtx.globalAlpha = state.globalAlpha;
  tCtx.globalCompositeOperation = state.globalCompositeOperation;
  tCtx.shadowColor = state.shadowColor;
  tCtx.shadowBlur = state.shadowBlur;
  tCtx.shadowOffsetX = state.shadowOffsetX;
  tCtx.shadowOffsetY = state.shadowOffsetY;
}

/**
 * 在渲染上下文中回放路径指令
 * @param tCtx 真实渲染上下文
 * @param cmds 路径指令集
 */
export function replayPath(tCtx: CanvasRenderingContext2D, cmds: PathCommand[]) {
  for (const cmd of cmds) {
    (tCtx as any)[cmd.type](...cmd.args);
  }
}

/**
 * 预计算文本尺寸
 * @param text 文本
 * @param state CanvasTileMapState
 */
export function measureText(text: string, state: CanvasTileMapState): TextMetrics {
  const tmpCtx = document.createElement("canvas").getContext("2d")!;
  tmpCtx.font = state.font;
  tmpCtx.textAlign = state.textAlign;
  tmpCtx.textBaseline = state.textBaseline;
  return tmpCtx.measureText(text);
}
