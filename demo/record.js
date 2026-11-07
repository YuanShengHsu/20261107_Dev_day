// Scripted ~60s walkthrough of the local preview, recorded with Playwright.
const { chromium } = require('playwright-core');
const W = 1280, H = 720;
const OUT = __dirname + '/raw';  // usage: npm i playwright-core; python3 tools/preview.py &; node demo/record.js

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'zh-TW',
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:8765' });
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto('http://localhost:8765/');
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();

  // overlay: caption bar, fake cursor, title card
  await page.addStyleTag({ content: `
    #dCap{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99999;max-width:1100px;
      background:rgba(20,24,32,.88);color:#fff;font:600 24px/1.45 "PingFang TC",system-ui;padding:14px 28px;border-radius:14px;
      box-shadow:0 8px 30px rgba(0,0,0,.25);transition:opacity .35s;text-align:center;opacity:0}
    #dCur{position:fixed;left:640px;top:360px;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;z-index:99998;
      background:rgba(232,72,120,.35);border:3px solid #e84878;transition:left .55s ease,top .55s ease,transform .15s;pointer-events:none}
    #dCur.down{transform:scale(.7)}
    #dCard{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#fff5f8,#f3f6ff);color:#1d2330;font-family:"PingFang TC",system-ui;transition:opacity .6s}
    #dCard h1{font-size:56px;margin:0 0 18px}#dCard p{font-size:24px;margin:6px 0;color:#4a5263}
    #dCard .pink{color:#d63a6c}` });
  await page.evaluate(() => {
    for (const id of ['dCap', 'dCur']) { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); }
  });

  const wait = ms => page.waitForTimeout(ms);
  const cap = async (txt, ms) => {
    await page.evaluate(t => { const c = document.getElementById('dCap'); c.innerHTML = t; c.style.opacity = t ? 1 : 0; }, txt);
    if (ms) await wait(ms);
  };
  const card = async (html) => page.evaluate(h => {
    let c = document.getElementById('dCard');
    if (!c) { c = document.createElement('div'); c.id = 'dCard'; document.body.appendChild(c); }
    c.innerHTML = h; c.style.opacity = 1; c.style.display = 'flex';
  }, html);
  const uncard = async () => { await page.evaluate(() => { document.getElementById('dCard').style.opacity = 0; }); await wait(600);
    await page.evaluate(() => { document.getElementById('dCard').style.display = 'none'; }); };
  const moveTo = async (sel) => {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    await page.evaluate(([x, y]) => { const c = document.getElementById('dCur'); c.style.left = x + 'px'; c.style.top = y + 'px'; },
      [b.x + b.width / 2, b.y + b.height / 2]);
    await wait(600);
    return el;
  };
  const click = async (sel, after = 700) => {
    const el = await moveTo(sel);
    await page.evaluate(() => document.getElementById('dCur').classList.add('down'));
    await el.click();
    await wait(150);
    await page.evaluate(() => document.getElementById('dCur').classList.remove('down'));
    await wait(after);
  };
  const select = async (sel, val, after = 900) => {
    await moveTo(sel);
    await page.selectOption(sel, val);
    await wait(after);
  };
  const scrollResult = async (dy, steps = 6, ms = 1800) => {
    await page.mouse.move(1150, 600);
    for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await wait(ms / steps); }
  };

  const panelTop = async (ms = 700) => { await page.evaluate(() => {
      const y = document.querySelector('.panel').getBoundingClientRect().top + scrollY - 8;
      scrollTo({ top: y, behavior: 'smooth' }); }); await wait(ms); };
  const tab = async (sel, ms) => { await click(sel, 200); await panelTop(ms); };

  // 0–4s title
  await card(`<h1>乳癌手術<span class="pink">理賠導航</span></h1>
    <p>給醫學中心乳房外科個管師的理賠套餐工具</p><p>DCIS／第一期／第二期（N0）・內視鏡輔助乳房切除 ± 重建</p>`);
  await wait(4200);
  await uncard();

  // 4–10s load example
  await cap('一鍵載入示範個案：病理分期、受體、術式、住院天數都可編輯');
  await click('#btnExample', 3000);

  // 10–17s DCIS vs invasive
  await cap('原位癌 vs. 侵襲性：重大傷病、癌症險、重大疾病險的認定不同，試算即時更新');
  await select('#f_stage', 'dcis', 1500);
  await select('#f_stage', 's1', 2600);

  // 17–23s self-pay items
  await cap('自費分頁：依情境自動勾選耗材與帶回用品（講義價／估計價分開標示）');
  await click('#ct_items', 600);
  await click('#btnSuggest', 3200);

  // 23–30s policies
  await cap('保單分頁：勾選類型＋填額度，也可直接套用保險公司商品範本');
  await click('#ct_pol', 800);
  await select('#f_newtype', 'preset:cv4m20', 500);
  await click('#btnAdd', 3000);

  // 30–37s claims
  await cap('理賠試算：每個自費項目由哪張保單、哪個給付項目支付，自付金額一目了然');
  await tab('#ot_claims', 1200);
  await scrollResult(420, 6, 3000);
  await panelTop(800);

  // 37–42s insurer questions
  await cap('問保險公司：依保單分組的問題清單，可以直接照唸');
  await tab('#ot_call', 3800);

  // 42–46s docs
  await cap('文件清單：出院前要跟醫院索取的診斷書、收據、病理報告');
  await tab('#ot_docs', 3200);

  // 46–50s flow
  await cap('住院流程套餐：門診 → 入院 → 手術 → 術後 → 出院 → 回診');
  await tab('#ot_flow', 3200);

  // 50–53s adjuvant / care
  await cap('術後治療決策點與照護衛教（營養品通常不理賠，主動提醒）');
  await tab('#ot_adj', 1800);
  await tab('#ot_care', 1800);

  // 53–57s AI
  await cap('AI 撰寫：一鍵複製提示詞交給 Codex，或在 claude.ai 直接產出個人化說明');
  await tab('#ot_ai', 1000);
  await click('#btnCopyPrompt', 2600);
  await cap('');

  // end card
  await card(`<h1>乳癌手術<span class="pink">理賠導航</span></h1>
    <p>單一 HTML・不需後端・資料只留在本機瀏覽器</p>
    <p style="font-size:22px;margin-top:22px">金額皆為估算；理賠以保單條款與保險公司核定為準，醫療決策以主治醫師為準</p>`);
  await wait(4000);

  console.log('elapsed', ((Date.now() - t0) / 1000).toFixed(1), 's');
  await ctx.close();
  await browser.close();
})();
