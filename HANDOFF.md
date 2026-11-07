# HANDOFF — 進度與下一步

更新：2026-11-07（dev day）。這個資料夾是為了讓任何 Claude Code 工作階段可以接手而打包的。先讀 `CLAUDE.md`。

## 已完成
- 需求釐清：使用者是乳房外科個管師；保單用勾選＋額度輸入；AI 走頁面內 Claude（Artifact `sample` capability）。
- 讀完醫學中心乳房外科 orientation 講義 116 頁：Claude 親讀，另以 Codex CLI 逐頁辨識並彙整（`codex-analysis/`，已去識別化；Codex 的結論是講義可支撐「流程分支、自費品項核對、文件待辦、問題清單、部分已知價格小計」，不能支撐「保證理賠金額、完整自費總價、固定住院天數」）。
- 規則知識庫 `knowledge/rules-tw-insurance.md`：健保部分負擔與重大傷病、實支實付新舊制、手術險、癌症險分級、重大疾病險 2016 示範條款（第一期乳癌＝輕度）、勞保傷病給付、理賠文件。
- 流程與自費清單 `knowledge/medical-center-bs-flow.md`；品項與預設價格 `data/consumables.json`。

## 進行中
- `src/index.html`：左欄（病患與手術情境、住院與自費、身分與其他保障、保單清單），右欄（結算摘要、理賠對照表、提醒旗標、保險公司提問清單、文件清單、住院流程套餐、營養與照護、Claude 專屬套餐）。
- Artifact URL：https://claude.ai/artifact/DqNGcmLHwzorC7t5KzTSQU （2026-11-07 首次發布，版本 1，capabilities sample；私人連結，分享由頁面 Share 選單操作；之後更新一律帶 `url`）
- 本機預覽：`python3 tools/preview.py` 後開 http://localhost:8765/ （或 Claude Code 的 preview 設定）

## 下一步
1. 完成並發布頁面（Artifact 工具，`capabilities: {sample: {}}`）。
2. 向院方取得現行報價並更新 `data/consumables.json` 的 `est` 項目：內視鏡輔助乳房切除自費手術費、Tisseel、Exofin、能量器械、單孔套組、PCA、義乳植入物／擴張器、病房差額。
3. 用 2–3 張去識別的真實保單條款試跑，校正提問清單與試算邏輯（特別是實支「手術費超額併入雜費」與癌症險第一期認定）。
4. 可選：衛教單 PDF 匯出、多病患存檔（`db` capability）、保單條款上傳辨識。

## 待查證（頁面上已標「需確認」）
- 原位癌是否符合重大傷病：工具預設不符合，依健保署最新公告為準。
- 住院部分負擔實際金額：以 10% 估，依醫院帳單為準。
- 乳房重建健保給付範圍：自體皮瓣手術費部分給付、植入物自費，依醫院說明。

## 去識別化規則
所有文件與頁面只寫「醫學中心」；不寫院名、醫師姓名、分機、病房、工號、病歷號、網路路徑。`tools/codex/` 的提示詞已改為「醫學中心」；重跑後的產出要再去識別化才可放進專案。

## 原始資料位置
講義 PDF 在使用者自己的雲端硬碟歸檔，未納入專案。
