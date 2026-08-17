/**
 * 生成指定长度的随机 UUID 字符串
 * @param length - UUID 长度，默认为 16
 * @returns 返回生成的 UUID 字符串
 */
export function generateUUID(length = 16): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uuid = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uuid += characters[randomIndex];
  }

  return uuid;
}

/**
 * 填充数字，例如 1 填充为 01
 * @param num
 * @param padCount
 * @param padChar
 * @returns
 */
export function padNumber(num: number, padCount = 2, padChar = "0") {
  return num.toString().padStart(padCount, padChar);
}

/**
 * 获取轨道时长，格式为 mm:ss
 * @param frameCount
 * @param fps
 * @returns
 */
export function getTrackDurationFormatted(frameCount: number, fps: number = 30) {
  // 帧数不被 30 整除时，不满 1 秒，返回超出帧数
  if (frameCount % fps !== 0) return `${frameCount % fps}F`;
  const seconds = Math.floor(frameCount / fps);
  const second = seconds % 60;
  const minute = Math.floor(seconds / 60);
  return `${padNumber(minute)}:${padNumber(second)}`;
}

/**
 * 格式化秒数为 mm:ss
 * @param seconds
 * @returns
 */
export const formatSeconds = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

/**
 * 防抖
 * @param fn
 * @param delay
 * @returns
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: number | null = null;

  return function (...args: Parameters<T>) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流
 * @param fn
 * @param limit
 * @returns
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * 时间转像素
 * @param time
 * @param fps
 * @param framesPerGap
 * @param gapWidth
 * @returns
 */
export function timeToPixel(time: number, fps: number, framesPerGap: number, gapWidth: number) {
  return ((time * fps) / framesPerGap) * gapWidth;
}

/**
 * 像素转时间
 * @param pixel
 * @param fps
 * @param framesPerGap
 * @param gapWidth
 * @returns
 */
export function pixelToTime(pixel: number, fps: number, framesPerGap: number, gapWidth: number) {
  // 计算一帧所占的宽度，用于限定当前时间每次移动的宽度是一帧的宽度的倍数
  const singleFrameWidth = gapWidth / framesPerGap;
  return Math.round(pixel / singleFrameWidth) / fps;
}

/**
 * 获取调整大小后的图像 Blob
 * @param img - 源图像元素
 * @param targetWidth - 目标宽度
 * @param targetHeight - 目标高度
 * @returns 返回 Promise<Blob>，包含调整大小后的图像数据
 */
export function getResizeImageBlob(
  img: CanvasImageSource,
  targetWidth: number,
  targetHeight: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => {
      resolve(blob as Blob);
      canvas.remove();
    }),
  );
}
