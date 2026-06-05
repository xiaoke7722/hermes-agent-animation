import React, { useState, useEffect, useRef } from 'react';
import type { Agent, Task, AgentStatus } from '../../types/agent';

interface StatusDisplayProps {
  mainAgent: Agent;
  subAgents: Agent[];
  taskQueue: Task[];
  lastUpdate?: number;
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; gradient: string }> = {
  idle: { label: '空闲', color: '#6B7280', gradient: 'linear-gradient(135deg,#6B7280,#4B5563)' },
  working: { label: '工作中', color: '#34D399', gradient: 'linear-gradient(135deg,#34D399,#059669)' },
  thinking: { label: '思考中', color: '#A78BFA', gradient: 'linear-gradient(135deg,#A78BFA,#7C3AED)' },
  distributing: { label: '分发中', color: '#FBBF24', gradient: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
  collaborating: { label: '协作中', color: '#60A5FA', gradient: 'linear-gradient(135deg,#60A5FA,#3B82F6)' },
  walking: { label: '移动中', color: '#9CA3AF', gradient: 'linear-gradient(135deg,#9CA3AF,#6B7280)' },
};

const TASK_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: '等待', color: '#6B7280' },
  'in-progress': { label: '进行', color: '#FBBF24' },
  completed: { label: '完成', color: '#34D399' },
};

// ============ 可折叠区块组件 ============

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  count?: number;
  color: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title, icon, count, color, defaultOpen = true, children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  // 判断子节点是否为空
  const childrenArr = React.Children.toArray(children);
  const isEmpty = childrenArr.length === 0 ||
    childrenArr.every((c) => {
      if (!React.isValidElement(c)) return true;
      return (c.props as Record<string, unknown>).children === undefined;
    });

  return (
    <section style={{ marginBottom: '2px' }}>
      {/* 标题栏 — 可点击展开/收起 */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 0 6px 0', cursor: 'pointer',
          userSelect: 'none', transition: 'opacity 0.2s',
        }}
      >
        <span style={{ fontSize: '13px' }}>{icon}</span>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: '#D1D5DB',
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>
          {title}
        </span>
        {count !== undefined && (
          <span style={{
            marginLeft: 'auto', fontSize: '10px', fontWeight: 700,
            color, backgroundColor: `${color}18`,
            padding: '1px 8px', borderRadius: '10px',
          }}>
            {count}
          </span>
        )}
        <span style={{
          fontSize: '10px', color: '#6B7280', marginLeft: '4px',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease',
        }}>
          ▼
        </span>
      </div>

      {/* 分隔线 */}
      <div style={{
        height: '1px',
        background: open
          ? `linear-gradient(90deg, ${color}40, rgba(255,255,255,0.03), transparent)`
          : 'linear-gradient(90deg, rgba(255,255,255,0.04), transparent)',
        marginBottom: open ? '10px' : '6px',
        transition: 'all 0.3s ease',
      }} />

      {/* 内容区 — 带动画展开/收起 */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? (contentHeight + 20) + 'px' : '0px',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        {isEmpty && open ? (
          <div style={{
            textAlign: 'center', padding: '16px 0', color: '#4B5563', fontSize: '11px',
          }}>
            ✨ 暂无数据
          </div>
        ) : (
          <div ref={contentRef}>{children}</div>
        )}
      </div>
    </section>
  );
};

// ============ LED 指示灯 ============

const LiveDot: React.FC<{ color: string; pulse?: boolean; label?: string }> = ({
  color, pulse = true, label,
}) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
    <span style={{
      display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%',
      backgroundColor: color,
      boxShadow: pulse ? `0 0 8px ${color}, 0 0 16px ${color}40` : 'none',
      animation: pulse ? 'pulse-dot 2s ease-in-out infinite' : 'none',
    }} />
    {label && <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{label}</span>}
  </span>
);

// ============ 状态卡片 ============

