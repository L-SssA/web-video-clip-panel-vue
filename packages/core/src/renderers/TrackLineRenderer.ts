import type { Application } from "pixi.js";

import { Texture, Container, Assets } from "pixi.js";

import type { DataManagerContext } from "@/types/data";
import type { TrackLineGraphicsCache } from "@/types/trackline";

import { DEFAULT_COMMON_TRACK_HEIGHT, DEFAULT_ICONS_SOURCES } from "@/config/constant";
import { buildTrackLine } from "@/utils/trackline";

import { BaseRenderer } from "./BaseRenderer";

/**
 * 视频轨道渲染器
 * 负责视频轨道的渲染
 */
export class TrackLineRenderer extends BaseRenderer {
  // 图标缓存
  private textures: Record<string, Texture | null> = {
    videoIcon: null,
    audioIcon: null,
    textIcon: null,
    imageIcon: null,
  };
  // 图形实例缓存
  private cacheGraphics: Map<string | Symbol, TrackLineGraphicsCache> = new Map();

  async init(app: Application, container?: Container): Promise<void> {
    await super.init(app, container);
  }

  /**
   * 执行渲染
   * @param data 渲染数据
   */
  async render(data: DataManagerContext): Promise<void> {
    await this.loadIconTextures(data);
    this.drawTrackLine(data);
  }

  /**
   * 加载图标
   * @param styles
   */
  async loadIconTextures(data: DataManagerContext) {
    const { styles } = data.trackline;
    const promises: Promise<any>[] = [];
    for (const key of Object.keys(this.textures) as Array<keyof typeof this.textures>) {
      const source = styles.icons?.[key] || DEFAULT_ICONS_SOURCES[key];
      if (!source) continue;
      if (this.textures[key]?.label === source) continue;
      if (this.textures[key]) {
        this.textures[key].destroy();
        this.textures[key] = null;
      }
      promises.push(Assets.load(source).then((t) => (this.textures[key] = t)));
    }
    await Promise.allSettled(promises);
  }

  private drawTrackLine(data: DataManagerContext) {
    if (!this.app) return;

    const { mergeTrackLineList, trackHeights, gapHeight } = data.trackline;
    let tracklineTopOffset = 0;
    for (let i = 0; i < mergeTrackLineList.length; i++) {
      const trackline = mergeTrackLineList[i];
      const cacheGraphics = this.cacheGraphics.get(trackline.id);
      if (cacheGraphics) {
        const { container, iconSprite, backgroundGraphics, tracklineContainer, trackitems } =
          cacheGraphics;

        buildTrackLine(
          trackline,
          this.app,
          data,
          tracklineTopOffset,
          container,
          iconSprite,
          backgroundGraphics,
          tracklineContainer,
          trackitems,
        );
      } else {
        const { container, iconSprite, backgroundGraphics, tracklineContainer, trackitems } =
          buildTrackLine(trackline, this.app, data, tracklineTopOffset);

        iconSprite.texture = this.textures[`${trackline.type}Icon`] || Texture.EMPTY;
        this.container?.addChild(container);

        // 缓存图形实例
        this.cacheGraphics.set(trackline.id, {
          container,
          iconSprite,
          backgroundGraphics,
          tracklineContainer,
          trackitems,
        });
      }
      tracklineTopOffset +=
        (trackHeights[trackline.type] || DEFAULT_COMMON_TRACK_HEIGHT) + gapHeight;
    }
  }
}
