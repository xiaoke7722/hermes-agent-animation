import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PixelCanvas } from './components/Canvas/PixelCanvas';
import { StatusDisplay } from './components/UI/StatusDisplay';
import type { Agent, Task, DashboardState, HermesAgentAPI } from './types/agent';
import { generateId } from './utils/mathUtils';

// ==================== 默认状态 ====================

const DEFAULT_AGENT: Agent = {
  id: 'main',
  name: 'Hermes Agent',
  status: 'idle',
  position: { x: 480, y: 300 },
  tasks: [],
  isMainAgent: true,
  color: '#3B82F6',
};

const DEFAULT_STATE: DashboardState = {
  mainAgent: DEFAULT_AGENT,
  subAgents: [],
  connections: [],
  taskPackets: [],
  taskQueue: [],
  splitEffect: null,
};

// ==================== 演示模式（仅开发用） ====================

const DEMO_TASKS = ['数据处理', '模型训练', '结果分析', '报告生成', '代码优化'];

function useDemoMode(enabled: boolean, api: HermesAgentAPI) {
  const stepRef = useRef(0);
  const taskIdxRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const steps = [
      { action: 'idle', duration: 3000 },
      { action: 'working', duration: 4000 },
      { action: 'thinking', duration: 3000 },
      { action: 'distributing', duration: 2000 },
      { action: 'collaborating', duration: 3000 },
      { action: 'working', duration: 3500 },
    ];

    let timer: ReturnType<typeof setTimeout>;
    let splitTicker: ReturnType<typeof setInterval>;

    const run = () => {
      const step = steps[stepRef.current % steps.length];
      const st = api.getState();

      switch (step.action) {
        case 'idle':
          api.setState({ mainAgent: { ...st.mainAgent, status: 'idle' } });
          break;

        case 'working':
          api.setState({ mainAgent: { ...st.mainAgent, status: 'working' } });
          break;

        case 'thinking':
          api.setState({ mainAgent: { ...st.mainAgent, status: 'thinking' } });
          break;

        case 'distributing': {
          const task: Task = {
            id: generateId(),
            name: DEMO_TASKS[taskIdxRef.current % DEMO_TASKS.length],
            status: 'pending',
          };
          const angle = Math.random() * Math.PI * 2;
          const dist = 160 + Math.random() * 120;
          const tx = st.mainAgent.position.x + Math.cos(angle) * dist;
          const ty = st.mainAgent.position.y + Math.sin(angle) * dist;

          api.triggerSplitEffect(st.mainAgent.position.x, st.mainAgent.position.y);
          api.dispatchTask(task, st.mainAgent.position.x, st.mainAgent.position.y, tx, ty);
          taskIdxRef.current++;
          break;
        }

        case 'collaborating':
          api.setState({ mainAgent: { ...st.mainAgent, status: 'collaborating' } });
          break;
      }

      timer = setTimeout(() => {
        stepRef.current++;
        run();
      }, step.duration);
    };

    // 初始化演示任务
    DEMO_TASKS.forEach((t) => api.addTask(t));
    run();

    return () => {
      clearTimeout(timer);
      clearInterval(splitTicker);
    };
  }, [enabled, api]);
}

// ==================== App 组件 ====================

