/**
 * Hermes Dashboard + Bridge 一体化服务器
 * 同一个端口同时提供静态文件和 SSE/API
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { fileURLToPath } from 'node:url';

const PORT = parseInt(process.env.PORT || '8888', 10);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../hermes-agent-animation/dist');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

// 状态
let currentState = {
  mainAgent: { status: 'idle' },
  subAgents: [],
  taskQueue: [],
  lastUpdate: Date.now(),
};

const sseClients = new Set();

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try { client.write(msg); } catch { sseClients.delete(client); }
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || '', true);
  const pathname = parsed.pathname || '/';

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ====== SSE 端点 ======
  if (pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`data: ${JSON.stringify(currentState)}\n\n`);
    sseClients.add(res);

    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch {}
    }, 30000);

    req.on('close', () => {
      sseClients.delete(res);
      clearInterval(heartbeat);
    });
    return;
  }

  // ====== API 端点 ======
  if (pathname === '/api/state') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(currentState));
      return;
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const merged = { ...currentState, ...body, lastUpdate: Date.now() };
        if (body.mainAgent && typeof body.mainAgent === 'object') {
          merged.mainAgent = { ...currentState.mainAgent, ...body.mainAgent };
        }
        currentState = merged;
        broadcast(currentState);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
      return;
    }
  }

  if (pathname === '/api/dispatch-task' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const fromX = body.fromX || 480;
      const fromY = body.fromY || 300;
      const toX = body.toX || 600;
      const toY = body.toY || 400;
      
      // 立即广播分发事件
      broadcast({
        type: 'dispatchTask',
        task: { id: taskId, name: body.taskName || '任务', status: 'pending' },
        fromX, fromY, toX, toY,
      });

      // 5-8秒后自动广播回传事件（服务端管理生命周期，解决浏览器端状态竞争）
      const workTime = 5000 + Math.random() * 3000;
      setTimeout(() => {
        broadcast({
          type: 'completeTask',
          taskId,
          fromX: toX,
          fromY: toY,
          toX: fromX,
          toY: fromY,
        });
      }, workTime);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, taskId }));
      return;
    } catch {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
  }

  if (pathname === '/api/complete-task' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      broadcast({
        type: 'completeTask',
        taskId: body.taskId || '',
        fromX: body.fromX || 0,
        fromY: body.fromY || 0,
        toX: body.toX || 480,
        toY: body.toY || 300,
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    } catch {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true, clients: sseClients.size, port: PORT, lastUpdate: currentState.lastUpdate,
    }));
    return;
  }

  // ====== 静态文件 ======
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(DIST_DIR, filePath);

  // 安全校验：确保不跳出 DIST_DIR
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  serveStatic(req, res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Hermes Dashboard + Bridge running on http://0.0.0.0:${PORT}`);
  console.log(`  Static:  / (serving ${DIST_DIR})`);
  console.log(`  SSE:     /events`);
  console.log(`  API:     POST/GET /api/state`);
  console.log(`  Health:  /health`);
});
