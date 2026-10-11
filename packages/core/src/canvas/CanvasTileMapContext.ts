import type { AABB, PathCommand } from "@/types/canvas";

import {
  aabbIntersect,
  getPathAABB,
  measureText,
  replayPath,
  syncTileStyle,
  transformAABB,
} from "@/utils/canvas";

import type { CanvasTileMap } from "./CanvasTileMap";

import { CanvasTileMapState } from "./CanvasTileMapState";

export class CanvasTileMapContext {
  // ------------ 辅助属性 ------------
  public tileMap: CanvasTileMap;
  private pathCommands: PathCommand[] = [];
  private stateStack: CanvasTileMapState[] = [];
  private currentState: CanvasTileMapState;

  get canvas() {
    return {
      ...this.tileMap.containerRectInfo,
    };
  }
  constructor(tileMap: CanvasTileMap) {
    this.tileMap = tileMap;
    this.currentState = new CanvasTileMapState();
  }

  //#region 读写属性
  getStateValue<T extends keyof CanvasTileMapState>(key: T): CanvasTileMapState[T] {
    return this.currentState[key];
  }

  setStateValue<T extends keyof CanvasTileMapState>(key: T, value: CanvasTileMapState[T]) {
    this.currentState[key] = value;
  }
  //#endregion

  //#region save / restore
  save() {
    const copiedState = this.currentState.clone();
    this.stateStack.push(copiedState);
  }

  restore() {
    if (this.stateStack.length === 0) return;
    this.currentState = this.stateStack.pop()!;
  }
  //#endregion

  //#region 变换矩阵 API
  translate(x: number, y: number) {
    this.currentState.transform.translateSelf(x, y);
  }

  scale(x: number, y: number) {
    this.currentState.transform.scaleSelf(x, y);
  }

  rotate(angle: number) {
    this.currentState.transform.rotateSelf(angle);
  }

  transform(a: number, b: number, c: number, d: number, e: number, f: number) {
    this.currentState.transform.multiplySelf(new DOMMatrix([a, b, c, d, e, f]));
  }

  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  setTransform(matrix: DOMMatrix): void;
  setTransform(...args: any[]) {
    if (args.length === 1 && args[0] instanceof DOMMatrix) {
      this.currentState.transform = DOMMatrix.fromMatrix(args[0]);
    } else {
      this.currentState.transform = new DOMMatrix(args.slice(0, 6));
    }
  }

  resetTransform() {
    this.currentState.transform = new DOMMatrix();
  }
  //#endregion

  //#region 路径构建API（收集指令）
  beginPath() {
    this.pathCommands = [];
    this.pathCommands.push({ type: "beginPath", args: [] });
  }

  moveTo(x: number, y: number) {
    this.pathCommands.push({ type: "moveTo", args: [x, y] });
  }

  lineTo(x: number, y: number) {
    this.pathCommands.push({ type: "lineTo", args: [x, y] });
  }

  arc(x: number, y: number, r: number, sa: number, ea: number, ccw?: boolean) {
    this.pathCommands.push({ type: "arc", args: [x, y, r, sa, ea, ccw] });
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.pathCommands.push({ type: "arcTo", args: [x1, y1, x2, y2, radius] });
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this.pathCommands.push({ type: "quadraticCurveTo", args: [cpx, cpy, x, y] });
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
    this.pathCommands.push({ type: "bezierCurveTo", args: [cp1x, cp1y, cp2x, cp2y, x, y] });
  }

