// 动画预设
export const ANIMATION_PRESETS = {
  // 分裂效果
  split: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // 移动到目标位置
  moveTo: (x: number, y: number) => ({
    animate: { x, y },
    transition: { duration: 1, ease: 'easeInOut' },
  }),

  // 任务包传递
  taskPass: (startX: number, startY: number, endX: number, endY: number) => {
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 50;

    return {
      animate: {
        x: [startX, midX, endX],
        y: [startY, midY, endY],
        scale: [1, 1.2, 1],
      },
      transition: {
        duration: 0.8,
        times: [0, 0.5, 1],
        ease: 'easeInOut',
      },
    };
  },

  // 思考泡泡出现
  thoughtBubbleAppear: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3, ease: 'backOut' },
  },

  // 脉冲效果
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  // 摇晃效果
  shake: {
    animate: {
      x: [0, -2, 2, -2, 2, 0],
    },
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },

  // 弹跳效果
  bounce: {
    animate: {
      y: [0, -10, 0],
    },
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  // 淡入
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },

  // 淡出
  fadeOut: {
    animate: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  // 缩放进入
  scaleIn: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { duration: 0.3, ease: 'backOut' },
  },

  // 旋转效果
  rotate: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
};

// 缓动函数
export const EASING = {
  linear: 'linear',
  easeIn: 'easeIn',
  easeOut: 'easeOut',
  easeInOut: 'easeInOut',
  backIn: 'backIn',
  backOut: 'backOut',
  backInOut: 'backInOut',
  circIn: 'circIn',
  circOut: 'circOut',
  circInOut: 'circInOut',
  anticipate: 'anticipate',
};

// 动画持续时间
export const DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 1,
};

// 动画重复次数
export const REPEAT = {
  none: 0,
  infinite: Infinity,
  once: 1,
  twice: 2,
};
