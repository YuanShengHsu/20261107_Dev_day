#!/bin/bash
set -u
WORK="$1"; OUT="$2"; BATCH="$3"
name=$(basename "$BATCH")
args=()
while IFS= read -r f; do [ -n "$f" ] && args+=(-i "$f"); done < "$BATCH"
first=$(basename "$(head -1 "$BATCH")" .png | sed 's/p-0*//')
last=$(basename "$(tail -1 "$BATCH")" .png | sed 's/p-0*//')
n=$(wc -l < "$BATCH" | tr -d ' ')
prompt="$(cat "$WORK/batch_prompt.md")

這批附上的圖片共 ${n} 張，依序為 PDF 第 ${first} 到 ${last} 頁（檔名 p-NNN 的 NNN 即頁碼，請用它標頁碼）。"
start=$(date +%s)
codex exec --skip-git-repo-check --ephemeral -s read-only -C "$WORK" --color never "${args[@]}" -o "$OUT/${name}.md" "$prompt" > "$OUT/${name}.log" 2>&1
rc=$?
echo "$name pages ${first}-${last} rc=$rc secs=$(( $(date +%s) - start ))" >> "$OUT/progress.log"
