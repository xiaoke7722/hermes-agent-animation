#!/usr/bin/env python3
"""
Hermes Agent → Dashboard 桥接工具

通过 HTTP POST 将 Agent 状态实时推送到仪表盘。
Hermes Agent 可在对话中通过 terminal 工具调用此脚本。

用法:
  # 更新主Agent状态
  python3 agent2dashboard.py status --state working
  
  # 更新主Agent状态 + 任务列表
  python3 agent2dashboard.py status --state thinking --tasks '["数据分析","模型训练"]'
  
  # 分发任务（带飞行动画）
  python3 agent2dashboard.py dispatch --task-name "数据分析" --to-x 600 --to-y 400
  
  # 添加任务到队列
  python3 agent2dashboard.py queue --task-name "报告生成"
  
  # 初始化（清空子Agent，设为空闲）
  python3 agent2dashboard.py reset
  
  # 完整全量更新
  python3 agent2dashboard.py full --state working --tasks '["任务1","任务2"]'
"""

import json, sys, os, argparse, random, math
from urllib.request import Request, urlopen
from urllib.error import URLError

BRIDGE_URL = os.environ.get("HERMES_BRIDGE_URL", "http://127.0.0.1:8888")

# 画布尺寸和已用位置跟踪
CANVAS_W = 960
CANVAS_H = 640
_used_positions = set()

def _random_position():
    """生成不重叠的随机位置（避开中心主Agent区域）"""
    margin = 220  # 间距（确保头像+标签完全不重叠）
    seed_count = len(_used_positions)
    
    for _ in range(100):
        # 按已用数量分层分布，确保分散
        if seed_count < 3:
            x = random.randint(300, 700)
            y = random.randint(300, 500)
        elif seed_count < 6:
            # 分左右两区
            side = "left" if random.random() < 0.5 else "right"
            if side == "left":
                x = random.randint(200, 400)
            else:
                x = random.randint(560, 780)
            y = random.randint(280, 520)
        else:
            # 超过6个时四象限分布
            quad = seed_count % 4
            quad_ranges = [
                (250, 460, 290, 420),   # 左上
                (530, 740, 290, 420),   # 右上
                (250, 460, 440, 530),   # 左下
                (530, 740, 440, 530),   # 右下
            ]
            x_min, x_max, y_min, y_max = quad_ranges[quad]
            x = random.randint(x_min, x_max)
            y = random.randint(y_min, y_max)
        
        # 避开主Agent中心区域
        dx = x - 480
        dy = y - 300
        if abs(dx) < 130 and abs(dy) < 110:
            continue
        # 检查与已有位置的距离
        overlap = False
        for px, py in _used_positions:
            if math.sqrt((x - px) ** 2 + (y - py) ** 2) < margin:
                overlap = True
                break
        if not overlap:
            _used_positions.add((x, y))
            return x, y
    
    # 保底：等距网格排列
    cols = 4
    idx = len(_used_positions)
    x = 260 + (idx % cols) * 140
    y = 290 + (idx // cols) * 90
    _used_positions.add((x, y))
    return x, y


def _post(endpoint, data):
    """发送 POST 请求到桥接服务器"""
    url = f"{BRIDGE_URL}{endpoint}"
    req = Request(url, data=json.dumps(data).encode(), method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except URLError as e:
        print(f"[ERROR] Bridge unreachable ({url}): {e}", file=sys.stderr)
        return {"error": str(e)}
    except json.JSONDecodeError:
        return {"error": "invalid response"}


def cmd_status(args):
    """更新主Agent状态"""
    state = {
        "mainAgent": {
            "status": args.state,
        }
    }
    if args.tasks:
        state["mainAgent"]["tasks"] = [
            {"id": f"t{i}", "name": name, "status": "pending"}
            for i, name in enumerate(args.tasks)
        ]
    return _post("/api/state", state)


def cmd_dispatch(args):
    """分发任务（带飞行动画）"""
    # 自动生成随机位置
    to_x, to_y = _random_position()
    data = {
        "taskName": args.task_name,
        "fromX": args.from_x,
        "fromY": args.from_y,
        "toX": to_x,
        "toY": to_y,
    }
    return _post("/api/dispatch-task", data)


def cmd_queue(args):
    """添加任务到队列"""
    # 先获取当前状态
    from urllib.request import urlopen as get_urlopen
    try:
        with get_urlopen(f"{BRIDGE_URL}/api/state", timeout=5) as resp:
            current = json.loads(resp.read())
    except:
        current = {}

    queue = current.get("taskQueue", [])
    queue.append({
        "id": f"q-{len(queue)}-{os.urandom(2).hex()}",
        "name": args.task_name,
        "status": "pending",
    })

    return _post("/api/state", {"taskQueue": queue})


def cmd_reset(args):
    """重置仪表盘状态"""
    _used_positions.clear()
    return _post("/api/state", {
        "mainAgent": {"status": "idle", "tasks": []},
        "subAgents": [],
        "taskQueue": [],
    })


def cmd_full(args):
    """全量更新"""
    state = {
        "mainAgent": {
            "status": args.state,
        }
    }
    if args.tasks:
        state["mainAgent"]["tasks"] = [
            {"id": f"t{i}", "name": name, "status": "pending"}
            for i, name in enumerate(args.tasks)
        ]
    return _post("/api/state", state)


def main():
    parser = argparse.ArgumentParser(description="推送状态到仪表盘")
    sub = parser.add_subparsers(dest="command", required=True)

    # status
    p_status = sub.add_parser("status", help="更新主Agent状态")
    p_status.add_argument("--state", required=True,
                          choices=["idle", "working", "thinking", "distributing", "collaborating"])
    p_status.add_argument("--tasks", nargs="*", default=None, help="任务列表")

    # dispatch
    p_dispatch = sub.add_parser("dispatch", help="分发任务")
    p_dispatch.add_argument("--task-name", required=True)
    p_dispatch.add_argument("--from-x", type=int, default=480)
    p_dispatch.add_argument("--from-y", type=int, default=300)
    p_dispatch.add_argument("--to-x", type=int, default=600)
    p_dispatch.add_argument("--to-y", type=int, default=400)

    # queue
    p_queue = sub.add_parser("queue", help="添加任务到队列")
    p_queue.add_argument("--task-name", required=True)

    # reset
    sub.add_parser("reset", help="重置仪表盘")

    # full
    p_full = sub.add_parser("full", help="全量更新")
    p_full.add_argument("--state", required=True,
                        choices=["idle", "working", "thinking", "distributing", "collaborating"])
    p_full.add_argument("--tasks", nargs="*", default=None)

    args = parser.parse_args()

    handlers = {
        "status": cmd_status,
        "dispatch": cmd_dispatch,
        "queue": cmd_queue,
        "reset": cmd_reset,
        "full": cmd_full,
    }

    result = handlers[args.command](args)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
