# 乳癌手術理賠導航 · Breast Cancer Surgery Claim Navigator

[繁體中文](#繁體中文) · [English](#english)

▶️ **Demo（1 分鐘）**：[`demo/demo.mp4`](demo/demo.mp4)

> ⚠️ 所有金額皆為估算；理賠以保單條款與保險公司核定為準，醫療決策以主治醫師為準。
> All amounts are estimates. Claims are subject to policy terms and insurer approval; medical decisions rest with the attending physician.

---

## 繁體中文

給醫學中心乳房外科**個管師**使用的工具。對象是 localized 乳癌病患（原位癌 DCIS／第一期／第二期、淋巴結陰性），考慮接受「內視鏡輔助乳房切除（± 立即重建）」。依病患手上的保單與台灣健保規定，產出一份可直接貼進病歷或衛教單的「理賠套餐」。

### 功能
| 分頁 | 內容 |
|---|---|
| 理賠試算 | 每個自費項目可能由哪張保單、哪個給付項目支付；住院自費、可理賠、自付三數字摘要 |
| 問保險公司 | 依保單分組的問題清單，可以直接照唸 |
| 文件 | 要跟醫院索取的診斷書、收據、病理報告等 |
| 住院流程 | 門診 → 入院 → 手術 → 術後 → 出院 → 回診，含個管師與保險動作 |
| 術後治療 | 決策點與相關健保給付條件（治療依主治醫師決定） |
| 照護衛教 | 術後營養與照護，並提醒「營養品通常不理賠」 |
| AI 撰寫 | 把試算結果交給 Codex（本機）或 Claude（claude.ai），產出個人化說明與保險公司逐字稿 |

**支援的保單類型**：實支實付（新／舊制）、手術險、住院日額、癌症險、重大傷病險、重大疾病險、勞保、公司團保；也提供保險公司商品範本。

**最重要的規則**：原位癌（DCIS）與侵襲性乳癌在重大傷病、癌症險、重大疾病險的認定不同，試算會依病理分期即時切換。

### 使用方式
- **本機預覽**：`python3 tools/preview.py` → 開 http://localhost:8765/
- **一鍵開啟**：`bash tools/open_site.sh local`
- **Codex 撰寫**：頁面按「複製給 Codex 的提示詞」→ `pbpaste | bash tools/codex/write_package.sh` → 結果自動進剪貼簿，貼回頁面按「顯示」
- **Claude 撰寫**：以 claude.ai Artifact 發布（`sample` capability）後，在頁面內直接產出

不需要 build、後端或 API key；輸入資料只存在使用者瀏覽器的 localStorage。

### 專案結構
```
src/index.html        頁面本體（單一 HTML，原生 JS）
knowledge/            健保／商保／勞保規則、術後治療與營養、住院流程與自費項目
data/consumables.json 自費品項與價格（pdf＝講義價，est＝估計值）
codex-analysis/       講義逐頁筆記與彙整（已去識別化）
tools/                本機預覽、開站、Codex 腳本
demo/                 示範影片與錄影腳本
```

### 隱私與去識別化
不記錄院名、醫護人員姓名、分機、病歷號；不儲存病患姓名。院內作業差異一律寫成「依主治醫師慣例，入院時確認」。

---

## English

A tool for **breast surgery case managers** at a Taiwanese medical center. For patients with localized breast cancer (DCIS, stage I, or stage II node-negative) considering **endoscopic-assisted mastectomy (± immediate reconstruction)**, it maps the patient's private insurance policies and Taiwan NHI rules to a ready-to-use "claim package."

### Features
| Tab | What it gives you |
|---|---|
| Claim estimate | Which policy and benefit item may cover each self-pay item; summary of self-pay, reimbursable, and out-of-pocket amounts |
| Insurer questions | Questions grouped by policy, ready to read aloud on the phone |
| Documents | Certificates, receipts, and pathology reports to request from the hospital |
| Care pathway | Clinic → admission → surgery → post-op → discharge → follow-up, with case-manager and insurance actions |
| Adjuvant therapy | Decision points and related NHI reimbursement criteria (treatment per attending physician) |
| Care & nutrition | Post-op care and nutrition, with a reminder that supplements are usually not reimbursed |
| AI drafting | Hands the estimate to Codex (local) or Claude (claude.ai) to draft a personalized summary and insurer call script |

**Supported coverage**: medical expense reimbursement (old and new forms), surgery, daily hospital cash, cancer, catastrophic illness, critical illness, labor insurance, and group insurance, plus insurer product presets.

**Key rule**: DCIS and invasive cancer are treated differently for catastrophic illness status, cancer insurance, and critical illness insurance, so the estimate switches automatically with the pathologic stage.

### Getting started
- **Local preview**: `python3 tools/preview.py` → http://localhost:8765/
- **Open in one step**: `bash tools/open_site.sh local`
- **Codex drafting**: click "copy prompt for Codex" → `pbpaste | bash tools/codex/write_package.sh` → paste the result back and click "show"
- **Claude drafting**: publish as a claude.ai Artifact with the `sample` capability and generate in-page

No build step, backend, or API key needed. Input stays in the browser's localStorage.

### Privacy
No hospital names, staff names, phone extensions, or chart numbers are recorded, and no patient names are stored. The UI is in Traditional Chinese; amounts are in whole NTD.
