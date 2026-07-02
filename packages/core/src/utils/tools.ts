export function padNumber(num: number, padCount = 2, padChar = "0") {
  return num.toString().padStart(padCount, padChar);
}

export function getTrackDurationFormatted(frameCount: number) {
  // 帧数不被 30 整除时，不满 1 秒，返回超出帧数
  if (frameCount % 30 !== 0) return `${frameCount % 30}F`;
  const seconds = Math.floor(frameCount / 30);
  const second = seconds % 60;
  const minute = Math.floor(seconds / 60);
  return `${padNumber(minute)}:${padNumber(second)}`;
}
