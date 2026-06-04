import type { ImageAssets } from '../types/images';

// ==================== 类型定义 ====================

export interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  type: 'sparkle' | 'dust' | 'glow';
}

// ==================== 背景渲染 ====================

/**
 * Cover-fit 背景渲染 —— 等比缩放裁剪，不变形
 * 将 1024×1024 原图以 cover 方式适配到 canvas
 */
export function renderImageBackground(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasW: number,
  canvasH: number
): void {
  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;

  const scale = Math.max(canvasW / imgW, canvasH / imgH);
  const sw = canvasW / scale;
  const sh = canvasH / scale;
  const sx = (imgW - sw) / 2;
  const sy = (imgH - sh) / 2;

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
}

/**
 * 暗色渐变叠加 —— 让亮色背景与暗色主题和谐
 * 多层叠加：暖色去饱和 + 暗角 + 底部加深（地面区域）
 */
export function renderBackgroundOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  // 第一层：整体暗化 + 冷色去饱和（抵消原图的暖黄调）
  ctx.fillStyle = 'rgba(10, 12, 30, 0.45)';
  ctx.fillRect(0, 0, w, h);

  // 第二层：底部地面区域进一步加深（Agent 头像所在的区域）
  const floorGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
  floorGrad.addColorStop(0, 'rgba(10, 12, 30, 0)');
  floorGrad.addColorStop(0.5, 'rgba(10, 12, 30, 0.35)');
  floorGrad.addColorStop(1, 'rgba(8, 10, 24, 0.6)');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 0, w, h);
}

// ==================== Agent 渲染（圆形头像裁剪） ====================

/**
 * 圆形头像裁剪 —— 解决 PNG 无 alpha 通道的合成问题
 * Agent 显示为圆形头像 + 光环 + 阴影
 */
export function renderAgentAvatar(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  radius: number,
  glowColor?: string,
  time: number = 0
): void {
  const floatOffset = Math.sin(time / 1500 + x * 0.001) * 2;

  ctx.save();

  // 阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;

  // 外发光环
  if (glowColor) {
    ctx.beginPath();
    ctx.arc(x, y + floatOffset, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // 白色底环（头像边框）
  ctx.beginPath();
  ctx.arc(x, y + floatOffset, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // 圆形裁剪
  ctx.beginPath();
  ctx.arc(x, y + floatOffset, radius, 0, Math.PI * 2);
  ctx.clip();

  // 绘制图片（居中裁剪为正方形区域）
  const imgSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const sx = ((image.naturalWidth || image.width) - imgSize) / 2;
  const sy = ((image.naturalHeight || image.height) - imgSize) / 2;
  ctx.drawImage(image, sx, sy, imgSize, imgSize, x - radius, y - radius + floatOffset, radius * 2, radius * 2);

  ctx.restore();

  // 边框细线
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y + floatOffset, radius, 0, Math.PI * 2);
  ctx.strokeStyle = glowColor || 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

// ==================== 程序化 UI 元素 ====================

/** 状态标签 —— 纯程序化，精致小标签 */
export function renderStatusBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
  time: number = 0
): void {
  const floatOffset = Math.sin(time / 900 + x * 0.002) * 1;
  const metrics = ctx.measureText(text);
  const pw = 14;
  const bw = metrics.width + pw * 2;
  const bh = 20;

  ctx.save();

  // 半透明底色
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(x - bw / 2, y - bh / 2 + floatOffset, bw, bh, 10);
  ctx.fill();

  // 颜色指示点
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(x - bw / 2 + 10, y + floatOffset, 4, 0, Math.PI * 2);
  ctx.fill();

  // 文字
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 10px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 4, y + floatOffset);

  ctx.restore();
}

/** 任务名称标签 */
export function renderTaskLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  taskName: string,
  time: number = 0
): void {
  const floatOffset = Math.sin(time / 800 + x * 0.003) * 1;
  const metrics = ctx.measureText(taskName);
  const bw = Math.max(metrics.width + 20, 60);
  const bh = 18;

  ctx.save();

  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(x - bw / 2, y - bh / 2 + floatOffset, bw, bh, 9);
  ctx.fill();

  // 文字
  ctx.fillStyle = '#FCD34D';
  ctx.font = '600 9px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(taskName, x, y + floatOffset);

  ctx.restore();
}

