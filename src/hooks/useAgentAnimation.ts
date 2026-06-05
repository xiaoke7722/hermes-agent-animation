import { useState, useCallback, useRef, useEffect } from 'react';
import type { Agent, AgentStatus, Task, AnimationType } from '../types/agent';
import { generateId } from '../utils/mathUtils';

interface UseAgentAnimationOptions {
  initialPosition?: { x: number; y: number };
  animationSpeed?: number;
}

export function useAgentAnimation(options: UseAgentAnimationOptions = {}) {
  const {
    initialPosition = { x: 400, y: 300 },
    animationSpeed = 1,
  } = options;

  // 主 Agent
  const [mainAgent, setMainAgent] = useState<Agent>({
    id: generateId(),
    name: '主 Agent',
    status: 'idle',
    position: initialPosition,
    tasks: [],
    isMainAgent: true,
    color: '#3B82F6',
  });

  // 子 Agent 列表
  const [subAgents, setSubAgents] = useState<Agent[]>([]);

  // 当前动画类型
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>('idle');

  // 动画帧索引
  const [frameIndex, setFrameIndex] = useState(0);

  // 动画定时器
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 更新主 Agent 状态
  const updateMainAgentStatus = useCallback((status: AgentStatus) => {
    setMainAgent((prev) => ({ ...prev, status }));
    setCurrentAnimation(status);
  }, []);

  // 更新主 Agent 位置
  const updateMainAgentPosition = useCallback((position: { x: number; y: number }) => {
    setMainAgent((prev) => ({ ...prev, position }));
  }, []);

  // 添加任务到主 Agent
  const addTaskToMainAgent = useCallback((task: Task) => {
    setMainAgent((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));
  }, []);

  // 创建子 Agent
  const createSubAgent = useCallback(
    (position: { x: number; y: number }, task: Task) => {
      const newAgent: Agent = {
        id: generateId(),
        name: `子 Agent ${subAgents.length + 1}`,
        status: 'idle',
        position,
        tasks: [task],
        isMainAgent: false,
        color: '#10B981',
      };

      setSubAgents((prev) => [...prev, newAgent]);
      return newAgent;
    },
    [subAgents.length]
  );

  // 更新子 Agent 状态
  const updateSubAgentStatus = useCallback(
    (agentId: string, status: AgentStatus) => {
      setSubAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId ? { ...agent, status } : agent
        )
      );
    },
    []
  );

  // 更新子 Agent 位置
  const updateSubAgentPosition = useCallback(
    (agentId: string, position: { x: number; y: number }) => {
      setSubAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId ? { ...agent, position } : agent
        )
      );
    },
    []
  );

  // 删除子 Agent
  const removeSubAgent = useCallback((agentId: string) => {
    setSubAgents((prev) => prev.filter((agent) => agent.id !== agentId));
  }, []);

  // 分发任务
  const distributeTask = useCallback(
    (task: Task, targetPosition: { x: number; y: number }) => {
      // 1. 主 Agent 进入分发状态
      updateMainAgentStatus('distributing');

      // 2. 创建子 Agent
      const newAgent = createSubAgent(targetPosition, task);

      // 3. 更新任务状态
      task.assignedTo = newAgent.id;
      task.status = 'in-progress';

      // 4. 子 Agent 开始工作
      setTimeout(() => {
        updateSubAgentStatus(newAgent.id, 'working');
      }, 500);

      return newAgent;
    },
    [updateMainAgentStatus, createSubAgent, updateSubAgentStatus]
  );

  // 开始工作动画
  const startWorkingAnimation = useCallback(() => {
    updateMainAgentStatus('working');

    // 模拟打字动画
    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % 2;
      setFrameIndex(frame);
    }, 200 / animationSpeed);

    return () => clearInterval(interval);
  }, [updateMainAgentStatus, animationSpeed]);

  // 开始思考动画
  const startThinkingAnimation = useCallback(() => {
    updateMainAgentStatus('thinking');

    // 思考动画较慢
    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % 4;
      setFrameIndex(frame);
    }, 500 / animationSpeed);

    return () => clearInterval(interval);
  }, [updateMainAgentStatus, animationSpeed]);

  // 开始行走动画
  const startWalkingAnimation = useCallback(
    (targetPosition: { x: number; y: number }) => {
      updateMainAgentStatus('walking');

      // 计算移动方向
      const startPos = mainAgent.position;
      const dx = targetPosition.x - startPos.x;
      const dy = targetPosition.y - startPos.y;
      // 移动动画
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.02 * animationSpeed;
        if (progress >= 1) {
          progress = 1;
          clearInterval(interval);
          updateMainAgentStatus('idle');
        }

        const newX = startPos.x + dx * progress;
        const newY = startPos.y + dy * progress;
        updateMainAgentPosition({ x: newX, y: newY });

        // 更新行走动画帧
        setFrameIndex((prev) => (prev + 1) % 2);
      }, 16);

      return () => clearInterval(interval);
    },
    [mainAgent.position, updateMainAgentStatus, updateMainAgentPosition, animationSpeed]
  );

  // 开始协作动画
  const startCollaboratingAnimation = useCallback(() => {
    updateMainAgentStatus('collaborating');

    // 协作动画
    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % 3;
      setFrameIndex(frame);
    }, 300 / animationSpeed);

    return () => clearInterval(interval);
  }, [updateMainAgentStatus, animationSpeed]);

  // 停止所有动画
  const stopAllAnimations = useCallback(() => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    updateMainAgentStatus('idle');
    setFrameIndex(0);
  }, [updateMainAgentStatus]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, []);

  return {
    mainAgent,
    subAgents,
    currentAnimation,
    frameIndex,
    updateMainAgentStatus,
    updateMainAgentPosition,
    addTaskToMainAgent,
    createSubAgent,
    updateSubAgentStatus,
    updateSubAgentPosition,
    removeSubAgent,
    distributeTask,
    startWorkingAnimation,
    startThinkingAnimation,
    startWalkingAnimation,
    startCollaboratingAnimation,
    stopAllAnimations,
  };
}
