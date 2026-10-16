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

/**
 * 数字转css值
 * @param value
 * @param unit
 * @returns
 */
export function numberToStyleValue(value: number | string, unit: string = "px") {
  return typeof value === "number" ? `${value}${unit}` : String(value);
}

/**
 * 数字是否在范围内
 * @param num 数字
 * @param min 下限
 * @param max 上线
 * @returns 数字是否在范围内
 */
export function isNumberInside(num: number, min: number, max: number) {
  return min < num && num < max;
}

/**
 * 加载视频地址元数据
 * @param url 资源地址
 */
export function loadVideoUrlMetadata(url: string) {
  return new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
    const video = document.createElement("video");
    // 预加载提示：仅加载元数据
    video.preload = "metadata";
    video.src = url;

    // 成功加载元数据
    video.addEventListener("loadedmetadata", () => {
      const meta = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      };
      video.remove();
      resolve(meta);
    });

    video.addEventListener("error", (e) => {
      video.remove();
      reject(e);
    });
  });
}

/**
 * 加载音频地址元数据
 * @param url 资源地址
 */
export function loadAudioUrlMetadata(url: string) {
  return new Promise<{ duration: number }>((resolve, reject) => {
    const audio = document.createElement("audio");
    // 预加载提示：仅加载元数据
    audio.preload = "metadata";
    audio.src = url;

    // 成功加载元数据
    audio.addEventListener("loadedmetadata", () => {
      const meta = {
        duration: audio.duration,
      };
      audio.remove();
      resolve(meta);
    });

    audio.addEventListener("error", (e) => {
      audio.remove();
      reject(e);
    });
  });
}

/**
 * 加载图片地址元数据
 * @param url 资源地址
 */ export function loadImageMetadata(url: string | ImageBitmap) {
  if (url instanceof ImageBitmap) {
    return Promise.resolve({
      width: url.width,
      height: url.height,
    });
  } else {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = document.createElement("img");
      image.src = url;

      // 成功加载元数据
      image.addEventListener("load", () => {
        const meta = {
          width: image.width,
          height: image.height,
        };
        image.remove();
        resolve(meta);
      });

      image.addEventListener("error", (e) => {
        image.remove();
        reject(e);
      });
    });
  }
}

/**
 * Promise 休眠
 * @param time 时间（毫秒）
 */
export function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

/**
 * 判断 child 是否是 parent 的后代（不含自身）
 * @param parent
 * @param child
 */
export function isDescendantElement(parent: HTMLElement, child: HTMLElement) {
  if (!parent || !child) return false;
  return parent !== child && parent.contains(child);
}

/**
 * 完整深拷贝函数
 * @param source 待拷贝数据
 * @param cache 循环引用缓存，外部不要传
 */
function deepCopy<T>(source: T, cache = new WeakMap<object, object>()): T {
  // 1. 基础类型 / null 直接返回
  if (source === null || typeof source !== "object") {
    return source;
  }

  // 2. 循环引用：已经拷贝过的对象直接返回缓存
  if (cache.has(source)) {
    return cache.get(source) as T;
  }

  // 3. Date
  if (source instanceof Date) {
    const copy = new Date(source);
    cache.set(source, copy);
    return copy as T;
  }

  // 4. RegExp
  if (source instanceof RegExp) {
    const copy = new RegExp(source.source, source.flags);
    copy.lastIndex = source.lastIndex;
    cache.set(source, copy);
    return copy as T;
  }

  // 5. Set
  if (source instanceof Set) {
    const copy = new Set();
    cache.set(source, copy);
    for (const value of source) {
      copy.add(deepCopy(value, cache));
    }
    return copy as T;
  }

  // 6. Map
  if (source instanceof Map) {
    const copy = new Map();
    cache.set(source, copy);
    for (const [key, value] of source) {
      copy.set(deepCopy(key, cache), deepCopy(value, cache));
    }
    return copy as T;
  }

  // 7. Array
  if (Array.isArray(source)) {
    const copy: any[] = [];
    cache.set(source, copy);
    for (let i = 0; i < source.length; i++) {
      copy[i] = deepCopy(source[i], cache);
    }
    return copy as T;
  }

  // 8. 普通对象（含 Symbol 键）
  const copy = {} as Record<string | symbol, any>;
  cache.set(source, copy);

  // 遍历字符串 key
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      copy[key] = deepCopy((source as Record<string, any>)[key], cache);
    }
  }

  // 遍历 Symbol key
  const symbolKeys = Object.getOwnPropertySymbols(source);
  for (const symKey of symbolKeys) {
    copy[symKey] = deepCopy((source as Record<symbol, any>)[symKey], cache);
  }

  return copy as T;
}

export default deepCopy;