/** 任务包 —— 程序化绘制，更精致 */
export function renderTaskPacket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  progress: number,
  time: number = 0
): void {
  const floatOffset = Math.sin(time / 1000 + x * 0.002) * 2;

  ctx.save();

  // 外发光
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;

  // 主体
  const gradient = ctx.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#F59E0B');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x - size / 2, y - size / 2 + floatOffset, size, size, 5);
  ctx.fill();

  // 高光条
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.roundRect(x - size / 2 + 3, y - size / 2 + floatOffset + 3, size - 6, size * 0.3, 3);
  ctx.fill();

  // 进度条
  const pw = size - 6;
  const ph = 5;
  const px = x - pw / 2;
  const py = y + size / 2 + 6 + floatOffset;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 3);
  ctx.fill();

  const fillGrad = ctx.createLinearGradient(px, py, px + pw * progress, py);
  fillGrad.addColorStop(0, '#FFFFFF');
  fillGrad.addColorStop(1, '#FDE68A');
  ctx.fillStyle = fillGrad;
  ctx.beginPath();
  ctx.roundRect(px, py, pw * progress, ph, 3);
  ctx.fill();

  ctx.restore();
}

// ==================== 粒子效果 ====================

export function renderParticleImages(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  effectImages: ImageAssets['effects'],
  time: number
): void {
  for (const particle of particles) {
    ctx.save();

    const px = particle.x + Math.sin(time / 2000 + particle.y / 100) * 2;
    const py = particle.y + Math.cos(time / 1500 + particle.x / 120) * 1.5;

    let img: HTMLImageElement;
    let size: number;

    switch (particle.type) {
      case 'sparkle':
        img = effectImages.sparkle;
        size = particle.size * 2;
        ctx.globalAlpha = particle.opacity * (0.5 + Math.sin(time / 400 + particle.x) * 0.3);
        break;
      case 'dust':
        img = effectImages.dust;
        size = particle.size * 2;
        ctx.globalAlpha = particle.opacity * 0.35;
        break;
      case 'glow':
      default:
        img = effectImages.sparkle;
        size = particle.size * 3;
        ctx.globalAlpha = particle.opacity * (0.2 + Math.sin(time / 600 + particle.y) * 0.15);
        break;
    }

    ctx.drawImage(img, px - size / 2, py - size / 2, size, size);
    ctx.restore();
  }
}

// ==================== 连接线 ====================

export function renderConnectionLine(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  progress: number,
  time: number = 0
): void {
  ctx.save();

  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - 50;

  // 流动虚线
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.45;
  ctx.lineDashOffset = -time / 50;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.stroke();

  // 进度点
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  const t = progress;
  const px = (1 - t) ** 2 * startX + 2 * (1 - t) * t * midX + t ** 2 * endX;
  const py = (1 - t) ** 2 * startY + 2 * (1 - t) * t * midY + t ** 2 * endY;

  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ==================== 思考/对话泡泡 ====================

export function renderThoughtBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1,
  time: number = 0
): void {
  ctx.save();
  const floatOffset = Math.sin(time / 1200) * 1.5;

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.ellipse(x, y + floatOffset, 16 * scale, 11 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x - 7 * scale, y + 13 * scale + floatOffset, 3.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x - 3 * scale, y + 18 * scale + floatOffset, 2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function renderSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  scale: number = 1,
  time: number = 0
): void {
  ctx.save();
  const floatOffset = Math.sin(time / 1000) * 1.5;
  const padding = 10 * scale;

  ctx.font = `600 ${11 * scale}px "Segoe UI", system-ui, sans-serif`;
  const metrics = ctx.measureText(text);
  const bw = metrics.width + padding * 2;
  const bh = 20 * scale;

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - bw / 2, y - bh / 2 + floatOffset, bw, bh, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1F2937';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + floatOffset);

  ctx.restore();
}

// ==================== 分裂特效 ====================

export function renderSplitEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  color: string,
  time: number = 0
): void {
  ctx.save();
  const maxRadius = 40;
  const radius = maxRadius * progress;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 1 - progress;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.5 * (1 - progress);
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  // 光线
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.25 * (1 - progress);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time / 1000;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle - 0.05) * radius * 1.4, y + Math.sin(angle - 0.05) * radius * 1.4);
    ctx.lineTo(x + Math.cos(angle + 0.05) * radius * 1.4, y + Math.sin(angle + 0.05) * radius * 1.4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// ==================== 装饰元素 ====================

/** 画面暗角 */
export function renderVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.45, w / 2, h / 2, w * 0.75);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/** 标题栏 */
export function renderTitleBar(
  ctx: CanvasRenderingContext2D,
  w: number,
  time: number
): void {
  ctx.save();

  const alpha = 0.65 + Math.sin(time / 3000) * 0.05;
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.roundRect(w / 2 - 140, 10, 280, 32, 8);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Hermes Agent · 工作流', w / 2, 26);

  ctx.restore();
}

// ==================== 数据生成 ====================

export function generateParticles(
  width: number,
  height: number,
  count: number
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: r < 0.4 ? 4 + Math.random() * 6 : 1.5 + Math.random() * 3,
      speed: 0.2 + Math.random() * 0.6,
      opacity: 0.25 + Math.random() * 0.35,
      type: r < 0.4 ? 'sparkle' : r < 0.7 ? 'dust' : 'glow',
    });
  }
  return particles;
}
