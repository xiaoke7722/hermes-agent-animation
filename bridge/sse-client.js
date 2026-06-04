/**
 * Hermes Bridge SSE 客户端
 * 生命周期由服务端管理，浏览器只做渲染
 */
(function() {
  var SSE_URL = window.location.origin + '/events';
  console.log('[HermesBridge] Connecting to', SSE_URL);

  // 子Agent位置映射（keyed by taskId）
  var agentPositions = {};

  var waitTimer = setInterval(function() {
    if (window.__hermesAgent) {
      clearInterval(waitTimer);
      connectSSE();
    }
  }, 200);
  setTimeout(function() {
    clearInterval(waitTimer);
    if (window.__hermesAgent) connectSSE();
  }, 10000);

  function connectSSE() {
    var api = window.__hermesAgent;

    var source = new EventSource(SSE_URL);

    source.onopen = function() {
      console.log('[HermesBridge] SSE connected');
      api.setState({ mainAgent: { status: 'idle' } });
    };

    source.onmessage = function(e) {
      try {
        var data = JSON.parse(e.data);

        if (data.type === 'dispatchTask' && data.task) {
          // 记录子Agent位置
          agentPositions[data.task.id] = {
            x: data.toX, y: data.toY,
            mainX: data.fromX, mainY: data.fromY,
          };
          api.addTask(data.task.name);
          api.dispatchTask(data.task, data.fromX, data.fromY, data.toX, data.toY);
          api.triggerSplitEffect(data.fromX, data.fromY);
          return;
        }

        // 服务端触发的回传事件（5-8秒后）
        if (data.type === 'completeTask') {
          var pos = agentPositions[data.taskId];
          if (!pos) return;
          triggerReturn(api, data.taskId, pos.x, pos.y, pos.mainX, pos.mainY);
          return;
        }

        if (data.mainAgent || data.subAgents || data.taskQueue) {
          api.setState(data);
        }
      } catch (err) {
        console.error('[HermesBridge] Parse error:', err);
      }
    };

    source.onerror = function() {
      console.warn('[HermesBridge] SSE lost, retrying...');
    };
  }

  // ===== 回传动画（延迟一帧读取最新 React 状态） =====
  function triggerReturn(api, taskId, fromX, fromY, toX, toY) {
    setTimeout(function() {
      var st = api.getState();

      // 找对应子Agent
      var subId = null;
      for (var i = 0; i < st.subAgents.length; i++) {
        var s = st.subAgents[i];
        if (Math.abs(s.position.x - fromX) < 30 && Math.abs(s.position.y - fromY) < 30) {
          subId = s.id;
          break;
        }
      }
      if (!subId) {
        console.warn('[HermesBridge] Sub-agent not found at', fromX, fromY);
        return;
      }

      var packetId = 'rtn-' + Date.now();

      // 追加回传包到现有状态
      api.setState({
        taskPackets: st.taskPackets.concat([{
          id: packetId,
          task: { id: subId, name: '结果回传', status: 'completed' },
          position: { x: fromX, y: fromY },
          targetPosition: { x: toX, y: toY },
          progress: 0,
        }]),
        connections: st.connections.concat([{
          from: fromX + ',' + fromY,
          to: toX + ',' + toY,
          task: { id: subId, name: '结果回传', status: 'completed' },
          progress: 0,
        }]),
      });

      // 驱动回传动画
      var progress = 0;
      var tick = setInterval(function() {
        progress += 0.008;
        if (progress >= 1) {
          clearInterval(tick);
          setTimeout(function() {
            var st = api.getState();
            api.setState({
              subAgents: st.subAgents.filter(function(s) { return s.id !== subId; }),
              taskPackets: st.taskPackets.filter(function(p) { return p.id !== packetId; }),
              connections: st.connections.filter(function(c) {
                return !(c.from === (fromX + ',' + fromY) && c.to === (toX + ',' + toY));
              }),
            });
          }, 50);
          delete agentPositions[taskId];
          return;
        }
        var px = fromX + (toX - fromX) * progress;
        var py = fromY + (toY - fromY) * progress;
        setTimeout(function() {
          var st = api.getState();
          api.setState({
            taskPackets: st.taskPackets.map(function(p) {
              return p.id === packetId ? { ...p, position: { x: px, y: py }, progress: progress } : p;
            }),
            connections: st.connections.map(function(c) {
              return c.from === (fromX + ',' + fromY) && c.to === (toX + ',' + toY)
                ? { ...c, progress: progress } : c;
            }),
          });
        }, 0);
      }, 16);
    }, 0);
  }
})();
