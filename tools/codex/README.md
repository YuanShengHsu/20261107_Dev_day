# 用 Codex CLI 重跑講義分析

1. 把講義 PDF 轉成 PNG：`pdftoppm -r 100 -png <pdf> pages/p`
2. 修改 `run_all.sh` 開頭的 `SP` 路徑（pages/ 與輸出目錄的上層）。
3. 執行 `bash run_all.sh`：每 12 頁一批、3 批並行呼叫 `codex exec`（讀取模式、不落地 session），最後用 `synth_prompt.md` 彙整。
4. 產出的筆記含院內人員與個案資訊，**放進專案前一定要去識別化**（院名→醫學中心、姓名／電話／工號／病歷號／病房號遮蔽、刪除聯絡表頁）。

# 用 Codex 撰寫專屬套餐（頁面「AI 撰寫」分頁）

1. 頁面按「複製給 Codex 的提示詞」。
2. 在專案資料夾執行 `pbpaste | bash tools/codex/write_package.sh`（約 1–3 分鐘；可加輸出檔路徑參數）。
3. 結果自動複製到剪貼簿，貼回頁面按「顯示」。

Codex 在空的暫存目錄、唯讀沙盒、`--ephemeral` 下執行，只使用提示詞內的資料；輸出預設寫在暫存目錄，不進專案（內容含個案資料）。
