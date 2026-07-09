import type { Application, Container, Texture } from "pixi.js";

import { Assets, Sprite } from "pixi.js";

import type { TrackLineContext } from "@/types/trackline";

import AudioIcon from "@/assets/images/AudioIcon.png";
import ImageIcon from "@/assets/images/ImageIcon.png";
import TextIcon from "@/assets/images/TextIcon.png";
import VideoIcon from "@/assets/images/VideoIcon.png";

import { BaseRenderer } from "./BaseRenderer";

/**
 * 视频轨道渲染器
 * 负责视频轨道的渲染
 */
export class TrackLineRenderer extends BaseRenderer {
  private textures: Record<string, Texture | null> = {
    videoIcon: null,
    audioIcon: null,
    textIcon: null,
    imageIcon: null,
  };

  async init(app: Application, container?: Container): Promise<void> {
    await super.init(app, container);
  }

  /**
   * 执行渲染
   * @param data 渲染数据
   * @param styles 渲染样式
   */
  async render(data: TrackLineContext, styles: any): Promise<void> {
    const { marginTop = 30, gapHeight = 10 } = data;
    const { iconColor = "#555555" } = styles;
    await this.loadIconTextures(styles);
    const icon = new Sprite(this.textures.videoIcon as Texture);
    icon.tint = iconColor;
    icon.anchor.set(0.5);
    icon.width = 28;
    icon.height = 28;
    icon.position.set(30, marginTop + gapHeight);
    this.container?.addChild(icon);
  }

  /**
   * 加载图标
   * @param styles
   */
  async loadIconTextures(styles: any) {
    await Promise.all([
      (this.textures.videoIcon = await Assets.load(styles.videoIcon || VideoIcon)),
      (this.textures.audioIcon = await Assets.load(styles.audioIcon || AudioIcon)),
      (this.textures.textIcon = await Assets.load(styles.textIcon || TextIcon)),
      (this.textures.imageIcon = await Assets.load(styles.imageIcon || ImageIcon)),
    ]);
  }
}
