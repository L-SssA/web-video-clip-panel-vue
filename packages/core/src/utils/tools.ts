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
