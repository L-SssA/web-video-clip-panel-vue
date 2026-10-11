import { numberToStyleValue } from "../utils/tools";
import { TileCanvas } from "./CanvasTile";
import { CanvasTileMapContext } from "./CanvasTileMapContext";

/**
 * 为了处理 canvas 有最大画布尺寸限制的问题
 * https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/canvas#%E6%9C%80%E5%A4%A7%E7%9A%84%E7%94%BB%E5%B8%83%E5%B0%BA%E5%AF%B8
 */
export class CanvasTileMap {
  readonly MaxSize: number = 8000;

  public container: HTMLElement | null = null;
  public containerRectInfo = {
    width: 0,
    height: 0,
  };

  public context: CanvasTileMapContext;

  private grid: HTMLDivElement;
  private _cacheMap: Map<string, TileCanvas> = new Map();

  get tiles(): TileCanvas[] {
    return [...this._cacheMap.values()];
  }

  constructor() {
    this.grid = document.createElement("div");
    this.grid.style.display = "grid";

    this.context = new CanvasTileMapContext(this);
  }

  /**
   * 获取渲染上下文
   */
  getContext() {
    return this.context;
  }

  /**
   * 设置 canvas 容器
   * @param el 容器
   */
  setElement(el: HTMLElement) {
    if (this.container) this.container.removeChild(this.grid);

    this.container = el;
    if (!this.container) return;

    this.update();
    this.container.appendChild(this.grid);
  }

  /**
   * 更新操作
   */
  update() {
    this.updateRectInfo();
    this.updateCanvasTile();
  }

  /**
   * 更新容器尺寸信息
   */
  updateRectInfo() {
    if (!this.container) return;
    // 缓存容器尺寸信息
    const { clientWidth, clientHeight } = this.container;
    this.containerRectInfo.width = clientWidth;
    this.containerRectInfo.height = clientHeight;

    // 设置 canvas 盒子宽高
    this.grid.style.width = numberToStyleValue(clientWidth);
    this.grid.style.height = numberToStyleValue(clientHeight);
  }

  /**
   * 更新 canvas 节点
   */
  updateCanvasTile() {
    // 根据容器宽高划分 canvas
    const { width, height } = this.containerRectInfo;
    if (!width || !height) return;
    const xCount = Math.ceil(width / this.MaxSize);
    const yCount = Math.ceil(height / this.MaxSize);

    // 检查创建或更新 canvas 节点
    const gridTemplateColumns: string[] = [];
    const gridTemplateRows: string[] = [];
    const keys: string[] = [];
    for (let j = 0; j < yCount; j++) {
      for (let i = 0; i < xCount; i++) {
        const w =
          i === xCount - 1 && width % this.MaxSize > 0 ? width % this.MaxSize : this.MaxSize;

        const h =
          j === yCount - 1 && height % this.MaxSize > 0 ? height % this.MaxSize : this.MaxSize;

        if (i === 0) gridTemplateRows.push(numberToStyleValue(h));
        if (j === 0) gridTemplateColumns.push(numberToStyleValue(w));

        const key = `${i}-${j}`;
        keys.push(key);
        const tile = this._cacheMap.get(key);

        if (!tile) {
          this._cacheMap.set(key, new TileCanvas(w, h, i * this.MaxSize, j * this.MaxSize));
        } else {
          tile.updateRect(w, h, i * this.MaxSize, j * this.MaxSize);
        }
      }
    }

    // 挂载所有需要的节点（未挂载的挂载，已挂载的排序）
    this.batchMountCanvasTiles(keys);

    // 移除不需要的节点
    const keysToRemove = [...this._cacheMap.keys()].filter((k) => !keys.includes(k));
    this.batchRemoveCanvasTiles(keysToRemove);

    // 设置布局属性
    this.grid.style.gridTemplateColumns = gridTemplateColumns.join(" ");
    this.grid.style.gridTemplateRows = gridTemplateRows.join(" ");
  }

  /**
   * 批量移除 canvas 节点
   * @param keys 节点 id 列表
   */
  batchRemoveCanvasTiles(keys: string[]) {
    keys.forEach((key) => this.removeCanvasTile(key));
  }

  /**
   * 移除 canvas 节点
   * @param keys 节点 id
   */
  removeCanvasTile(key: string) {
    const tile = this._cacheMap.get(key);
    if (!tile) return;
    this._cacheMap.delete(key);
    tile.release();
  }

  /**
   * 批量挂载 canvas 节点
   * @param keys 节点 id 列表
   */
  batchMountCanvasTiles(keys: string[], referenceKey?: string) {
    keys.forEach((key) => this.mountCanvasTile(key, referenceKey));
  }

  /**
   * 挂载 canvas 节点
   * @param key 节点 id
   * @param referenceKey 挂载位置的参考节点 id
   */
  mountCanvasTile(key: string, referenceKey?: string) {
    const tile = this._cacheMap.get(key);
    if (!tile) return;
    const referenceTile = referenceKey && this._cacheMap.get(referenceKey);
    this.grid.insertBefore(tile.canvas, referenceTile ? referenceTile.canvas : null);
  }

  /**
   * 释放资源
   */
  release() {
    this._cacheMap.forEach((tile) => tile.release());
    this._cacheMap.clear();
    this.containerRectInfo = { width: 0, height: 0 };
    this.container = null;
  }
}
