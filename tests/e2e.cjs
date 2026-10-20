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
  check("first visit seeds 6 examples; starts in 1977 with its two events lit and nothing selected", st.rows === 2 && st.sel === 0 && st.sync === "Saved in this browser", st);
  check("examples are written to localStorage", ((await stored(p)) || []).length === 6);

  await p.click("#listItems .ev >> nth=0"); await p.waitForTimeout(1200);
  st = await p.evaluate(() => ({ title: document.querySelector(".d-title")?.textContent, focus: document.activeElement?.className }));
  check("clicking a row opens details and focuses the title", st.title === "Star Wars opens in cinemas" && st.focus === "d-title", st);
  await p.click("#detailView .btn.ghost");
  st = await p.evaluate(() => ({ list: !document.querySelector("#listView").hidden, sel: document.querySelectorAll('.ev[aria-current="true"]').length }));
  check("Back returns to the list and clears the selection", st.list && st.sel === 0, st);

  // click a globe point: it opens and is centred (the globe is facing Hollywood after opening Star Wars above)
  const gb = await p.locator("#globe").boundingBox();
  const pos = await p.evaluate(({ w, h }) => { const R = Math.max(60, Math.min(w, h * 1.02) / 2 - 30); return d3.geoOrthographic().clipAngle(90).rotate([118.341, -34.102]).scale(R).translate([w / 2, h / 2])([-80.604, 28.608]); }, { w: gb.width, h: gb.height });
  await p.mouse.click(gb.x + pos[0], gb.y + pos[1]); await p.waitForTimeout(1800);
  await p.mouse.move(gb.x + gb.width / 2 + 1, gb.y + gb.height / 2 + 1); await p.waitForTimeout(150);
  st = await p.evaluate(() => ({ title: document.querySelector(".d-title")?.textContent, tip: document.querySelector("#tip").hidden ? null : document.querySelector("#tip b").textContent, year: document.querySelector("#yearInput").value }));
  check("clicking a globe point opens it and centres the globe on it", st.title === "Apollo 11 launches to the Moon" && st.tip === "Apollo 11 launches to the Moon", st);
  check("clicking a globe point moves the timeline to its year", st.year === "1969", st);
  await p.mouse.click(gb.x + gb.width / 2, gb.y + gb.height * 0.9); await p.waitForTimeout(150);
  check("clicking empty globe closes the details", await p.evaluate(() => document.querySelector("#detailView").hidden));

  await p.click("#yearInput"); await p.keyboard.type("1066"); await p.keyboard.press("Escape");
  check("Escape cancels a typed year", (await val(p, "#yearInput")) === "1969");

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
  check("events persist across a reload", st.n === "7" && st.rows.includes("Founding of Rome (test)"), st);

  // a second tab sees changes from the first
  const p2 = await p.context().newPage();
  await p2.goto(BASE); await p2.waitForTimeout(1200);
  await p2.click("#tabAll"); await p2.click('#listItems .ev[data-year="-752"]'); await p2.waitForTimeout(900);
  await p2.click("#detailView .btn.danger"); await p2.click("#detailView .btn.danger-solid"); await p2.waitForTimeout(300);
  await p.waitForTimeout(300);
  check("deleting in one tab updates the other", (await p.evaluate(() => document.querySelector("#countAll").textContent)) === "6");
  await p2.close();

  // export
  await p.click("#tabAll");
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click(".data-tools .btn >> text=Export backup")]);
  const file = path.join(os.tmpdir(), "chronoglobe-export.json");
  await dl.saveAs(file);
  const exported = JSON.parse(fs.readFileSync(file, "utf8"));
  check("Export backup downloads every event", /^chronoglobe-events-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()) && exported.app === "chronoglobe" && exported.events.length === 6, { name: dl.suggestedFilename(), n: exported.events && exported.events.length });

  // remove examples: they must not come back after reload
  await p.click("#listItems .examples .btn"); await p.click("#listItems .examples .btn.danger-solid"); await p.waitForTimeout(400);
  await p.reload(); await p.waitForTimeout(1200);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, empty: !!document.querySelector("#listItems .empty") }));
  check("removed examples stay removed after a reload", st.n === "0" && st.empty, st);

  // import the backup back in, then import again (updates, no duplicates)
  await p.setInputFiles("#importFile", file); await p.waitForTimeout(400);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, toast: document.querySelector("#toast").textContent }));
  check("Import backup restores events", st.n === "6" && /Imported 6 new events/.test(st.toast), st);
  await p.setInputFiles("#importFile", file); await p.waitForTimeout(400);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, toast: document.querySelector("#toast").textContent }));
  check("importing the same backup again changes nothing", st.n === "6" && /already here/.test(st.toast), st);

  // edit an event, then import the older backup: the edit must survive
  await p.click("#tabAll"); await p.click('#listItems .ev[data-year="-2559"]'); await p.waitForTimeout(900);
  await p.click("#detailView .btn >> text=Edit");
  await p.fill("#fTitle", "Great Pyramid of Giza (my notes)");
  await p.click("#fSave"); await p.waitForTimeout(500);
  await p.setInputFiles("#importFile", file); await p.waitForTimeout(400);
  st = await p.evaluate(() => ({ titles: JSON.parse(localStorage.getItem("chronoglobe:events:v1")).map((r) => r.title), toast: document.querySelector("#toast").textContent }));
  check("importing an older backup keeps a newer local edit", st.titles.includes("Great Pyramid of Giza (my notes)") && !st.titles.includes("Great Pyramid of Giza completed") && /newer/.test(st.toast), st);

  // a file with an impossible year is ignored rather than freezing the timeline
  const huge = path.join(os.tmpdir(), "chronoglobe-huge.json");
  fs.writeFileSync(huge, JSON.stringify({ app: "chronoglobe", events: [{ id: "bad-year", title: "Typo", year: 1000000000, lat: 0, lng: 0 }] }));
  const t0 = Date.now();
  await p.setInputFiles("#importFile", huge); await p.waitForTimeout(400);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, toast: document.querySelector("#toast").textContent }));
  check("an impossible year in a backup is ignored", st.n === "6" && /No events found/.test(st.toast) && Date.now() - t0 < 3000, st);
  const bad = path.join(os.tmpdir(), "chronoglobe-bad.json");
  fs.writeFileSync(bad, "{not json");
  await p.setInputFiles("#importFile", bad); await p.waitForTimeout(300);
  check("a broken file is rejected with a message", /isn't a Chronoglobe backup/.test(await p.evaluate(() => document.querySelector("#toast").textContent)));

  // ---------------------------------------------------------------- dragging the timeline
  const g = await newPage({ viewport: { width: 1400, height: 860 } });
  const view = () => g.evaluate(() => window.__chronoglobe.view().rot[0]);
  const tr = await g.locator("#tlTrack").boundingBox();
  // record the fastest spin seen, frame by frame, inside the page
  await g.evaluate(() => { window.__peak = 0; (function loop() { window.__peak = Math.max(window.__peak, window.__chronoglobe.spin()); requestAnimationFrame(loop); })(); });
  // drag 150px slowly (a step every ~110ms) or in one quick flick
  async function drag(x0, fast) {
    await g.evaluate(() => { window.__peak = 0; });
    await g.mouse.move(tr.x + x0, tr.y + 40); await g.mouse.down();
    const before = await view();
    if (fast) await g.mouse.move(tr.x + x0 + 150, tr.y + 40, { steps: 15 });
    else for (let i = 1; i <= 15; i++) { await g.waitForTimeout(110); await g.mouse.move(tr.x + x0 + i * 10, tr.y + 40); }
    await g.waitForTimeout(150);
    const during = await g.evaluate(() => window.__chronoglobe.labelsShown());
    await g.mouse.up();
    await g.waitForTimeout(600);
    const turned = (await view()) - before, peak = await g.evaluate(() => window.__peak);
    await g.waitForFunction(() => window.__chronoglobe.spin() === 0, null, { timeout: 8000 });
    await g.waitForTimeout(300);
    return { turned, peak, labelsWhileDragging: during };
  }
  const slow = await drag(tr.width * 0.4, false);
  const fast = await drag(tr.width * 0.4, true);
  check("dragging the timeline forward spins the globe", slow.turned > 1 && fast.turned > 1, { slow, fast });
  check("a faster drag spins the globe faster", fast.peak > slow.peak * 2, { slowDegPerSec: Math.round(slow.peak * 1000), fastDegPerSec: Math.round(fast.peak * 1000) });
  check("names are hidden while dragging and come back after", !slow.labelsWhileDragging && (await g.evaluate(() => window.__chronoglobe.labelsShown())), slow);
  await g.click("#lockBtn");
  const locked = await drag(tr.width * 0.4, true);
  check("Lock keeps the globe still while dragging the timeline", Math.abs(locked.turned) < 0.01 && (await g.getAttribute("#lockBtn", "aria-pressed")) === "true", locked);
  await g.click("#lockBtn");
  // fading: move from 1453 (two events lit) to 1969, then wait
  await g.fill("#yearInput", "1453"); await g.press("#yearInput", "Enter"); await g.waitForTimeout(2300);
  await g.fill("#yearInput", "1969"); await g.press("#yearInput", "Enter");
  const fadingNow = await g.evaluate(() => window.__chronoglobe.fading());
  await g.waitForTimeout(3000);
  const fadingLater = await g.evaluate(() => window.__chronoglobe.fading());
  check("points that leave the window fade out over a few seconds", fadingNow === 2 && fadingLater === 0, { fadingNow, fadingLater });
  await g.context().close();

  // ---------------------------------------------------------------- touch drags spin three times as fast as the same mouse drag
  const tg = await newPage({ viewport: { width: 1200, height: 860 }, hasTouch: true });
  await tg.evaluate(() => { window.__peak = 0; (function loop() { window.__peak = Math.max(window.__peak, window.__chronoglobe.spin()); requestAnimationFrame(loop); })(); });
  const ttr = await tg.locator("#tlTrack").boundingBox();
  const cdp = await tg.context().newCDPSession(tg);
  async function paced(kind) {
    await tg.evaluate(() => { window.__peak = 0; });
    const x0 = ttr.x + ttr.width * 0.3, y = ttr.y + 40;
    if (kind === "touch") await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
    else { await tg.mouse.move(x0, y); await tg.mouse.down(); }
    for (let i = 1; i <= 15; i++) {
      await tg.waitForTimeout(40);
      if (kind === "touch") await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + i * 10, y }] });
      else await tg.mouse.move(x0 + i * 10, y);
    }
    await tg.waitForTimeout(100);
    const peak = await tg.evaluate(() => window.__peak);
    if (kind === "touch") await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    else await tg.mouse.up();
    await tg.waitForFunction(() => window.__chronoglobe.spin() === 0, null, { timeout: 8000 });
    return peak;
  }
  const mousePeak = await paced("mouse"), touchPeak = await paced("touch");
  check("a touch drag on the timeline spins the globe about 3x faster", touchPeak > mousePeak * 2.2, { mouseDegPerSec: Math.round(mousePeak * 1000), touchDegPerSec: Math.round(touchPeak * 1000) });
  await tg.context().close();

  // ---------------------------------------------------------------- other events in the same year
  const sy = await newPage({ viewport: { width: 1400, height: 860 } }, () => {
    if (localStorage.getItem("chronoglobe:events:v1") == null) {
      localStorage.setItem("chronoglobe:events:v1", JSON.stringify([
        { id: "a", title: "Gutenberg Bible printed", year: 1455, lat: 49.99, lng: 8.25, createdAt: 1 },
        { id: "b", title: "Wars of the Roses begin", year: 1455, month: 5, day: 22, lat: 51.75, lng: -0.34, createdAt: 2 },
        { id: "c", title: "Fall of Constantinople", year: 1453, lat: 41.0, lng: 28.98, createdAt: 3 },
      ]));
    }
  });
  await sy.click("#tabAll"); await sy.click('#listItems .ev >> text=Gutenberg Bible printed'); await sy.waitForTimeout(900);
  st = await sy.evaluate(() => ({ head: document.querySelector(".same-year h3")?.textContent, items: [...document.querySelectorAll(".same-year button")].map((b) => b.textContent) }));
  check("details list the other events from the same year only", st.head === "Also in 1455" && st.items.join() === "Wars of the Roses begin", st);
  await sy.click(".same-year button"); await sy.waitForTimeout(900);
  st = await sy.evaluate(() => ({ title: document.querySelector(".d-title")?.textContent, items: [...document.querySelectorAll(".same-year button")].map((b) => b.textContent) }));
  check("clicking one opens that event", st.title === "Wars of the Roses begin" && st.items.join() === "Gutenberg Bible printed", st);
  await sy.context().close();

  // ---------------------------------------------------------------- new examples reach an existing logbook once
  const old = await newPage({ viewport: { width: 1200, height: 800 } }, () => {
    if (!sessionStorage.getItem("seeded")) {
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("chronoglobe:events:v1", JSON.stringify([
        { id: "ex-gutenberg", title: "Gutenberg Bible printed", year: 1455, lat: 49.99, lng: 8.25, example: true, createdAt: 1 },
        { id: "mine", title: "My own event", year: 1600, lat: 10, lng: 10, createdAt: 2 },
      ]));
    }
  });
  const ids = () => old.evaluate(() => JSON.parse(localStorage.getItem("chronoglobe:events:v1")).map((r) => r.id).sort().join());
  st = await ids();
  check("an older logbook gets the two new examples, not the ones it removed", st === "ex-guillotine,ex-gutenberg,ex-star-wars,mine", st);
  await old.evaluate(() => localStorage.setItem("chronoglobe:events:v1", JSON.stringify(JSON.parse(localStorage.getItem("chronoglobe:events:v1")).filter((r) => r.id !== "ex-star-wars"))));
  await old.reload(); await old.waitForTimeout(1000);
  st = await ids();
  check("a removed new example doesn't come back", st === "ex-guillotine,ex-gutenberg,mine", st);
  await old.context().close();

  // ---------------------------------------------------------------- blocked storage
  const pb = await newPage({ viewport: { width: 1200, height: 800 } }, () => { Storage.prototype.setItem = function () { throw new DOMException("blocked", "SecurityError"); }; });
  st = await pb.evaluate(() => ({ sync: document.querySelector("#sync").textContent, add: document.querySelector("#addBtn").hidden, empty: document.querySelector("#listItems").innerText.slice(0, 40) }));
  check("blocked storage says so and hides Add event", st.sync === "Not saving" && st.add && /isn't saving/.test(st.empty), st);

  // ---------------------------------------------------------------- full storage: saved events still show and can be exported
  const pf = await newPage({ viewport: { width: 1200, height: 800 } }, () => {
    localStorage.setItem("chronoglobe:events:v1", JSON.stringify([{ id: "keep-me", title: "Saved before the quota filled", year: 1815, month: 6, day: 18, place: "Waterloo, Belgium", lat: 50.68, lng: 4.412, category: "conflict", description: "", example: false, createdAt: 1 }]));
    Storage.prototype.setItem = function () { throw new DOMException("full", "QuotaExceededError"); };
  });
  await pf.click("#tabAll"); await pf.waitForTimeout(150);
  st = await pf.evaluate(() => ({ sync: document.querySelector("#sync").textContent, add: document.querySelector("#addBtn").hidden, n: document.querySelector("#countAll").textContent, exp: !!document.querySelector(".data-tools .btn") }));
  check("full storage still shows saved events and offers Export", st.sync === "Storage full" && st.add && st.n === "1" && st.exp, st);

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