const AgentCard: React.FC<{
  name: string; status: AgentStatus; color: string;
  gradient: string; tasksCount: number; isMain: boolean;
  currentTask?: string;
}> = ({ name, status, color, gradient, tasksCount, isMain, currentTask }) => {
  const cfg = STATUS_CONFIG[status];
  const isActive = status !== 'idle';

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: '10px', padding: '14px',
      background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
      border: `1px solid ${isActive ? `${color}30` : 'rgba(255,255,255,0.04)'}`,
      transition: 'all 0.4s ease',
    }}>
      {/* 左上角状态色条 */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: gradient,
        boxShadow: isActive ? `0 0 12px ${color}60` : 'none',
        transition: 'all 0.4s ease',
      }} />

      {/* 活跃时右上角发光 */}
      {isActive && (
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          width: '60px', height: '60px', borderRadius: '50%',
          background: `radial-gradient(circle, ${color}15, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{
          fontWeight: 600, fontSize: isMain ? '13px' : '12px', color: '#E5E7EB',
        }}>
          {isMain ? '🤖 ' : '👤 '}{name}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
          backgroundColor: `${color}18`, color,
          transition: 'all 0.3s ease',
        }}>
          <LiveDot color={color} pulse={isActive} />
          {cfg.label}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '10px', color: '#9CA3AF' }}>
        <span>📋 {tasksCount} 个任务</span>
        {currentTask && (
          <span style={{ color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
            ← {currentTask}
          </span>
        )}
      </div>
    </div>
  );
};

// ============ 任务项 ============

const TaskItem: React.FC<{ name: string; status: string; color: string; index: number }> = ({
  name, status, color, index,
}) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 10px',
    background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
    borderRadius: '6px', transition: 'background 0.2s',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: color,
        boxShadow: status === 'in-progress' ? `0 0 6px ${color}` : 'none',
        transition: 'all 0.3s',
      }} />
      <span style={{ fontSize: '11px', color: '#D1D5DB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
    </div>
    <span style={{
      padding: '1px 7px', borderRadius: '10px', fontSize: '9px', fontWeight: 600,
      backgroundColor: `${color}18`, color, whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {TASK_STATUS[status]?.label || status}
    </span>
  </div>
);

// ============ 信息磁贴 ============

const InfoTile: React.FC<{ label: string; value: string; color: string }> = ({
  label, value, color,
}) => (
  <div style={{
    padding: '8px 10px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.03)',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '9px', color: '#6B7280', marginBottom: '4px', letterSpacing: '0.5px' }}>
      {label}
    </div>
    <div style={{
      fontSize: '14px', fontWeight: 700, color,
      textShadow: `0 0 12px ${color}30`,
    }}>
      {value}
    </div>
  </div>
);

// ============ 主组件 ============

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  mainAgent, subAgents, taskQueue, lastUpdate,
}) => {
  const mainCfg = STATUS_CONFIG[mainAgent.status];
  const [sseConnected, setSseConnected] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [sessionStart] = useState(Date.now());

  // 检测 SSE 连接状态
  useEffect(() => {
    const check = () => {
      if (lastUpdate && (Date.now() - lastUpdate) < 60000) {
        setSseConnected(true);
      } else if (lastUpdate) {
        setSseConnected(false);
      }
    };
    check();
    const timer = setInterval(check, 5000);
    return () => clearInterval(timer);
  }, [lastUpdate]);

  // 实时时钟（每秒更新）
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmtTime = (ts?: number) => {
    if (!ts) return '--:--:--';
    return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false });
  };

  // 会话时长
  const fmtDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const isMainActive = mainAgent.status !== 'idle';
  const pendingTasks = taskQueue.filter(t => t.status === 'pending').length;
  const activeSubs = subAgents.filter(a => a.status !== 'idle').length;
  const sessionDuration = now - sessionStart;

  return (
    <div style={{
      width: '280px',
      backgroundColor: 'rgba(18,18,34,0.9)',
      borderRadius: '14px',
      padding: '18px 16px',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: `
        0 8px 32px rgba(0,0,0,0.4),
        0 0 0 1px rgba(255,255,255,0.04) inset,
        0 0 40px rgba(59,130,246,0.03)
      `,
      backdropFilter: 'blur(20px)',
      color: '#E5E7EB',
      display: 'flex', flexDirection: 'column', gap: '4px',
      maxHeight: '700px',
      overflowY: 'auto',
    }}>
      {/* ===== 头部：实时状态栏 ===== */}
      <div style={{
        textAlign: 'center', paddingBottom: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          fontSize: '10px', color: '#6B7280',
          textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px',
        }}>
          🖥️ 状态监控 · V3
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '14px',
          marginTop: '8px', fontSize: '10px',
        }}>
          <LiveDot color={sseConnected ? '#34D399' : '#EF4444'} pulse={sseConnected} label={sseConnected ? '已连接' : '未连接'} />
          <span style={{ color: '#6B7280' }}>⏱ {fmtDuration(sessionDuration)}</span>
          <span style={{ color: '#6B7280' }}>🕐 {fmtTime(lastUpdate || now)}</span>
        </div>
      </div>

      {/* ===== 主 Agent ===== */}
      <CollapsibleSection
        title="主 Agent"
        icon="🤖"
        color={mainCfg.color}
        defaultOpen={true}
      >
        <AgentCard
          name={mainAgent.name}
          status={mainAgent.status}
          color={mainCfg.color}
          gradient={mainCfg.gradient}
          tasksCount={mainAgent.tasks.length}
          isMain={true}
          currentTask={mainAgent.tasks[0]?.name}
        />
      </CollapsibleSection>

      {/* ===== 子 Agent ===== */}
      <CollapsibleSection
        title="子 Agent"
        icon="👥"
        count={subAgents.length}
        color="#10B981"
        defaultOpen={subAgents.length > 0}
      >
        {subAgents.length === 0 ? null : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {subAgents.map((agent) => {
              const cfg = STATUS_CONFIG[agent.status];
              return (
                <AgentCard
                  key={agent.id}
                  name={agent.name}
                  status={agent.status}
                  color={cfg.color}
                  gradient={cfg.gradient}
                  tasksCount={agent.tasks.length}
                  isMain={false}
                  currentTask={agent.tasks[0]?.name}
                />
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      {/* ===== 任务队列 ===== */}
      <CollapsibleSection
        title="任务队列"
        icon="📝"
        count={taskQueue.length}
        color="#FBBF24"
        defaultOpen={taskQueue.length > 0}
      >
        {taskQueue.length === 0 ? null : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {taskQueue.slice(0, 12).map((task, i) => {
              const cfg = TASK_STATUS[task.status];
              return (
                <TaskItem
                  key={task.id}
                  name={task.name}
                  status={task.status}
                  color={cfg?.color || '#6B7280'}
                  index={i}
                />
              );
            })}
            {taskQueue.length > 12 && (
              <div style={{ textAlign: 'center', padding: '6px', fontSize: '10px', color: '#6B7280' }}>
                +{taskQueue.length - 12} 更多...
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* ===== 系统信息 ===== */}
      <CollapsibleSection
        title="系统信息"
        icon="⚙️"
        color="#60A5FA"
        defaultOpen={true}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <InfoTile label="主 Agent" value={isMainActive ? mainAgent.status : '空闲'} color={mainCfg.color} />
          <InfoTile label="子 Agent" value={`${activeSubs}/${subAgents.length}`} color={activeSubs > 0 ? '#34D399' : '#6B7280'} />
          <InfoTile label="待处理" value={`${pendingTasks}`} color={pendingTasks > 0 ? '#FBBF24' : '#6B7280'} />
          <InfoTile label="连接" value={sseConnected ? '正常' : '断开'} color={sseConnected ? '#34D399' : '#EF4444'} />
        </div>
      </CollapsibleSection>

      {/* ===== 底部 ===== */}
      <div style={{
        marginTop: 'auto', textAlign: 'center', padding: '10px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.02), transparent)',
        borderRadius: '8px', fontSize: '9px', color: '#4B5563',
      }}>
        Hermes Agent · 像素仪表盘 V3
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
};
