#!/bin/bash
set -u
SP="/private/tmp/claude-501/-Users-yshsu-Library-Application-Support-Claude-scratch-workspaces-c8df185c-7ee4-4a9a-8c4a-b0f701d420a7-aa4e761c-8aef-4629-9794-84215dcf2158-scratch-2026-11-07-914284/7163df4d-fe20-4695-8399-4124183551ea/scratchpad"
PAGES="$SP/orientation_pdf/pages"; WORK="$SP/codex_work"; OUT="$WORK/out"; SCR="$SP/codex_scripts"
mkdir -p "$OUT"; cp "$SCR/batch_prompt.md" "$WORK/batch_prompt.md"
for i in $(seq 1 240); do
  if ! pgrep -f "pdftoppm -r 100 -png" >/dev/null 2>&1 && [ "$(ls "$PAGES"/p-*.png 2>/dev/null | wc -l | tr -d ' ')" -ge 116 ]; then break; fi
  sleep 5
done
echo "render ready: $(ls "$PAGES"/p-*.png | wc -l | tr -d ' ') pages $(date)" > "$OUT/progress.log"
ls "$PAGES"/p-*.png | sort > "$WORK/pages.txt"
rm -f "$WORK"/batch_??
split -l 12 -a 2 "$WORK/pages.txt" "$WORK/batch_"
ls "$WORK"/batch_?? | xargs -P 3 -n 1 bash "$SCR/codex_one_batch.sh" "$WORK" "$OUT"
cat "$OUT"/batch_??.md > "$WORK/all_batch_notes.md" 2>/dev/null
echo "batches done, notes bytes: $(wc -c < "$WORK/all_batch_notes.md" | tr -d ' '); synthesis start $(date)" >> "$OUT/progress.log"
codex exec --skip-git-repo-check --ephemeral -s read-only -C "$WORK" --color never -o "$OUT/final_analysis.md" "$(cat "$SCR/synth_prompt.md")" < "$WORK/all_batch_notes.md" > "$OUT/synth.log" 2>&1
echo "ALL DONE rc=$? $(date)" >> "$OUT/progress.log"
