import { Application, type ApplicationOptions } from "pixi.js";

export class PixiHelper {
  private el: HTMLElement | null = null;
  private app: Application;

  constructor() {
    this.app = new Application();
  }

  async init(el: HTMLElement, pixiAppOptions?: Partial<ApplicationOptions>) {
    // 如果已经初始化或者el不存在则返回
    if (this.el) return console.warn("PixiHelper has already been initialized");
    if (!el) throw new Error("HTMLElement is null");

    this.el = el;
    await this.app.init({ ...pixiAppOptions, resizeTo: this.el });
    this.el.appendChild(this.app.canvas);
  }
}
