// ./kernel.js

export const kernelFunction = function (width, height, hue) {
  const i = this.thread.x;
  const y = Math.floor(i / (width * 4));
  const x = Math.floor(i / 4 - y * width);
  const channel = i % 4;
  const normalizedX = x / width;
  const normalizedY = y / height;

  let r, g, b;

  const angle = (hue * 360) % 360;
  const h = angle / 60;
  const c = 255 * (1 - Math.abs(2 * normalizedY - 1));
  const xComponent = c * (1 - Math.abs((h % 2) - 1));

  if (h >= 0 && h < 1) {
    r = c;
    g = xComponent * normalizedX;
    b = 0;
  } else if (h >= 1 && h < 2) {
    r = xComponent * (2 - normalizedX);
    g = c;
    b = 0;
  } else if (h >= 2 && h < 3) {
    r = 0;
    g = c;
    b = xComponent * normalizedX;
  } else if (h >= 3 && h < 4) {
    r = 0;
    g = xComponent * (4 - normalizedX);
    b = c;
  } else if (h >= 4 && h < 5) {
    r = xComponent * normalizedX;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = xComponent * (6 - normalizedX);
  }

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  if (channel === 0) return r;
  if (channel === 1) return g;
  if (channel === 2) return b;
  return 255;
};
