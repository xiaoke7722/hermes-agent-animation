import React, { useState } from 'react';
import type { Task } from '../../types/agent';

interface ControlPanelProps {
  isPlaying: boolean;
  speed: number;
  agentCount: number;
  taskQueueLength: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onAddTask: (name: string) => void;
  onStartWorking: () => void;
  onStartThinking: () => void;
  onStartDistributing: () => void;
  onStartCollaborating: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  speed,
  agentCount,
  taskQueueLength,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  onAddTask,
  onStartWorking,
  onStartThinking,
  onStartDistributing,
  onStartCollaborating,
}) => {
  const [taskName, setTaskName] = useState('');

  const handleAddTask = () => {
    if (taskName.trim()) {
      onAddTask(taskName.trim());
      setTaskName('');
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#1F2937',
        borderRadius: '8px',
        color: '#FFFFFF',
        width: '300px',
      }}
    >
      <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>
        🎮 控制面板
      </h2>

      {/* 状态信息 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            padding: '10px',
            backgroundColor: '#374151',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Agent 数量</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {agentCount}
          </div>
        </div>
        <div
          style={{
            padding: '10px',
            backgroundColor: '#374151',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>任务队列</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {taskQueueLength}
          </div>
        </div>
      </div>

      {/* 播放控制 */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <button
            onClick={isPlaying ? onPause : onPlay}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: isPlaying ? '#EF4444' : '#10B981',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isPlaying ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <button
            onClick={onReset}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#6B7280',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🔄 重置
          </button>
        </div>
      </div>

      {/* 速度控制 */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '5px',
            fontSize: '14px',
          }}
        >
          动画速度: {speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            backgroundColor: '#374151',
            outline: 'none',
          }}
        />
      </div>

      {/* 添加任务 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px', fontSize: '14px' }}>
          添加任务
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="输入任务名称"
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#374151',
              border: '1px solid #4B5563',
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleAddTask}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            添加
          </button>
        </div>
      </div>

      {/* 动画控制按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px', fontSize: '14px' }}>
          动画演示
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <button
            onClick={onStartWorking}
            style={{
              padding: '10px',
              backgroundColor: '#10B981',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            💻 开始工作
          </button>
          <button
            onClick={onStartThinking}
            style={{
              padding: '10px',
              backgroundColor: '#8B5CF6',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            🤔 开始思考
          </button>
          <button
            onClick={onStartDistributing}
            style={{
              padding: '10px',
              backgroundColor: '#F59E0B',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            📤 分发任务
          </button>
          <button
            onClick={onStartCollaborating}
            style={{
              padding: '10px',
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            🤝 协作模式
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div
        style={{
          padding: '10px',
          backgroundColor: '#374151',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#9CA3AF',
        }}
      >
        <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
          💡 使用说明
        </div>
        <div>1. 点击"播放"开始动画</div>
        <div>2. 使用"添加任务"创建新任务</div>
        <div>3. 点击"分发任务"演示任务分发</div>
        <div>4. 调整速度滑块改变动画速度</div>
      </div>
    </div>
  );
};
