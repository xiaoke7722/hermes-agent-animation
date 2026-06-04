import React from 'react';
import type { Agent, Task, AgentStatus } from '../../types/agent';

interface StatusDisplayProps {
  mainAgent: Agent;
  subAgents: Agent[];
  taskQueue: Task[];
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string }> = {
  idle: { label: '空闲', color: '#6B7280' },
  working: { label: '工作中', color: '#34D399' },
  thinking: { label: '思考中', color: '#A78BFA' },
  distributing: { label: '分发中', color: '#FBBF24' },
  collaborating: { label: '协作中', color: '#60A5FA' },
  walking: { label: '移动中', color: '#9CA3AF' },
};

const TASK_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: '等待', color: '#6B7280' },
  'in-progress': { label: '进行', color: '#FBBF24' },
  completed: { label: '完成', color: '#34D399' },
};

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ mainAgent, subAgents, taskQueue }) => {
  const mainCfg = STATUS_CONFIG[mainAgent.status];

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'rgba(22,22,38,0.85)',
      borderRadius: '14px',
      padding: '22px 18px',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(16px)',
      color: '#E5E7EB',
      display: 'flex', flexDirection: 'column', gap: '18px',
      maxHeight: '640px',
      overflowY: 'auto',
    }}>
      {/* 标题 */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
          状态监控
        </div>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      </div>

      {/* 主 Agent */}
      <section>
        <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          🤖 主 Agent
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px',
          borderLeft: `3px solid ${mainCfg.color}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>{mainAgent.name}</span>
            <span style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
              backgroundColor: `${mainCfg.color}20`, color: mainCfg.color,
            }}>
              {mainCfg.label}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
            任务数: {mainAgent.tasks.length}
          </div>
        </div>
      </section>

      {/* 子 Agent */}
      {subAgents.length > 0 && (
        <section>
          <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            👥 子 Agent · {subAgents.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {subAgents.map((agent) => {
              const cfg = STATUS_CONFIG[agent.status];
              return (
                <div key={agent.id} style={{
                  backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '10px 12px',
                  borderLeft: `2px solid ${cfg.color}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 500 }}>{agent.name}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: 600,
                      backgroundColor: `${cfg.color}18`, color: cfg.color,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  {agent.tasks.length > 0 && (
                    <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
                      📋 {agent.tasks[0].name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 任务队列 */}
      {taskQueue.length > 0 && (
        <section>
          <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            📝 任务队列 · {taskQueue.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {taskQueue.slice(0, 8).map((task) => {
              const cfg = TASK_STATUS[task.status];
              return (
                <div key={task.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px',
                }}>
                  <span style={{ fontSize: '11px' }}>{task.name}</span>
                  <span style={{
                    padding: '1px 7px', borderRadius: '10px', fontSize: '9px', fontWeight: 600,
                    backgroundColor: `${cfg.color}18`, color: cfg.color,
                  }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {subAgents.length === 0 && taskQueue.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#6B7280', fontSize: '11px' }}>
          ✨ 等待活动...
        </div>
      )}

      {/* 底部 */}
      <div style={{
        marginTop: 'auto', textAlign: 'center', padding: '8px',
        backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px',
        fontSize: '9px', color: '#4B5563',
      }}>
        Hermes Agent · 像素风格演示
      </div>
    </div>
  );
};