  rect(x: number, y: number, w: number, h: number) {
    this.pathCommands.push({ type: "rect", args: [x, y, w, h] });
  }

  ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rot: number,
    sa: number,
    ea: number,
    ccw?: boolean,
  ) {
    this.pathCommands.push({ type: "ellipse", args: [x, y, rx, ry, rot, sa, ea, ccw] });
  }

  closePath() {
    this.pathCommands.push({ type: "closePath", args: [] });
  }
  //#endregion

  //#region 绘制提交API fill / stroke
  fill() {
    const localAABB = getPathAABB(this.pathCommands);
    if (!localAABB) return;
    const worldAABB = transformAABB(localAABB, this.currentState.transform);

    for (const tile of this.tileMap.tiles) {
      const tileBox: AABB = {
        minX: tile.x,
        minY: tile.y,
        maxX: tile.x + tile.width,
        maxY: tile.y + tile.height,
      };
      if (!aabbIntersect(worldAABB, tileBox)) continue;

      const tCtx = tile.getContext();
      if (!tCtx) return;
      tCtx.save();
      syncTileStyle(tCtx, this.currentState);
      tCtx.setTransform(1, 0, 0, 1, -tile.x, -tile.y);
      tCtx.beginPath();
      replayPath(tCtx, this.pathCommands);
      tCtx.fill();
      tCtx.restore();
    }
  }

  stroke() {
    const localAABB = getPathAABB(this.pathCommands);
    if (!localAABB) return;
    const worldAABB = transformAABB(localAABB, this.currentState.transform);

    for (const tile of this.tileMap.tiles) {
      const tileBox: AABB = {
        minX: tile.x,
        minY: tile.y,
        maxX: tile.x + tile.width,
        maxY: tile.y + tile.height,
      };
      if (!aabbIntersect(worldAABB, tileBox)) continue;

      const tCtx = tile.getContext();
      if (!tCtx) return;
      tCtx.save();
      syncTileStyle(tCtx, this.currentState);
      tCtx.setTransform(1, 0, 0, 1, -tile.x, -tile.y);
      tCtx.beginPath();
      replayPath(tCtx, this.pathCommands);
      tCtx.stroke();
      tCtx.restore();
    }
  }
  //#endregion

  //#region 快捷矩形绘制 fillRect / strokeRect / clearRect
  fillRect(x: number, y: number, w: number, h: number) {
    const localAABB: AABB = { minX: x, minY: y, maxX: x + w, maxY: y + h };
    const worldAABB = transformAABB(localAABB, this.currentState.transform);
    for (const tile of this.tileMap.tiles) {
      const tileBox: AABB = {
        minX: tile.x,
        minY: tile.y,
        maxX: tile.x + tile.width,
        maxY: tile.y + tile.height,
      };
      if (!aabbIntersect(worldAABB, tileBox)) continue;
      const tCtx = tile.getContext();
      if (!tCtx) return;
      tCtx.save();
      syncTileStyle(tCtx, this.currentState);
      tCtx.setTransform(1, 0, 0, 1, -tile.x, -tile.y);
      tCtx.fillRect(x, y, w, h);
      tCtx.restore();
    }
  }

  strokeRect(x: number, y: number, w: number, h: number) {
    const localAABB: AABB = { minX: x, minY: y, maxX: x + w, maxY: y + h };
    const worldAABB = transformAABB(localAABB, this.currentState.transform);
    for (const tile of this.tileMap.tiles) {
      const tileBox: AABB = {
        minX: tile.x,
        minY: tile.y,
        maxX: tile.x + tile.width,
        maxY: tile.y + tile.height,
      };
      if (!aabbIntersect(worldAABB, tileBox)) continue;
      const tCtx = tile.getContext();
      if (!tCtx) return;
      tCtx.save();
      syncTileStyle(tCtx, this.currentState);
      tCtx.setTransform(1, 0, 0, 1, -tile.x, -tile.y);
      tCtx.strokeRect(x, y, w, h);
      tCtx.restore();
    }
  }

  clearRect(x: number, y: number, w: number, h: number) {
    const localAABB: AABB = { minX: x, minY: y, maxX: x + w, maxY: y + h };
    const worldAABB = transformAABB(localAABB, this.currentState.transform);
    for (const tile of this.tileMap.tiles) {
      const tileBox: AABB = {
        minX: tile.x,
        minY: tile.y,
        maxX: tile.x + tile.width,
        maxY: tile.y + tile.height,
      };
      if (!aabbIntersect(worldAABB, tileBox)) continue;
      const tCtx = tile.getContext();
      if (!tCtx) return;
      tCtx.save();
      tCtx.setTransform(1, 0, 0, 1, -tile.x, -tile.y);
      tCtx.clearRect(x, y, w, h);
      tCtx.restore();
    }
  }
  //#endregion

  //#region drawImage 支持3种重载
  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
  drawImage(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
  drawImage(image: CanvasImageSource, ...args: number[]) {
    let dx: number, dy: number, dw: number, dh: number;
    if (args.length === 2) {
      [dx, dy] = args;
      dw = (image as HTMLImageElement).width || 100;
      dh = (image as HTMLImageElement).height || 100;
    } else if (args.length === 4) {
      [dx, dy, dw, dh] = args;
    } else {
      [, , , , , dx, dy, dw, dh] = args;
    }
    const localAABB: AABB = { minX: dx, minY: dy, maxX: dx + dw, maxY: dy + dh };
    const worldAABB = transformAABB(localAABB, this.currentState.transform);

    for (const tile of this.tileMap.tiles) {
      const tileBox: AABB = {
        minX: tile.x,
        minY: tile.y,
        maxX: tile.x + tile.width,
        maxY: tile.y + tile.height,
      };
      if (!aabbIntersect(worldAABB, tileBox)) continue;
      const tCtx = tile.getContext();
      if (!tCtx) return;
      tCtx.save();
      syncTileStyle(tCtx, this.currentState);
      tCtx.setTransform(1, 0, 0, 1, -tile.x, -tile.y);
      (tCtx.drawImage as any)(image, ...args);
      tCtx.restore();
    }
  }
  //#endregion

  //#region fillText / strokeText
  fillText(text: string, x: number, y: number, maxWidth?: number) {
    const tmpCtx = document.createElement("canvas").getContext("2d")!;
    tmpCtx.font = this.currentState.font;
    const mt = tmpCtx.measureText(text);
    const w = maxWidth ?? mt.width;
    const localAABB: AABB = {
      minX: x,
      minY: y - mt.actualBoundingBoxAscent,
      maxX: x + w,
      maxY: y + mt.actualBoundingBoxDescent,
    };
    const worldAABB = transformAABB(localAABB, this.currentState.transform);

    for (const tile of this.tileMap.tiles) {
      const tileBox: AABB = {
        minX: tile.x,
        minY: tile.y,
        maxX: tile.x + tile.width,
        maxY: tile.y + tile.height,
      };
      if (!aabbIntersect(worldAABB, tileBox)) continue;
      const tCtx = tile.getContext();
      if (!tCtx) return;
      tCtx.save();
      syncTileStyle(tCtx, this.currentState);
      tCtx.setTransform(1, 0, 0, 1, -tile.x, -tile.y);
      tCtx.fillText(text, x, y, maxWidth);
      tCtx.restore();
    }
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number) {
    const tmpCtx = document.createElement("canvas").getContext("2d")!;
    tmpCtx.font = this.currentState.font;
    const mt = tmpCtx.measureText(text);
    const w = maxWidth ?? mt.width;
    const localAABB: AABB = {
      minX: x,
      minY: y - mt.actualBoundingBoxAscent,
      maxX: x + w,
      maxY: y + mt.actualBoundingBoxDescent,
    };
    const worldAABB = transformAABB(localAABB, this.currentState.transform);

    for (const tile of this.tileMap.tiles) {
      const tileBox: AABB = {
        minX: tile.x,
        minY: tile.y,
        maxX: tile.x + tile.width,
        maxY: tile.y + tile.height,
      };
      if (!aabbIntersect(worldAABB, tileBox)) continue;
      const tCtx = tile.getContext();
      if (!tCtx) return;
      tCtx.save();
      syncTileStyle(tCtx, this.currentState);
      tCtx.setTransform(1, 0, 0, 1, -tile.x, -tile.y);
      tCtx.strokeText(text, x, y, maxWidth);
      tCtx.restore();
    }
  }

  measureText(text: string): TextMetrics {
    return measureText(text, this.currentState);
  }
  //#endregion
}
