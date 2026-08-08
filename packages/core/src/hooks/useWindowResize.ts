export const useWindowResize = (callback: () => void | Promise<void>) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};
