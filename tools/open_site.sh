#!/bin/bash
# 開啟網站
#   bash tools/open_site.sh          開啟已發布的 Artifact（網址取自 HANDOFF.md）
#   bash tools/open_site.sh local    啟動本機預覽（http://localhost:8765/，背景執行）並開啟
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
if [ "${1:-}" = "local" ]; then
  port=8765
  if ! lsof -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1; then
    nohup python3 "$root/tools/preview.py" $port > "$root/.preview/server.log" 2>&1 &
    sleep 1
  fi
  open "http://localhost:$port/"
  echo "本機預覽：http://localhost:$port/（本機沒有 Claude，AI 撰寫請用 Codex 流程）"
else
  url="$(grep -oE 'https://claude\.ai/artifact/[A-Za-z0-9]+' "$root/HANDOFF.md" | head -1)"
  [ -n "$url" ] || { echo "HANDOFF.md 找不到 Artifact 網址" >&2; exit 1; }
  open "$url"
  echo "已開啟：$url"
fi
