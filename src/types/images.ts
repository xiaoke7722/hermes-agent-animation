/** 预加载的图片资源集合 */
export interface ImageAssets {
  backgrounds: {
    main: HTMLImageElement;
    morning: HTMLImageElement;
    evening: HTMLImageElement;
    night: HTMLImageElement;
  };
  agents: {
    main: {
      idle: HTMLImageElement;
      working: HTMLImageElement;
      thinking: HTMLImageElement;
    };
    sub: {
      working: HTMLImageElement;
      collaborating: HTMLImageElement;
    };
  };
  furniture: {
    desk: HTMLImageElement;
    monitor: HTMLImageElement;
    bookshelf: HTMLImageElement;
    window: HTMLImageElement;
    plant: HTMLImageElement;
    coffeeCup: HTMLImageElement;
  };
  ui: {
    taskBox: HTMLImageElement;
    statusBox: HTMLImageElement;
    progressBar: HTMLImageElement;
  };
  effects: {
    dust: HTMLImageElement;
    sparkle: HTMLImageElement;
    lightRays: HTMLImageElement;
  };
}
