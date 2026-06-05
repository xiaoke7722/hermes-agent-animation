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


## Linux 部署（生产环境）

### 前置要求
- Node.js 23+
- npm

### 1. 构建
```bash
npm install
npm run build      # 输出到 dist/
```

### 2. 启动仪表盘（一体化服务）
```bash
# 方式一：直接运行
PORT=8888 node bridge/server.js

# 方式二：systemd 服务（推荐）
sudo cp deploy/hermes-dashboard.service /etc/systemd/system/
sudo systemctl enable hermes-dashboard.service
sudo systemctl start hermes-dashboard.service
```

### 3. 实时监控（自动同步 Hermes Agent 状态）
仪表盘内置了 Hermes Agent 实时状态监控器，通过读取 `agent.log` 自动捕获工具调用：

```bash
# systemd 服务（推荐）
sudo systemctl enable hermes-dashboard-monitor.service
sudo systemctl start hermes-dashboard-monitor.service
```

监控器功能：
- 🟡 主Agent状态自动更新（working / thinking / idle）
- 📦 每次工具调用自动分发子Agent（terminal、execute_code 等真实工具名）
- 👥 右侧面板子Agent列表实时更新
- 📝 任务队列记录工具调用历史
- ⏱ 会话时长计时器

### 4. 访问
```
http://<服务器IP>:8888
http://<服务器IP>:8888/?demo    # 演示模式
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
