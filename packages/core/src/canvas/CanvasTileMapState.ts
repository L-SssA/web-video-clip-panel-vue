export class CanvasTileMapState {
  public transform: DOMMatrix = new DOMMatrix();
  public globalAlpha: number = 1.0;
  public globalCompositeOperation: GlobalCompositeOperation = "source-over";

  public fillStyle: string | CanvasGradient | CanvasPattern = "#000000";
  public strokeStyle: string | CanvasGradient | CanvasPattern = "000000";

  public imageSmoothingEnabled: boolean = true;
  public imageSmoothingQuality: ImageSmoothingQuality = "low";

  public lineCap: CanvasLineCap = "butt";
  public lineDashOffset: number = 0.0;
  public lineJoin: CanvasLineJoin = "miter";
  public lineWidth: number = 1.0;
  public miterLimit: number = 10.0;

  public shadowBlur: number = 0;
  public shadowColor: string = "rgba(0, 0, 0, 0)";
  public shadowOffsetX: number = 0;
  public shadowOffsetY: number = 0;

  public direction: CanvasDirection = "inherit";
  public font: string = "10px sans-serif";
  public fontKerning: CanvasFontKerning = "auto";
  public fontStretch: CanvasFontStretch = "normal";
  public fontVariantCaps: CanvasFontVariantCaps = "normal";
  public letterSpacing: string = "0px";
  public textAlign: CanvasTextAlign = "start";
  public textBaseline: CanvasTextBaseline = "alphabetic";
  public textRendering: CanvasTextRendering = "auto";
  public wordSpacing: string = "0px";

  /**
   * 拷贝当前CanvasState实例
   * DOMMatrix新建副本；CanvasGradient/CanvasPattern只能引用复用（浏览器限制，无法克隆）
   */
  clone(): CanvasTileMapState {
    const next = new CanvasTileMapState();
    // 矩阵单独拷贝
    next.transform = DOMMatrix.fromMatrix(this.transform);

    // 基础属性直接复制
    next.globalAlpha = this.globalAlpha;
    next.globalCompositeOperation = this.globalCompositeOperation;
    next.fillStyle = this.fillStyle;
    next.strokeStyle = this.strokeStyle;
    next.imageSmoothingEnabled = this.imageSmoothingEnabled;
    next.imageSmoothingQuality = this.imageSmoothingQuality;
    next.lineCap = this.lineCap;
    next.lineDashOffset = this.lineDashOffset;
    next.lineJoin = this.lineJoin;
    next.lineWidth = this.lineWidth;
    next.miterLimit = this.miterLimit;
    next.shadowBlur = this.shadowBlur;
    next.shadowColor = this.shadowColor;
    next.shadowOffsetX = this.shadowOffsetX;
    next.shadowOffsetY = this.shadowOffsetY;
    next.direction = this.direction;
    next.font = this.font;
    next.fontKerning = this.fontKerning;
    next.fontStretch = this.fontStretch;
    next.fontVariantCaps = this.fontVariantCaps;
    next.letterSpacing = this.letterSpacing;
    next.textAlign = this.textAlign;
    next.textBaseline = this.textBaseline;
    next.textRendering = this.textRendering;
    next.wordSpacing = this.wordSpacing;

    return next;
  }
}
