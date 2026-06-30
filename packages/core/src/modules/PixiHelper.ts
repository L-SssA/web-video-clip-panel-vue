import type { ApplicationOptions } from "pixi.js";

import { Application, extensions, CullerPlugin, ResizePlugin, Assets, Sprite } from "pixi.js";

export class PixiHelper {
  private el: HTMLElement | null = null;
  private app: Application;

  constructor() {
    this.app = new Application();
  }

  /**
   * 初始化PixiHelper
   * @param el
   * @param pixiAppOptions
   */
  async init(el: HTMLElement, pixiAppOptions?: Partial<ApplicationOptions>) {
    // 如果已经初始化或者el不存在则返回
    if (this.el) return console.warn("PixiHelper has already been initialized");
    if (!el) throw new Error("HTMLElement is null");

    this.el = el;
    await this.app.init({ ...pixiAppOptions, resizeTo: this.el });

    this.registerExtensions();

    this.el.appendChild(this.app.canvas);
  }

  /**
   * 注册插件
   */
  registerExtensions() {
    // 自动缩放插件
    extensions.add(ResizePlugin);
    // 离屏自动剔除渲染插件
    extensions.add(CullerPlugin);
  }

  async renderBunny() {
    const texture = await Assets.load("https://pixijs.com/assets/bunny.png");
    const bunny = new Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.x = this.app.screen.width / 2;
    bunny.y = this.app.screen.height / 2;

    this.app.stage.addChild(bunny);

    this.app.ticker.add(() => {
      // Just for fun, let's rotate our bunny over time!
      bunny.rotation += 0.1;
    });
  }
}
