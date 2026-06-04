// 计算两点之间的距离
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// 计算两点之间的角度
export function angle(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

// 线性插值
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// 限制值在范围内
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// 生成随机整数
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机浮点数
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// 生成唯一 ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// 计算贝塞尔曲线上的点
export function bezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): { x: number; y: number } {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
}

// 计算角度对应的单位向量
export function angleToVector(angle: number): { x: number; y: number } {
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
}

// 计算向量的长度
export function vectorLength(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

// 归一化向量
export function normalizeVector(
  x: number,
  y: number
): { x: number; y: number } {
  const length = vectorLength(x, y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

// 计算两个向量的点积
export function dotProduct(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return x1 * x2 + y1 * y2;
}

// 检测两个矩形是否重叠
export function rectanglesOverlap(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// 计算矩形中心点
export function rectangleCenter(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}): { x: number; y: number } {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

// 计算两个矩形之间的距离
export function rectanglesDistance(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): number {
  const center1 = rectangleCenter(rect1);
  const center2 = rectangleCenter(rect2);
  return distance(center1.x, center1.y, center2.x, center2.y);
}
