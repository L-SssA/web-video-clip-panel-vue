/**
 * 窗口缩放监听
 * @param cb 回调函数
 * @param options 配置
 */
export function useWindowResize(
  cb: (this: Window, ev: UIEvent) => any,
  options?: AddEventListenerOptions,
) {
  window.addEventListener("resize", cb, options);
  return () => window.removeEventListener("resize", cb);
}

/**
 * 监听元素变化
 * @param el 元素或元素列表
 * @param callback 回调函数
 * @param options 配置项
 */
export function useResizeObserver(
  el: Element | Element[],
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions,
) {
  const resizeObserver = new ResizeObserver(callback);
  if (!Array.isArray(el)) el = [el];
  el.forEach((_el) => resizeObserver.observe(_el, options));
  return () => resizeObserver.disconnect();
}
