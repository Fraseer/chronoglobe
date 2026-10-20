// End-to-end checks in headless Chromium: node tests/e2e.cjs
// Needs Playwright (npm install). Set CHROMIUM_PATH to use an existing Chromium build.
const path = require("path");
const fs = require("fs");
const os = require("os");
const { chromium } = require("playwright");
const { startServer } = require("./server.cjs");

const ROOT = path.resolve(__dirname, "..");
let fails = 0;
function check(name, ok, info) {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${!ok && info !== undefined ? "  " + JSON.stringify(info) : ""}`);
}

(async () => {
  const server = await startServer(ROOT);
  const BASE = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const errors = [];

  async function newPage(opts = {}, init) {
    const ctx = await browser.newContext({ reducedMotion: "reduce", ...opts });
    // keep tests offline: web fonts fall back to system faces
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: "", contentType: "text/css" }));
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    if (init) await page.addInitScript(init);
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    return page;
  }
  const val = (p, sel) => p.evaluate((s) => document.querySelector(s).value, sel);
  const stored = (p) => p.evaluate(() => JSON.parse(localStorage.getItem("chronoglobe:events:v1") || "null"));

  // ---------------------------------------------------------------- desktop
  const p = await newPage({ viewport: { width: 1400, height: 860 } });
  let st = await p.evaluate(() => ({ rows: document.querySelectorAll("#listItems .ev").length, sel: document.querySelectorAll('.ev[aria-current="true"]').length, sync: document.querySelector("#sync").textContent }));
  check("first visit seeds 4 examples; starts on This year with nothing selected", st.rows === 2 && st.sel === 0 && st.sync === "Saved in this browser", st);
  check("examples are written to localStorage", ((await stored(p)) || []).length === 4);

  await p.click("#listItems .ev >> nth=0"); await p.waitForTimeout(1200);
  st = await p.evaluate(() => ({ title: document.querySelector(".d-title")?.textContent, focus: document.activeElement?.className }));
  check("clicking a row opens details and focuses the title", st.title === "Fall of Constantinople" && st.focus === "d-title", st);
  await p.click("#detailView .btn.ghost");
  st = await p.evaluate(() => ({ list: !document.querySelector("#listView").hidden, sel: document.querySelectorAll('.ev[aria-current="true"]').length }));
  check("Back returns to the list and clears the selection", st.list && st.sel === 0, st);

  // click a globe point: it opens and is centred
  const gb = await p.locator("#globe").boundingBox();
  const pos = await p.evaluate(({ w, h }) => { const R = Math.max(60, Math.min(w, h * 1.02) / 2 - 30); return d3.geoOrthographic().clipAngle(90).rotate([-28.978, -41.008]).scale(R).translate([w / 2, h / 2])([8.247, 49.992]); }, { w: gb.width, h: gb.height });
  await p.mouse.click(gb.x + pos[0], gb.y + pos[1]); await p.waitForTimeout(1800);
  await p.mouse.move(gb.x + gb.width / 2 + 1, gb.y + gb.height / 2 + 1); await p.waitForTimeout(150);
  st = await p.evaluate(() => ({ title: document.querySelector(".d-title")?.textContent, tip: document.querySelector("#tip").hidden ? null : document.querySelector("#tip b").textContent }));
  check("clicking a globe point opens it and centres the globe on it", st.title === "Gutenberg Bible printed" && st.tip === "Gutenberg Bible printed", st);
  await p.mouse.click(gb.x + gb.width / 2, gb.y + gb.height * 0.9); await p.waitForTimeout(150);
  check("clicking empty globe closes the details", await p.evaluate(() => document.querySelector("#detailView").hidden));

  await p.click("#yearInput"); await p.keyboard.type("1066"); await p.keyboard.press("Escape");
  check("Escape cancels a typed year", (await val(p, "#yearInput")) === "1453");

  // add an event, then reload: it must still be there
  await p.click("#addBtn");
  await p.fill("#fTitle", "Founding of Rome (test)");
  await p.fill("#fYear", "753"); await p.selectOption("#fEra", "BC");
  await p.selectOption("#fMonth", "4"); await p.fill("#fDay", "21");
  await p.fill("#fPlace", "Rome, Italy"); await p.dispatchEvent("#fPlace", "input");
  await p.fill("#fDesc", "Traditional date.");
  const tb = await p.locator("#tlTrack").boundingBox();
  for (const fx of [0.1, 0.5, 0.66]) await p.mouse.click(tb.x + tb.width * fx, tb.y + 40);
  check("the form survives clicks on the timeline", (await val(p, "#fTitle")) === "Founding of Rome (test)");
  await p.click("#fSave"); await p.waitForTimeout(800);
  st = await p.evaluate(() => document.querySelector("#detailView .d-year")?.textContent);
  check("saving shows the new event's details", st === "21 April 753 BC", st);
  await p.reload(); await p.waitForTimeout(1500);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, rows: JSON.parse(localStorage.getItem("chronoglobe:events:v1")).map((r) => r.title) }));
  check("events persist across a reload", st.n === "5" && st.rows.includes("Founding of Rome (test)"), st);

  // a second tab sees changes from the first
  const p2 = await p.context().newPage();
  await p2.goto(BASE); await p2.waitForTimeout(1200);
  await p2.click("#tabAll"); await p2.click('#listItems .ev[data-year="-752"]'); await p2.waitForTimeout(900);
  await p2.click("#detailView .btn.danger"); await p2.click("#detailView .btn.danger-solid"); await p2.waitForTimeout(300);
  await p.waitForTimeout(300);
  check("deleting in one tab updates the other", (await p.evaluate(() => document.querySelector("#countAll").textContent)) === "4");
  await p2.close();

  // export
  await p.click("#tabAll");
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click(".data-tools .btn >> text=Export backup")]);
  const file = path.join(os.tmpdir(), "chronoglobe-export.json");
  await dl.saveAs(file);
  const exported = JSON.parse(fs.readFileSync(file, "utf8"));
  check("Export backup downloads every event", /^chronoglobe-events-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()) && exported.app === "chronoglobe" && exported.events.length === 4, { name: dl.suggestedFilename(), n: exported.events && exported.events.length });

  // remove examples: they must not come back after reload
  await p.click("#listItems .examples .btn"); await p.click("#listItems .examples .btn.danger-solid"); await p.waitForTimeout(400);
  await p.reload(); await p.waitForTimeout(1200);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, empty: !!document.querySelector("#listItems .empty") }));
  check("removed examples stay removed after a reload", st.n === "0" && st.empty, st);

  // import the backup back in, then import again (updates, no duplicates)
  await p.setInputFiles("#importFile", file); await p.waitForTimeout(400);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, toast: document.querySelector("#toast").textContent }));
  check("Import backup restores events", st.n === "4" && /Imported 4 new events/.test(st.toast), st);
  await p.setInputFiles("#importFile", file); await p.waitForTimeout(400);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, toast: document.querySelector("#toast").textContent }));
  check("importing the same backup again doesn't duplicate", st.n === "4" && /updated 4/.test(st.toast), st);
  const bad = path.join(os.tmpdir(), "chronoglobe-bad.json");
  fs.writeFileSync(bad, "{not json");
  await p.setInputFiles("#importFile", bad); await p.waitForTimeout(300);
  check("a broken file is rejected with a message", /isn't a Chronoglobe backup/.test(await p.evaluate(() => document.querySelector("#toast").textContent)));

  // ---------------------------------------------------------------- blocked storage
  const pb = await newPage({ viewport: { width: 1200, height: 800 } }, () => { Storage.prototype.setItem = function () { throw new DOMException("blocked", "SecurityError"); }; });
  st = await pb.evaluate(() => ({ sync: document.querySelector("#sync").textContent, add: document.querySelector("#addBtn").hidden, empty: document.querySelector("#listItems").innerText.slice(0, 40) }));
  check("blocked storage says so and hides Add event", st.sync === "Not saving" && st.add && /isn't saving/.test(st.empty), st);

  // ---------------------------------------------------------------- phones
  for (const width of [320, 360, 390, 430]) {
    const m = await newPage({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2.6, colorScheme: "dark" });
    const overflow = () => m.evaluate((w) => {
      const bad = [];
      for (const el of document.querySelectorAll("body *")) {
        if (el.closest("svg") || el.classList.contains("sr-only") || el.closest("[hidden]") || el.id === "tip") continue;
        const r = el.getBoundingClientRect();
        if (r.width && r.height && (r.right > w + 0.5 || r.left < -0.5)) bad.push(el.tagName + "#" + el.id + "." + el.className);
      }
      return { sw: document.documentElement.scrollWidth, bad: bad.slice(0, 4) };
    }, width);
    const states = [];
    states.push(["this-year", await overflow()]);
    await m.tap("#tabAll"); states.push(["full-timeline", await overflow()]);
    const row = m.locator("#listItems .ev").first(); await row.scrollIntoViewIfNeeded(); await row.tap(); await m.waitForTimeout(1000);
    states.push(["detail-sheet", await overflow()]);
    await m.tap("#detailView .btn.ghost"); await m.tap("#addBtn"); await m.waitForTimeout(300);
    states.push(["add-form", await overflow()]);
    const okAll = states.every(([, o]) => o.sw === width && !o.bad.length);
    check(`${width}px phone: nothing spills past the screen edge`, okAll, states.filter(([, o]) => o.sw !== width || o.bad.length));
    await m.context().close();
  }

  check("no page errors", errors.length === 0, errors);
  console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
  await browser.close();
  server.close();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
