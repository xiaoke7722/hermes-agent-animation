# Hermes Agent 仪表盘

像素风格的多 Agent 工作流可视化面板。暗色主题，等距办公室场景，圆形 Agent 头像 + 任务分发动画。**纯数据驱动**，由 Hermes Agent 后端通过 `window.__hermesAgent` API 控制。

## 快速开始

```bash
npm install
npm run dev        # 开发模式，访问 http://localhost:5173
npm run build      # 生产构建 → dist/
npm run preview    # 预览生产构建
```

开发时可加 `?demo` 参数查看演示动画：

```
http://localhost:5173/?demo
```

## Hermes Agent 后端集成

部署后，后端通过全局 API 控制面板：

```javascript
// 更新主 Agent 状态
window.__hermesAgent.setState({
  mainAgent: { status: 'working' }
});

// 全量更新
window.__hermesAgent.setState({
  mainAgent: { status: 'thinking', tasks: [...] },
  subAgents: [ ... ],
  taskQueue: [ ... ],
});

// 任务分发特效（分裂光环 + 飞行任务包）
const task = window.__hermesAgent.addTask('数据分析');
window.__hermesAgent.dispatchTask(task, 480, 300, 600, 400);
window.__hermesAgent.triggerSplitEffect(480, 300);
```

### API 参考

| 方法 | 说明 |
|------|------|
| `setState(partial)` | 部分更新仪表盘状态，自动合并 |
| `getState()` | 获取当前完整状态 |
| `addTask(name)` | 添加任务到队列，返回 Task 对象 |
| `dispatchTask(task, fromX, fromY, toX, toY)` | 创建任务分发动画（分包 + 连接线 + 子 Agent） |
| `triggerSplitEffect(x, y)` | 在指定位置触发分裂光环特效 |
| `toggleDemo()` | 开关演示模式 |

### 状态结构 `DashboardState`

```typescript
interface DashboardState {
  mainAgent: Agent;           // 主 Agent
  subAgents: Agent[];         // 子 Agent 列表
  connections: Connection[];  // 任务连接线
  taskPackets: TaskPacket[];  // 飞行中的任务包
  taskQueue: Task[];          // 任务队列
  splitEffect: SplitEffect | null;  // 分裂特效
}
```

## Linux 部署

`dist/` 是纯静态文件，任意 HTTP 服务器托管即可：

```bash
npm run build

# nginx
cp -r dist/* /var/www/hermes-dashboard/

# 或直接内嵌到 Hermes Agent 的静态服务中
```

## 项目结构

```
src/
├── components/
│   ├── Canvas/
│   │   └── PixelCanvas.tsx      # Canvas 渲染组件（960×640）
│   └── UI/
│       └── StatusDisplay.tsx    # 右侧状态面板
├── utils/
│   ├── pixelArt.ts              # Agent 图片键映射
│   ├── pixelRenderer.ts         # Canvas 渲染引擎
│   ├── imageLoader.ts           # 图片预加载
│   └── mathUtils.ts             # 数学工具函数
├── types/
│   ├── agent.ts                 # 状态类型 + API 声明
│   └── images.ts                # 图片资源类型
├── App.tsx                      # 主组件 + window.__hermesAgent 挂载
└── main.tsx                     # 入口
```

## 视觉架构

- **背景**：1024×1024 像素艺术 PNG，cover-fit 裁剪 + 暗色渐变叠加
- **Agent**：圆形头像裁剪（`clip()`），解决 PNG 无 alpha 通道的合成问题
- **UI 元素**：程序化绘制（状态标签、任务包、连接线、粒子特效）
- **画布**：960×640，暗色主题，60fps requestAnimationFrame 循环

## 技术栈

- React 19 + TypeScript
- Vite 8（构建工具）
- HTML5 Canvas 2D（全部渲染）
- 21 张 1024×1024 像素艺术 PNG 素材

## 自定义

### 切换背景

修改 [PixelCanvas.tsx](src/components/Canvas/PixelCanvas.tsx) 中的背景引用：

```typescript
renderImageBackground(ctx, images.backgrounds.evening, width, height);
// 可选: .main | .morning | .evening | .night
```

### 调整暗色叠加

修改 [pixelRenderer.ts](src/utils/pixelRenderer.ts) 中的 `renderBackgroundOverlay` 函数。

### 替换素材

将新的 1024×1024 PNG 放入 `public/images/` 对应目录，更新 `src/types/images.ts` 和 `src/utils/imageLoader.ts`。
