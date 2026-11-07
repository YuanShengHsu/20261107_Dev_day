# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 乳癌手術理賠套餐 agent（dev day 2026-11-07）

## 目的
給醫學中心乳房外科個管師用的工具：病患為 localized 乳癌（原位癌 DCIS／第一期／第二期、淋巴結陰性），
考慮接受「內視鏡輔助乳房切除（± 立即重建）」。依病患手上的保單（實支實付、手術險、癌症險、
重大傷病／重大疾病險、住院日額、團保）與台灣健保規定，產出：
1. 可理賠項目對照（每個自費項目可能由哪張保單、哪個給付項目支付）
2. 要問保險公司的問題清單（可直接照唸）
3. 要跟醫院索取的文件清單
4. 住院流程套餐（門診→入院→手術→術後→出院→回診，含個管師／保險動作）
5. 術後營養與照護建議（含「營養品通常不理賠」的提醒）
6. 自費／理賠／自付的預估
7. 「專屬套餐」：頁面內直接呼叫 Claude，依上述資料產生個人化說明與保險公司逐字稿

## 已決定的事（不要再問）
- 使用者是個管師／診所端，不是病患；語氣專業、可直接貼進病歷或衛教單。
- 保單輸入用「勾選類型＋填額度」，不做保單條款上傳。
- AI 撰寫（「AI 撰寫」分頁）兩條路，都沒有後端、沒有 API key：
  - **Codex（dev day 主要示範）**：頁面「複製給 Codex 的提示詞」→ `pbpaste | bash tools/codex/write_package.sh` → 結果自動進剪貼簿 → 貼回頁面按「顯示」。
  - **Claude**：claude.ai Artifact 的 `sample` capability（頁面內 `await claude.use("sample")`），只在 claude.ai 上可用。
  兩者共用同一份 `basePrompt()`。
- 形式：單一 HTML（`src/index.html`），原生 JS，不用框架；以 Claude Code 的 Artifact 工具發布，
  `capabilities: {sample: {}}`。首次發布的 URL 記在 `HANDOFF.md`，之後更新一律帶 `url` 重新發布。
- 繁體中文介面；金額一律新台幣整數。

## 去識別化（最重要）
- 所有文件、頁面、提示詞只寫「醫學中心」，不寫院名或縮寫。
- 不寫醫師、護理師、個管師姓名（連姓氏表格都不要），不寫分機、病房號、工號、病歷號、網路路徑。
- 來自院內講義的作業差異一律寫成「依主治醫師慣例，入院時確認」。
- `codex-analysis/` 已去識別化；若重跑 Codex，產出一定要再跑一次去識別化才可放進專案。

## 檔案地圖
- `src/index.html` — 頁面本體（輸入在左、套餐在右；Claude 區塊在最後）
- `knowledge/rules-tw-insurance.md` — 健保／商保／勞保規則摘要與來源
- `knowledge/adjuvant-nhi-nutrition.md` — 術後治療決策點、相關健保給付（待查證）、每次住院營養品，以及不納入工具的講義內容
- `knowledge/medical-center-bs-flow.md` — 醫學中心乳房外科住院流程、自費項目與價格（整理自 2025/04 版 orientation 講義）
- `data/consumables.json` — 自費品項、價格、來源標記（`pdf`＝講義價，`est`＝估計值）
- `codex-analysis/` — Codex 對講義 116 頁的逐頁筆記與彙整報告（去識別化版）
- `tools/codex/` — 重跑 Codex 批次分析的腳本與提示詞
- `HANDOFF.md` — 進度、下一步、待查證清單

## 開發與發布
- 沒有 build、lint、測試框架、套件相依；改完 `src/index.html` 直接預覽或發布。
- 開網站：`bash tools/open_site.sh`（開已發布的 Artifact，網址取自 `HANDOFF.md`）；`bash tools/open_site.sh local`（背景啟動本機預覽並開啟）。
- 本機預覽：`python3 tools/preview.py [port]`（預設 8765）→ http://localhost:8765/ 。腳本把 `src/index.html`
  包進與 Artifact 發布時相同的外層 skeleton，寫到 `.preview/`（git 忽略）；`.claude/launch.json` 有同樣的 preview 設定。
  本機沒有 `window.claude`，Claude 區塊會顯示「此環境不可用」，屬正常；要測 `sample` 必須發布後在 claude.ai 開。