const App: React.FC = () => {
  const demoEnabled = new URLSearchParams(window.location.search).has('demo');

  const [state, setState] = useState<DashboardState>(DEFAULT_STATE);
  const splitTimerRef = useRef<ReturnType<typeof setInterval>>();

  // 任务包动画
  const animatePacket = useCallback((packetId: string, fromX: number, fromY: number, toX: number, toY: number) => {
    let progress = 0;
    const tick = setInterval(() => {
      progress += 0.025;
      if (progress >= 1) {
        progress = 1;
        clearInterval(tick);
      }
      setState((prev) => {
        const px = fromX + (toX - fromX) * progress;
        const py = fromY + (toY - fromY) * progress;
        return {
          ...prev,
          taskPackets: prev.taskPackets.map((p) =>
            p.id === packetId ? { ...p, position: { x: px, y: py }, progress } : p
          ).filter((p) => p.progress < 1),
          connections: prev.connections.map((c) =>
            c.from === `${fromX},${fromY}` && c.to === `${toX},${toY}`
              ? { ...c, progress }
              : c
          ).filter((c) => c.progress < 1),
        };
      });
    }, 16);
    return tick;
  }, []);

  // 分裂特效动画
  const animateSplit = useCallback((x: number, y: number) => {
    let progress = 0;
    const tick = setInterval(() => {
      progress += 0.04;
      if (progress >= 1) {
        clearInterval(tick);
        setState((prev) => ({ ...prev, splitEffect: null }));
      } else {
        setState((prev) => ({ ...prev, splitEffect: { x, y, progress, color: '#FBBF24' } }));
      }
    }, 30);
    splitTimerRef.current = tick;
  }, []);

  // 构建 API
  const buildAPI = useCallback((): HermesAgentAPI => ({
    setState(partial) {
      setState((prev) => {
        const next = { ...prev, ...partial };
        // 深合并 mainAgent
        if (partial.mainAgent) {
          next.mainAgent = { ...prev.mainAgent, ...partial.mainAgent };
        }
        return next;
      });
    },
    getState() {
      // 通过闭包获取最新 state（用 ref）
      let current: DashboardState = DEFAULT_STATE;
      setState((prev) => { current = prev; return prev; });
      return current;
    },
    triggerSplitEffect(x, y) {
      animateSplit(x, y);
    },
    addTask(name) {
      const task: Task = { id: generateId(), name, status: 'pending' };
      setState((prev) => ({ ...prev, taskQueue: [...prev.taskQueue, task] }));
      return task;
    },
    dispatchTask(task, fromX, fromY, toX, toY) {
      const packet = {
        id: generateId(),
        task,
        position: { x: fromX, y: fromY },
        targetPosition: { x: toX, y: toY },
        progress: 0,
      };
      const connection = {
        from: `${fromX},${fromY}`,
        to: `${toX},${toY}`,
        task,
        progress: 0,
      };
      const assignedId = `sub-${generateId()}`;
      const subAgent: Agent = {
        id: assignedId,
        name: `Worker ${assignedId.slice(-4)}`,
        status: 'working',
        position: { x: toX, y: toY },
        tasks: [{ ...task, assignedTo: assignedId, status: 'in-progress' }],
        isMainAgent: false,
        color: '#10B981',
      };

      setState((prev) => ({
        ...prev,
        taskPackets: [...prev.taskPackets, packet],
        connections: [...prev.connections, connection],
        subAgents: [...prev.subAgents, subAgent],
      }));

      animatePacket(packet.id, fromX, fromY, toX, toY);
    },
    toggleDemo() {
      const url = new URL(window.location.href);
      if (url.searchParams.has('demo')) {
        url.searchParams.delete('demo');
      } else {
        url.searchParams.set('demo', '1');
      }
      window.location.href = url.toString();
    },
  }), [animateSplit, animatePacket]);

  // 挂载 API 到 window
  useEffect(() => {
    const api = buildAPI();
    window.__hermesAgent = api;
    return () => { window.__hermesAgent = undefined; };
  }, [buildAPI]);

  // 清理
  useEffect(() => {
    return () => {
      if (splitTimerRef.current) clearInterval(splitTimerRef.current);
    };
  }, []);

  // 演示模式
  useDemoMode(demoEnabled, buildAPI());

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a18',
      backgroundImage: `
        radial-gradient(ellipse at 40% 30%, rgba(96,165,250,0.05) 0%, transparent 55%),
        radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.04) 0%, transparent 55%),
        radial-gradient(ellipse at 50% 50%, rgba(15,15,35,1) 0%, #0a0a18 100%)
      `,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '30px', gap: '28px',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
    }}>
      <PixelCanvas
        mainAgent={state.mainAgent}
        subAgents={state.subAgents}
        taskPackets={state.taskPackets}
        connections={state.connections}
        splitEffect={state.splitEffect}
      />
      <StatusDisplay
        mainAgent={state.mainAgent}
        subAgents={state.subAgents}
        taskQueue={state.taskQueue}
      />
    </div>
  );
};

export default App;
