export class TileCanvas {
  public width: number;
  public height: number;
  public x: number;
  public y: number;

  public canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D | null = null;

  constructor(width: number, height: number, x: number, y: number) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  updateRect(width: number, height: number, x: number, y: number) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /**
   * 获取 canvas 渲染上下文
   */
  getContext() {
    if (!this._context) {
      this._context = this.canvas.getContext("2d");
    }
    return this._context;
  }

  /**
   * 释放资源
   */
  release() {
    this.canvas.remove();
    this._context = null;
  }
}
