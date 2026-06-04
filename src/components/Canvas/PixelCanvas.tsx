import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Agent, TaskPacket, Connection } from '../../types/agent';
import type { ImageAssets } from '../../types/images';
import { preloadAllImages } from '../../utils/imageLoader';
import {
  renderImageBackground,
  renderBackgroundOverlay,
  renderAgentAvatar,
  renderTaskPacket,
  renderStatusBadge,
  renderTaskLabel,
  renderParticleImages,
  renderConnectionLine,
  renderThoughtBubble,
  renderSpeechBubble,
  renderSplitEffect,
  renderVignette,
  renderTitleBar,
  generateParticles,
  type Particle,
} from '../../utils/pixelRenderer';
import { getAgentImageKey, getAgentImage } from '../../utils/pixelArt';

interface PixelCanvasProps {
  mainAgent: Agent;
  subAgents: Agent[];
  taskPackets: TaskPacket[];
  connections: Connection[];
  width?: number;
  height?: number;
  splitEffect?: {
    x: number;
    y: number;
    progress: number;
    color: string;
  } | null;
}

type LoadingState = 'loading' | 'ready' | 'error';

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  mainAgent,
  subAgents,
  taskPackets,
  connections,
  width = 960,
  height = 640,
  splitEffect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());

  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [images, setImages] = useState<ImageAssets | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [particles] = useState<Particle[]>(() => generateParticles(width, height, 25));

  // 预加载图片
  useEffect(() => {
    let cancelled = false;
    preloadAllImages()
      .then((loaded) => { if (!cancelled) { setImages(loaded); setLoadingState('ready'); } })
      .catch((err: Error) => { if (!cancelled) { setLoadError(err.message); setLoadingState('error'); } });
    return () => { cancelled = true; };
  }, []);

  // 重试加载
  const retryLoad = useCallback(() => {
    setLoadingState('loading');
    setLoadError(null);
    preloadAllImages()
      .then((loaded) => { setImages(loaded); setLoadingState('ready'); })
      .catch((err: Error) => { setLoadError(err.message); setLoadingState('error'); });
  }, []);

  // 主渲染回调
  const render = useCallback(() => {
    if (!images || loadingState !== 'ready') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = Date.now() - startTimeRef.current;
    ctx.clearRect(0, 0, width, height);

    // 1. 背景（cover-fit） + 暗色叠加让亮背景融入暗色主题
    renderImageBackground(ctx, images.backgrounds.evening, width, height);
    renderBackgroundOverlay(ctx, width, height);

    // 2. 连接线（程序化）
    for (const c of connections) {
      const [fx, fy] = c.from.split(',').map(Number);
      const [tx, ty] = c.to.split(',').map(Number);
      renderConnectionLine(ctx, fx, fy, tx, ty, '#FBBF24', c.progress, time);
    }

    // 3. 任务包（程序化）
    for (const p of taskPackets) {
      renderTaskPacket(ctx, p.position.x, p.position.y, 36, '#F59E0B', p.progress, time);
    }

    // 4. 分裂特效
    if (splitEffect) {
      renderSplitEffect(ctx, splitEffect.x, splitEffect.y, splitEffect.progress, splitEffect.color, time);
    }

    // 5. 子 Agent（圆形头像）
    for (const agent of subAgents) {
      const key = getAgentImageKey(agent.status, false);
      const sprite = getAgentImage(key, images);
      const glowColor = agent.status === 'working' ? '#34D399' : undefined;

      renderAgentAvatar(ctx, sprite, agent.position.x, agent.position.y, 42, glowColor, time);

      const statusText = STATUS_LABELS[agent.status] || '空闲';
      const statusColor = STATUS_COLORS[agent.status] || '#9CA3AF';
      renderStatusBadge(ctx, agent.position.x, agent.position.y + 55, statusText, statusColor, time);

      if (agent.tasks.length > 0) {
        renderTaskLabel(ctx, agent.position.x, agent.position.y - 55, agent.tasks[0].name, time);
      }
    }

    // 6. 主 Agent（圆形头像，更大）
    const mainKey = getAgentImageKey(mainAgent.status, true);
    const mainSprite = getAgentImage(mainKey, images);
    const mainGlow =
      mainAgent.status === 'working' ? '#FBBF24' :
      mainAgent.status === 'thinking' ? '#A78BFA' :
      mainAgent.status === 'distributing' ? '#F59E0B' :
      mainAgent.status === 'collaborating' ? '#60A5FA' :
      undefined;

    renderAgentAvatar(ctx, mainSprite, mainAgent.position.x, mainAgent.position.y, 56, mainGlow, time);

    const mainStatusText = STATUS_LABELS[mainAgent.status] || '空闲';
    const mainStatusColor = STATUS_COLORS[mainAgent.status] || '#9CA3AF';
    renderStatusBadge(ctx, mainAgent.position.x, mainAgent.position.y + 72, mainStatusText, mainStatusColor, time);

    // 思考泡泡
    if (mainAgent.status === 'thinking') {
      renderThoughtBubble(ctx, mainAgent.position.x + 50, mainAgent.position.y - 70, 1, time);
    }

    // 协作对话
    if (mainAgent.status === 'collaborating') {
      renderSpeechBubble(ctx, mainAgent.position.x, mainAgent.position.y - 80, '协作中...', 1, time);
    }

    // 7. 粒子（图章，在上层）
    renderParticleImages(ctx, particles, images.effects, time);

    // 8. 暗角
    renderVignette(ctx, width, height);

    // 9. 标题栏
    renderTitleBar(ctx, width, time);

    animFrameRef.current = requestAnimationFrame(render);
  }, [mainAgent, subAgents, taskPackets, connections, width, height, splitEffect, particles, images, loadingState]);

  // 动画循环
  useEffect(() => {
    if (loadingState !== 'ready') return;
    animFrameRef.current = requestAnimationFrame(render);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [render, loadingState]);

  // Loading 画面
  useEffect(() => {
    if (loadingState !== 'loading') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 绘制精致的 loading 背景
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(0.5, '#16213e');
    grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 动画点
    const t = Date.now() / 500;
    for (let i = 0; i < 3; i++) {
      const alpha = 0.4 + 0.6 * Math.sin(t - i * Math.PI / 1.5);
      ctx.fillStyle = `rgba(245, 158, 11, ${Math.abs(alpha)})`;
      ctx.beginPath();
      ctx.arc(width / 2 - 20 + i * 20, height / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '600 13px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('加载素材中...', width / 2, height / 2 + 30);

    // 持续绘制 loading 动画
    let loadingFrame: number;
    const drawLoading = () => {
      if (loadingState !== 'loading') return;
      const c = canvasRef.current;
      if (!c) return;
      const cx = c.getContext('2d');
      if (!cx) return;

      cx.fillStyle = grad;
      cx.fillRect(0, 0, width, height);

      const tt = Date.now() / 500;
      for (let i = 0; i < 3; i++) {
        const alpha = 0.4 + 0.6 * Math.sin(tt - i * Math.PI / 1.5);
        cx.fillStyle = `rgba(245, 158, 11, ${Math.abs(alpha)})`;
        cx.beginPath();
        cx.arc(width / 2 - 20 + i * 20, height / 2, 5, 0, Math.PI * 2);
        cx.fill();
      }

      cx.fillStyle = 'rgba(255,255,255,0.7)';
      cx.font = '600 13px "Segoe UI", system-ui, sans-serif';
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.fillText('加载素材中...', width / 2, height / 2 + 30);

      loadingFrame = requestAnimationFrame(drawLoading);
    };
    loadingFrame = requestAnimationFrame(drawLoading);

    return () => { if (loadingFrame) cancelAnimationFrame(loadingFrame); };
  }, [loadingState, width, height]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          borderRadius: '12px',
          backgroundColor: '#0f0f1a',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      />

      {/* 错误覆盖层 */}
      {loadingState === 'error' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15,15,26,0.95)',
          borderRadius: '12px', gap: '16px',
        }}>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <div style={{ fontSize: '15px', color: '#FCA5A5', fontWeight: 600 }}>素材加载失败</div>
          <div style={{ fontSize: '11px', color: '#9CA3AF', maxWidth: '320px', textAlign: 'center' }}>
            {loadError}
          </div>
          <button onClick={retryLoad} style={{
            padding: '10px 28px', backgroundColor: '#F59E0B', border: 'none',
            borderRadius: '8px', color: '#1a1a2e', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
          }}>
            重新加载
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== 静态映射 ====================

const STATUS_LABELS: Record<string, string> = {
  working: '工作中',
  thinking: '思考中',
  distributing: '分发中',
  collaborating: '协作中',
  walking: '移动中',
  idle: '空闲',
};

const STATUS_COLORS: Record<string, string> = {
  working: '#34D399',
  thinking: '#A78BFA',
  distributing: '#FBBF24',
  collaborating: '#60A5FA',
  walking: '#9CA3AF',
  idle: '#6B7280',
};