- `src/index.html` 是片段（`<title>`／`<link>`／`<style>`／內容／`<script>`），不含 `<html><body>`；外層由發布端加，不要自己補。
- 發布：Artifact 工具，`file_path: src/index.html`、`url` 用 `HANDOFF.md` 記的網址、`capabilities: {sample: {}}`。
- 重跑 Codex 講義分析：見 `tools/codex/README.md`（`pdftoppm` 轉 PNG → `bash tools/codex/run_all.sh`，需先改腳本開頭的 `SP` 路徑）。

## 頁面架構（`src/index.html` 的 `<script>`，單一 IIFE）
- 參考資料常數在最前面：`STAGES`、`OPTYPES`（含各術式預設自費手術費）、`CONSUMABLES`、`PTYPE`／`PFIELDS`／`PDEFAULT`（保單類型、欄位定義、預設值）、`EXAMPLE`（示範病患）。
  新增保單類型＝在 `PTYPE`、`PFIELDS`、`PDEFAULT` 各加一筆，再到 `compute()` 處理給付邏輯。
- 版面：左側輸入分三個分頁（個案／自費／保單，`data-ctab`），右側是三數字摘要＋提醒，輸出分頁（理賠試算／問保險公司／文件／住院流程／術後治療／照護衛教／Claude，`data-otab`）。
- 資料流：任何 `[data-bind=key]` 欄位自動同步 `state[key]`（`bindFields()`；新增輸入欄位只要加 `data-bind`，並在 `EXAMPLE` 給預設值）→
  `state`（`localStorage` key `bca-breast-insurance-v1`）→ `ctxOf(state)` 得出情境旗標（`dcis`／`endo`／`recon`／`size`／`pre`…）與 `neoOf()`（術前治療可能性）
  → `compute(s)` 算出自費、各保單給付、自付與提醒旗標 → `buildQuestions`／`buildDocs`／`buildFlow`／`buildAdjuvant`／`buildCare` → `refresh()` 呼叫 `UI.render()`。
  `buildMarkdown()` 產生「複製全部」用的 Markdown。
- 保險公司範本在 `PRESETS`（目前為國泰人壽三款，數字來自官網商品說明，`src` 欄註明版本）；實支保單的 `alt` 欄位是「實支／住院日額擇優」。
- 實支實付的核心在 `compute()` 內的 `applyReimb()`：依病房差額×天數、手術費、雜費限額分池扣抵，`overflow` 處理「手術費超額併入雜費」。
- Claude 區塊：`claude.use('sample')` 取得函式；`basePrompt()` = 固定章節指示 + `caseJSON()`（病患／保單／試算結果）+ `RULES`。
  `aiFail()` 處理未授權等錯誤碼並停用按鈕。
- **兩處重複資料，改一邊要同步另一邊**：
  - `data/consumables.json` 頁面不會讀取；`CONSUMABLES` 是內嵌副本（JSON 的 `suggest` 是字串標籤，頁面裡是 `c=>…` 函式）。改品項或價格時兩邊都改，`src` 標記也要一致。
  - `RULES`（送給 Claude 的規則摘要）是 `knowledge/rules-tw-insurance.md` 與 `knowledge/adjuvant-nhi-nutrition.md` 的濃縮版；規則改動要同時更新兩者，且與 `compute()`／`buildQuestions()` 的判斷一致。

## 原則
- 所有金額都是估算；頁面必須標示「以保單條款與保險公司核定為準、醫療決策以主治醫師為準」，不得寫「一定理賠」。
- 講義來的價格標 `pdf`，不確定的標「估，請填醫院報價」；住院天數不是固定值，用可編輯欄位。
- 原位癌（DCIS）與侵襲性乳癌在重大傷病、癌症險、重大疾病險的認定差異，是這個工具最重要的規則，改動前先看 `knowledge/rules-tw-insurance.md`。
- 不要把講義裡「為了不被健保核刪而加開項目」「以營養支持為主訴安排住院以利實支給付」之類的作業筆記寫進工具。
- 不得使用 NCCN 指引內容（摘錄、改寫、內嵌提示詞皆不可）：NCCN 授權禁止用於 AI 工具。治療只列決策點，寫「依主治醫師決定」。
- 專案資料夾內的 PDF（講義、指引）不進 git（`.gitignore` 已排除 `*.pdf`）。
