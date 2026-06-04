import type { ImageAssets } from '../types/images';

/** 加载单张图片 */
function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`图片加载失败: ${path}`));
    img.src = path;
  });
}

/** 图片路径配置 —— 相对于 public/ 的 URL */
const IMAGE_PATHS = {
  backgrounds: {
    main: '/images/backgrounds/office_main.png',
    morning: '/images/backgrounds/office_morning.png',
    evening: '/images/backgrounds/office_evening.png',
    night: '/images/backgrounds/office_night.png',
  },
  agents: {
    main: {
      idle: '/images/agents/main_agent_idle.png',
      working: '/images/agents/main_agent_working.png',
      thinking: '/images/agents/main_agent_thinking.png',
    },
    sub: {
      working: '/images/agents/sub_agent_working.png',
      collaborating: '/images/agents/sub_agent_collaborating.png',
    },
  },
  furniture: {
    desk: '/images/furniture/desk.png',
    monitor: '/images/furniture/monitor.png',
    bookshelf: '/images/furniture/bookshelf.png',
    window: '/images/furniture/window.png',
    plant: '/images/furniture/plant.png',
    coffeeCup: '/images/furniture/coffee_cup.png',
  },
  ui: {
    taskBox: '/images/ui/task_box.png',
    statusBox: '/images/ui/status_box.png',
    progressBar: '/images/ui/progress_bar.png',
  },
  effects: {
    dust: '/images/effects/dust_particles.png',
    sparkle: '/images/effects/sparkle_particles.png',
    lightRays: '/images/effects/light_rays.png',
  },
};

/** 预加载全部 21 张图片，返回结构化 ImageAssets 对象 */
export async function preloadAllImages(): Promise<ImageAssets> {
  const [
    // 背景
    bgMain, bgMorning, bgEvening, bgNight,
    // Agent
    mainIdle, mainWorking, mainThinking,
    subWorking, subCollaborating,
    // 家具
    desk, monitor, bookshelf, windowImg, plant, coffeeCup,
    // UI
    taskBox, statusBox, progressBar,
    // 特效
    dust, sparkle, lightRays,
  ] = await Promise.all([
    loadImage(IMAGE_PATHS.backgrounds.main),
    loadImage(IMAGE_PATHS.backgrounds.morning),
    loadImage(IMAGE_PATHS.backgrounds.evening),
    loadImage(IMAGE_PATHS.backgrounds.night),
    loadImage(IMAGE_PATHS.agents.main.idle),
    loadImage(IMAGE_PATHS.agents.main.working),
    loadImage(IMAGE_PATHS.agents.main.thinking),
    loadImage(IMAGE_PATHS.agents.sub.working),
    loadImage(IMAGE_PATHS.agents.sub.collaborating),
    loadImage(IMAGE_PATHS.furniture.desk),
    loadImage(IMAGE_PATHS.furniture.monitor),
    loadImage(IMAGE_PATHS.furniture.bookshelf),
    loadImage(IMAGE_PATHS.furniture.window),
    loadImage(IMAGE_PATHS.furniture.plant),
    loadImage(IMAGE_PATHS.furniture.coffeeCup),
    loadImage(IMAGE_PATHS.ui.taskBox),
    loadImage(IMAGE_PATHS.ui.statusBox),
    loadImage(IMAGE_PATHS.ui.progressBar),
    loadImage(IMAGE_PATHS.effects.dust),
    loadImage(IMAGE_PATHS.effects.sparkle),
    loadImage(IMAGE_PATHS.effects.lightRays),
  ]);

  return {
    backgrounds: { main: bgMain, morning: bgMorning, evening: bgEvening, night: bgNight },
    agents: {
      main: { idle: mainIdle, working: mainWorking, thinking: mainThinking },
      sub: { working: subWorking, collaborating: subCollaborating },
    },
    furniture: { desk, monitor, bookshelf, window: windowImg, plant, coffeeCup },
    ui: { taskBox, statusBox, progressBar },
    effects: { dust, sparkle, lightRays },
  };
}
