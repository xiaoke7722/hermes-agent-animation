import type { ImageAssets } from '../types/images';

/** 2.5D 等距视角调色板 —— 保留用于发光颜色和 UI 配色 */
export const PALETTES = {
  mainAgent: {
    skin: '#FFD5B8',
    hair: '#4A3728',
    shirt: '#3B82F6',
    shirtDark: '#2563EB',
    pants: '#1E3A5F',
    pantsDark: '#1E3A8F',
    shoes: '#1F2937',
    shoesDark: '#111827',
    glow: '#60A5FA',
    accent: '#FBBF24',
    shadow: 'rgba(0, 0, 0, 0.2)',
  },
  subAgent: {
    skin: '#FFD5B8',
    hair: '#6B7280',
    shirt: '#10B981',
    shirtDark: '#059669',
    pants: '#064E3B',
    pantsDark: '#064E8B',
    shoes: '#1F2937',
    shoesDark: '#111827',
    glow: '#34D399',
    accent: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.2)',
  },
};

/** Agent 图片键 */
export type AgentImageKey =
  | 'main_idle'
  | 'main_working'
  | 'main_thinking'
  | 'sub_working'
  | 'sub_collaborating';

/**
 * 将动画类型映射为图片键
 * @param type 动画类型（idle / working / thinking / walking / distributing / collaborating）
 * @param isMainAgent 是否为主 Agent
 */
export function getAgentImageKey(type: string, isMainAgent: boolean): AgentImageKey {
  if (isMainAgent) {
    switch (type) {
      case 'working':
        return 'main_working';
      case 'thinking':
        return 'main_thinking';
      case 'idle':
      case 'walking':
      case 'distributing':
      default:
        return 'main_idle';
    }
  } else {
    switch (type) {
      case 'collaborating':
        return 'sub_collaborating';
      case 'working':
      default:
        return 'sub_working';
    }
  }
}

/**
 * 根据图片键从 ImageAssets 中获取对应的 HTMLImageElement
 */
export function getAgentImage(key: AgentImageKey, images: ImageAssets): HTMLImageElement {
  switch (key) {
    case 'main_idle':
      return images.agents.main.idle;
    case 'main_working':
      return images.agents.main.working;
    case 'main_thinking':
      return images.agents.main.thinking;
    case 'sub_working':
      return images.agents.sub.working;
    case 'sub_collaborating':
      return images.agents.sub.collaborating;
  }
}
