export type { ImageAssets } from './images';

export type AgentStatus = 'idle' | 'working' | 'thinking' | 'distributing' | 'collaborating' | 'walking';

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
}

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  position: { x: number; y: number };
  targetPosition?: { x: number; y: number };
  tasks: Task[];
  isMainAgent: boolean;
  color: string;
}

export interface Connection {
  from: string;  // "x,y"
  to: string;    // "x,y"
  task: Task;
  progress: number;
}

export interface TaskPacket {
  id: string;
  task: Task;
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  progress: number;
}

export interface SplitEffect {
  x: number;
  y: number;
  progress: number;
  color: string;
}

/** 完整的仪表盘状态 —— Hermes Agent 后端通过 setState() 推送 */
export interface DashboardState {
  mainAgent: Agent;
  subAgents: Agent[];
  connections: Connection[];
  taskPackets: TaskPacket[];
  taskQueue: Task[];
  splitEffect: SplitEffect | null;
}

/** 暴露给后端的控制 API */
export interface HermesAgentAPI {
  /** 全量更新仪表盘状态 */
  setState(state: Partial<DashboardState>): void;
  /** 获取当前状态 */
  getState(): DashboardState;
  /** 触发任务分发特效 */
  triggerSplitEffect(x: number, y: number): void;
  /** 添加任务到队列 */
  addTask(name: string): Task;
  /** 创建任务分发动画 */
  dispatchTask(task: Task, fromX: number, fromY: number, toX: number, toY: number): void;
  /** 切换演示模式 */
  toggleDemo(): void;
}

declare global {
  interface Window {
    __hermesAgent?: HermesAgentAPI;
  }
}
