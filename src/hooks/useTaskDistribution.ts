import { useState, useCallback, useRef } from 'react';
import type { Task, TaskPacket, Connection } from '../types/agent';
import { generateId } from '../utils/mathUtils';

interface UseTaskDistributionOptions {
  animationSpeed?: number;
}

export function useTaskDistribution(options: UseTaskDistributionOptions = {}) {
  const { animationSpeed = 1 } = options;

  // 任务队列
  const [taskQueue, setTaskQueue] = useState<Task[]>([]);

  // 任务包
  const [taskPackets, setTaskPackets] = useState<TaskPacket[]>([]);

  // 连接线
  const [connections, setConnections] = useState<Connection[]>([]);

  // 动画定时器
  const animationTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // 添加任务到队列
  const addTask = useCallback((name: string) => {
    const newTask: Task = {
      id: generateId(),
      name,
      status: 'pending',
    };

    setTaskQueue((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  // 从队列获取下一个任务
  const getNextTask = useCallback(() => {
    setTaskQueue((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(1);
    });
  }, []);

  // 创建任务包
  const createTaskPacket = useCallback(
    (
      task: Task,
      startPosition: { x: number; y: number },
      targetPosition: { x: number; y: number }
    ) => {
      const packet: TaskPacket = {
        id: generateId(),
        task,
        position: { ...startPosition },
        targetPosition: { ...targetPosition },
        progress: 0,
      };

      setTaskPackets((prev) => [...prev, packet]);
      return packet;
    },
    []
  );

  // 更新任务包位置
  const updateTaskPacketPosition = useCallback(
    (packetId: string, position: { x: number; y: number }) => {
      setTaskPackets((prev) =>
        prev.map((packet) =>
          packet.id === packetId ? { ...packet, position } : packet
        )
      );
    },
    []
  );

  // 更新任务包进度
  const updateTaskPacketProgress = useCallback(
    (packetId: string, progress: number) => {
      setTaskPackets((prev) =>
        prev.map((packet) =>
          packet.id === packetId ? { ...packet, progress } : packet
        )
      );
    },
    []
  );

  // 删除任务包
  const removeTaskPacket = useCallback((packetId: string) => {
    setTaskPackets((prev) => prev.filter((packet) => packet.id !== packetId));
  }, []);

  // 创建连接线
  const createConnection = useCallback(
    (from: string, to: string, task: Task) => {
      const connection: Connection = {
        from,
        to,
        task,
        progress: 0,
      };

      setConnections((prev) => [...prev, connection]);
      return connection;
    },
    []
  );

  // 更新连接线进度
  const updateConnectionProgress = useCallback(
    (from: string, to: string, progress: number) => {
      setConnections((prev) =>
        prev.map((conn) =>
          conn.from === from && conn.to === to
            ? { ...conn, progress }
            : conn
        )
      );
    },
    []
  );

  // 删除连接线
  const removeConnection = useCallback((from: string, to: string) => {
    setConnections((prev) =>
      prev.filter(
        (conn) => !(conn.from === from && conn.to === to)
      )
    );
  }, []);

  // 开始任务分发动画
  const startTaskDistribution = useCallback(
    (
      task: Task,
      startPosition: { x: number; y: number },
      targetPosition: { x: number; y: number },
      onComplete?: () => void
    ) => {
      // 1. 创建任务包
      const packet = createTaskPacket(task, startPosition, targetPosition);

      // 2. 创建连接线
      const connectionId = `${startPosition.x}-${startPosition.y}-${targetPosition.x}-${targetPosition.y}`;
      createConnection(
        `${startPosition.x},${startPosition.y}`,
        `${targetPosition.x},${targetPosition.y}`,
        task
      );

      // 3. 动画任务包移动
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.02 * animationSpeed;

        if (progress >= 1) {
          progress = 1;
          clearInterval(interval);

          // 动画完成
          removeTaskPacket(packet.id);
          removeConnection(
            `${startPosition.x},${startPosition.y}`,
            `${targetPosition.x},${targetPosition.y}`
          );

          if (onComplete) {
            onComplete();
          }
        }

        // 更新任务包位置
        const newPosition = {
          x: startPosition.x + (targetPosition.x - startPosition.x) * progress,
          y: startPosition.y + (targetPosition.y - startPosition.y) * progress,
        };
        updateTaskPacketPosition(packet.id, newPosition);
        updateTaskPacketProgress(packet.id, progress);

        // 更新连接线进度
        updateConnectionProgress(
          `${startPosition.x},${startPosition.y}`,
          `${targetPosition.x},${targetPosition.y}`,
          progress
        );
      }, 16);

      // 保存定时器引用
      animationTimersRef.current.set(connectionId, interval);

      return () => {
        clearInterval(interval);
        animationTimersRef.current.delete(connectionId);
      };
    },
    [
      createTaskPacket,
      createConnection,
      removeTaskPacket,
      removeConnection,
      updateTaskPacketPosition,
      updateTaskPacketProgress,
      updateConnectionProgress,
      animationSpeed,
    ]
  );

  // 清理所有动画
  const cleanupAllAnimations = useCallback(() => {
    animationTimersRef.current.forEach((timer) => clearInterval(timer));
    animationTimersRef.current.clear();
    setTaskPackets([]);
    setConnections([]);
  }, []);

  return {
    taskQueue,
    taskPackets,
    connections,
    addTask,
    getNextTask,
    createTaskPacket,
    updateTaskPacketPosition,
    updateTaskPacketProgress,
    removeTaskPacket,
    createConnection,
    updateConnectionProgress,
    removeConnection,
    startTaskDistribution,
    cleanupAllAnimations,
  };
}
