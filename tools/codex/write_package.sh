#!/bin/bash
# 用 Codex 產生「專屬套餐」：讀入頁面「AI 撰寫」分頁複製的提示詞，輸出 Markdown。
# 用法（在專案資料夾）：pbpaste | bash tools/codex/write_package.sh [輸出檔]
#   - 預設輸出到暫存檔（不放進專案，內容含個案資料），完成後自動複製到剪貼簿，貼回頁面按「顯示」。
#   - Codex 在空的暫存目錄、唯讀沙盒、不保存 session 下執行，只用提示詞裡的資料。
set -euo pipefail
prompt="$(cat)"
if [ -z "${prompt//[[:space:]]/}" ]; then echo "沒有讀到提示詞：先在頁面按「複製給 Codex 的提示詞」，再用 pbpaste | bash $0" >&2; exit 1; fi
work="$(mktemp -d)"
out="${1:-$work/package.md}"
preface="這是文字撰寫任務：不要執行任何指令、不要讀寫檔案，只依下列提示詞與資料，直接輸出最終的繁體中文 Markdown。"
echo "Codex 撰寫中（約 1–3 分鐘）…" >&2
if ! printf '%s\n\n%s\n' "$preface" "$prompt" | codex exec --skip-git-repo-check --ephemeral -s read-only -C "$work" --color never -o "$out" - > "$work/codex.log" 2>&1; then
  echo "Codex 執行失敗，記錄：$work/codex.log" >&2; exit 1; fi
if command -v pbcopy >/dev/null; then pbcopy < "$out"; echo "完成，已複製到剪貼簿：$out" >&2; else echo "完成：$out" >&2; fi
cat "$out"
