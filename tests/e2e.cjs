// End-to-end checks in headless Chromium: node tests/e2e.cjs
// Needs Playwright (npm install). Set CHROMIUM_PATH to use an existing Chromium build.
const path = require("path");
const fs = require("fs");
const os = require("os");
const { chromium } = require("playwright");
const http = require("http");
const { startServer } = require("./server.cjs");

// Stand-in for the Firebase compat SDK: the auth and Firestore calls app.js makes, backed by a
// shared in-memory store on a local server so separate browser contexts behave like separate devices.
function mockFirebase(cloudUrl) {
  const AUTH_KEY = "mock-firebase-user";
  let user = null;
  try { user = JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch (_) {}
  const authListeners = [];
  const emitAuth = () => authListeners.forEach((f) => f(user));
  const call = (method, body, q = "") => fetch(cloudUrl + q, { method, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json());
  const pulls = new Set();
  const poke = () => pulls.forEach((f) => f());
  const docRef = (uid, id) => ({
    id,
    set: (data) => call("POST", { op: "set", uid, id, data }).then(poke),
    delete: () => call("POST", { op: "delete", uid, id }).then(poke),
  });
  const eventsOf = (uid) => ({
    doc: (id) => docRef(uid, id),
    onSnapshot(opts, next, error) {
      let stopped = false, last = null;
      const pull = async () => {
        if (stopped) return;
        try {
          const rows = await call("GET", null, "?uid=" + encodeURIComponent(uid));
          const key = JSON.stringify(rows);
          if (key !== last) { last = key; next({ docs: rows.map((r) => ({ id: r.id, data: () => r.data })), metadata: { hasPendingWrites: false, fromCache: false } }); }
        } catch (e) { if (error) error({ code: "unavailable" }); }
      };
      pulls.add(pull); pull();
      const timer = setInterval(pull, 250);
      return () => { stopped = true; clearInterval(timer); pulls.delete(pull); };
    },
  });
  const auth = {
    onAuthStateChanged(cb) { authListeners.push(cb); setTimeout(() => cb(user), 20); return () => {}; },
    getRedirectResult: () => Promise.resolve(null),
    signInWithPopup() { user = { uid: "u-fraser", email: "fraser@example.com" }; localStorage.setItem(AUTH_KEY, JSON.stringify(user)); setTimeout(emitAuth, 10); return Promise.resolve({ user }); },
    signInWithRedirect() { return this.signInWithPopup(); },
    signOut() { user = null; localStorage.removeItem(AUTH_KEY); setTimeout(emitAuth, 10); return Promise.resolve(); },
  };
  function GoogleAuthProvider() { this.setCustomParameters = () => {}; }
  const authFn = () => auth;
  authFn.GoogleAuthProvider = GoogleAuthProvider;
  const db = {
    enablePersistence: () => Promise.resolve(),
    collection: () => ({ doc: (uid) => ({ collection: () => eventsOf(uid) }) }),
    batch() { const ops = []; return { set(ref, data) { ops.push(() => ref.set(data)); return this; }, async commit() { for (const op of ops) await op(); } }; },
  };
  window.firebase = { apps: [], initializeApp(cfg) { this.apps.push(cfg); }, auth: authFn, firestore: () => db };
}

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
    // keep tests offline: web fonts fall back to system faces, and sync stays off unless a test turns it on
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: "", contentType: "text/css" }));
    await ctx.route(/googletagmanager\.com/, (r) => r.fulfill({ body: "", contentType: "text/javascript" }));
    await ctx.route("**/firebase-config.js", (r) => r.fulfill({ body: "window.CHRONOGLOBE_FIREBASE = null;", contentType: "text/javascript" }));
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
  check("first visit seeds 6 starter events; starts in 1977 with its two events lit and nothing selected", st.rows === 2 && st.sel === 0 && st.sync === "Saved in this browser", st);
  check("starter events are written to localStorage", ((await stored(p)) || []).length === 6);

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
  check("Save stays off until category is chosen", await p.isDisabled("#fSave"));
  await p.selectOption("#fCat", "culture"); if (!(await p.inputValue("#fDesc"))) await p.fill("#fDesc", "Test description.");
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

  // starter events look like any other event, and deleted ones stay deleted
  st = await p.evaluate(() => ({ badges: document.body.innerText.includes("EXAMPLE") || document.body.innerText.includes("Remove examples") }));
  check("starter events show no example badge or banner", !st.badges, st);
  for (let i = 0; i < 6; i++) {
    await p.click("#tabAll"); await p.click("#listItems .ev >> nth=0"); await p.waitForTimeout(300);
    await p.click("#detailView .btn.danger"); await p.click("#detailView .btn.danger-solid"); await p.waitForTimeout(200);
  }
  await p.reload(); await p.waitForTimeout(1200);
  st = await p.evaluate(() => ({ n: document.querySelector("#countAll").textContent, empty: !!document.querySelector("#listItems .empty") }));
  check("deleted starter events stay deleted after a reload", st.n === "0" && st.empty, st);

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
  await p.selectOption("#fCat", "culture"); if (!(await p.inputValue("#fDesc"))) await p.fill("#fDesc", "Test description.");
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

  // ---------------------------------------------------------------- typing coordinates sets the location
  const co = await newPage({ viewport: { width: 1300, height: 860 } });
  await co.click("#addBtn");
  await co.fill("#fTitle", "Coordinates test"); await co.fill("#fYear", "1666");
  await co.selectOption("#fCat", "disaster"); await co.fill("#fDesc", "Typed by hand.");
  await co.fill("#fLat", "51.5074"); await co.fill("#fLng", "-0.1278"); await co.waitForTimeout(900);
  st = await co.evaluate(() => ({ place: document.querySelector("#fPlace").value, pin: document.querySelector("#fLocText").textContent, save: !document.querySelector("#fSave").disabled, view: window.__chronoglobe.view().rot }));
  check("typing latitude and longitude pins it, fills the place and turns the globe", /London/.test(st.place) && /51\.51° N, 0\.13° W/.test(st.pin) && st.save && Math.abs(st.view[0] - 0.128) < 1 && Math.abs(st.view[1] + 51.5) < 1, st);
  await co.fill("#fPlace", ""); await co.fill("#fLng", ""); await co.fill("#fLat", "48.8566° N, 2.3522° E"); await co.waitForTimeout(200);
  st = await co.evaluate(() => ({ lat: document.querySelector("#fLat").value, lng: document.querySelector("#fLng").value, place: document.querySelector("#fPlace").value }));
  check("pasting a pair with compass letters fills both boxes", st.lat === "48.8566° N" && st.lng === "2.3522° E" && /Paris/.test(st.place), st);
  await co.context().close();

  // ---------------------------------------------------------------- two events on one spot
  const st2 = await newPage({ viewport: { width: 1300, height: 860 } }, () => {
    if (!sessionStorage.getItem("seeded")) {
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("chronoglobe:events:v1", JSON.stringify([
        { id: "roses", title: "Wars of the Roses begin", year: 1455, place: "London, United Kingdom", lat: 51.507, lng: -0.128, category: "conflict", description: "x", createdAt: 1 },
        { id: "vote", title: "Women gain the vote", year: 1918, place: "London, United Kingdom", lat: 51.507, lng: -0.128, category: "politics", description: "x", createdAt: 2 },
        { id: "far", title: "Somewhere else", year: 1900, place: "Paris", lat: 48.857, lng: 2.352, category: "other", description: "x", createdAt: 0 },
      ]));
    }
  });
  await st2.fill("#yearInput", "1920"); await st2.press("#yearInput", "Enter"); await st2.waitForTimeout(1600);
  const gb2 = await st2.locator("#globe").boundingBox();
  let pt = await st2.evaluate(() => window.__chronoglobe.project(-0.128, 51.507));
  await st2.mouse.click(gb2.x + pt[0], gb2.y + pt[1]); await st2.waitForTimeout(1600);
  st = await st2.evaluate(() => ({ title: document.querySelector(".d-title")?.textContent, fan: window.__chronoglobe.fan().map((f) => f.id), here: [...document.querySelectorAll(".same-year")].map((s) => s.innerText.replace(/\n/g, " | ")) }));
  check("clicking a shared spot opens the event nearest the timeline's year", st.title === "Women gain the vote", st);
  check("the other events on that spot fan out around it", st.fan.join() === "roses,vote", st);
  check("details list other events at the same place", st.here.some((t) => /Also here: London/i.test(t) && /1455/.test(t) && /Wars of the Roses/.test(t)) && !st.here.some((t) => /Somewhere else/.test(t)), st);
  const roses = (await st2.evaluate(() => window.__chronoglobe.fan())).find((f) => f.id === "roses");
  await st2.mouse.click(gb2.x + roses.x, gb2.y + roses.y); await st2.waitForTimeout(900);
  st = await st2.evaluate(() => ({ title: document.querySelector(".d-title")?.textContent, year: document.querySelector("#yearInput").value, fan: window.__chronoglobe.fan().length }));
  check("clicking a fanned dot opens that event and moves the timeline", st.title === "Wars of the Roses begin" && st.year === "1455" && st.fan === 2, st);
  await st2.mouse.click(gb2.x + 8, gb2.y + gb2.height - 8); await st2.waitForTimeout(300);
  check("clicking elsewhere closes the fan", (await st2.evaluate(() => window.__chronoglobe.fan().length)) === 0);
  await st2.screenshot({ path: path.join(os.tmpdir(), "fan-closed.png") });
  await st2.context().close();

  // ---------------------------------------------------------------- skip buttons turn the globe to the event
  const sk = await newPage({ viewport: { width: 1300, height: 860 } });
  await sk.fill("#yearInput", "1460"); await sk.press("#yearInput", "Enter"); await sk.waitForTimeout(1500);
  await sk.click("#prevEv"); await sk.waitForTimeout(1600);
  st = await sk.evaluate(() => ({ year: document.querySelector("#yearInput").value, rot: window.__chronoglobe.view().rot }));
  check("skip back lands on the event's year and centres the globe on it", st.year === "1455" && Math.abs(st.rot[0] + 8.247) < 1 && Math.abs(st.rot[1] + 49.993) < 1, st);
  await sk.click("#nextEv"); await sk.waitForTimeout(1600);
  st = await sk.evaluate(() => ({ year: document.querySelector("#yearInput").value, rot: window.__chronoglobe.view().rot }));
  check("skip forward centres the globe on the next event", st.year === "1969" && Math.abs(st.rot[0] - 80.604) < 1 && Math.abs(st.rot[1] + 28.608) < 1, st);
  await sk.context().close();

  // ---------------------------------------------------------------- Play spins the globe
  const pl = await newPage({ viewport: { width: 1300, height: 860 }, reducedMotion: "no-preference" });
  const r0 = await pl.evaluate(() => window.__chronoglobe.view().rot[0]);
  await pl.click("#playBtn"); await pl.waitForTimeout(2000);
  const r1 = await pl.evaluate(() => window.__chronoglobe.view().rot[0]);
  await pl.click("#playBtn"); await pl.waitForTimeout(300);
  const r2 = await pl.evaluate(() => window.__chronoglobe.view().rot[0]); await pl.waitForTimeout(1000);
  const r3 = await pl.evaluate(() => window.__chronoglobe.view().rot[0]);
  check("Play spins the globe at about 15 deg/s and pausing stops it", r1 - r0 > 20 && r1 - r0 < 40 && Math.abs(r3 - r2) < 0.5, { during: r1 - r0, afterPause: r3 - r2 });
  await pl.context().close();

  // ---------------------------------------------------------------- idle spin after a minute
  const idle = await newPage({ viewport: { width: 1200, height: 800 } }, () => {
    const real = window.setTimeout;
    window.setTimeout = (fn, ms, ...a) => real(fn, ms === 60000 ? 800 : ms, ...a);
  });
  await idle.mouse.click(5, 5);
  st = { before: await idle.evaluate(() => window.__chronoglobe.idleSpinning()) };
  await idle.waitForTimeout(1500);
  st.after = await idle.evaluate(() => window.__chronoglobe.idleSpinning());
  const gbi = await idle.locator("#globe").boundingBox();
  await idle.mouse.click(gbi.x + 10, gbi.y + 10);
  st.afterClick = await idle.evaluate(() => window.__chronoglobe.idleSpinning());
  check("the globe starts spinning after a minute idle and stops on input", !st.before && st.after && !st.afterClick, st);
  await idle.context().close();

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

  // ---------------------------------------------------------------- syncing between devices (Firebase stand-in)
  const cloudDocs = new Map();
  const cloudServer = http.createServer((req, res) => {
    const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST", "Content-Type": "application/json" };
    if (req.method === "OPTIONS") { res.writeHead(204, headers).end(); return; }
    const uid = new URL(req.url, "http://x").searchParams.get("uid");
    if (req.method === "GET") { res.writeHead(200, headers).end(JSON.stringify([...(cloudDocs.get(uid) || new Map())].map(([id, data]) => ({ id, data })).sort((a, b) => a.id.localeCompare(b.id)))); return; }
    let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
      const op = JSON.parse(body);
      if (!cloudDocs.has(op.uid)) cloudDocs.set(op.uid, new Map());
      if (op.op === "set") cloudDocs.get(op.uid).set(op.id, op.data); else cloudDocs.get(op.uid).delete(op.id);
      res.writeHead(200, headers).end("{}");
    });
  });
  await new Promise((r) => cloudServer.listen(0, "127.0.0.1", r));
  const CLOUD = `http://127.0.0.1:${cloudServer.address().port}/`;
  const inCloud = () => [...(cloudDocs.get("u-fraser") || new Map()).values()].map((d) => d.title).sort();
  async function device(seed, opts = {}) {
    const ctx = await browser.newContext({ viewport: { width: 1300, height: 860 }, reducedMotion: "reduce", ...opts });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: "", contentType: "text/css" }));
    await ctx.route(/googletagmanager\.com/, (r) => r.fulfill({ body: "", contentType: "text/javascript" }));
    await ctx.route("**/firebase-config.js", (r) => r.fulfill({ body: 'window.CHRONOGLOBE_FIREBASE = { projectId: "test" };', contentType: "text/javascript" }));
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(mockFirebase, CLOUD);
    if (seed) await page.addInitScript(seed);
    await page.goto(BASE); await page.waitForTimeout(1500);
    return page;
  }
  const count = (pg) => pg.evaluate(() => document.querySelector("#countAll").textContent);
  const desk = await device();
  st = await desk.evaluate(() => ({ btn: !document.querySelector("#signInBtn").hidden, sync: document.querySelector("#sync").textContent, n: document.querySelector("#countAll").textContent }));
  check("with sync set up, a signed-out device offers Sign in and still saves in the browser", st.btn && st.sync === "Saved in this browser" && st.n === "6", st);
  await desk.click("#signInBtn"); await desk.waitForTimeout(1500);
  st = await desk.evaluate(() => ({ sync: document.querySelector("#sync").textContent, n: document.querySelector("#countAll").textContent, local: localStorage.getItem("chronoglobe:events:v1"), btn: document.querySelector("#signInBtn").hidden, toast: document.querySelector("#toast").textContent }));
  check("signing in moves this browser's events into the account", st.sync === "Synced" && st.n === "6" && inCloud().length === 6 && st.local === "[]" && st.btn && /Signed in/.test(st.toast), { ...st, cloud: inCloud().length });
  await desk.click("#addBtn");
  await desk.fill("#fTitle", "Added on desktop"); await desk.fill("#fYear", "1815");
  await desk.fill("#fPlace", "Waterloo, Belgium"); await desk.dispatchEvent("#fPlace", "input");
  await desk.selectOption("#fCat", "culture"); if (!(await desk.inputValue("#fDesc"))) await desk.fill("#fDesc", "Test description.");
  await desk.click("#fSave"); await desk.waitForTimeout(600);
  check("an event added while signed in is saved to the account", inCloud().includes("Added on desktop"), inCloud());

  // a second device that already has its own event in the browser
  const phone = await device(() => {
    if (!localStorage.getItem("chronoglobe:events:v1")) localStorage.setItem("chronoglobe:events:v1", JSON.stringify([{ id: "phone-1", title: "Added on phone", year: 1066, lat: 50.91, lng: 0.49, createdAt: 5 }]));
  });
  await phone.click("#signInBtn"); await phone.waitForTimeout(1500);
  st = { phone: await count(phone), cloud: inCloud() };
  check("signing in on a second device shows the account's events plus its own", st.phone === "8" && st.cloud.includes("Added on phone") && st.cloud.includes("Added on desktop") && st.cloud.length === 8, st);
  check("a second device's example events don't join an account that already has events", inCloud().filter((t) => t === "Star Wars opens in cinemas").length === 1, inCloud());
  await desk.waitForTimeout(800);
  check("the first device picks up the second device's event without reloading", (await count(desk)) === "8");

  await phone.click("#tabAll"); await phone.click('#listItems .ev >> text=Added on desktop'); await phone.waitForTimeout(900);
  await phone.click("#detailView .btn.danger"); await phone.click("#detailView .btn.danger-solid"); await phone.waitForTimeout(800);
  st = { desk: await count(desk), phone: await count(phone), cloud: inCloud().length };
  check("deleting on one device removes it everywhere", st.desk === "7" && st.phone === "7" && st.cloud === 7, st);

  await desk.reload(); await desk.waitForTimeout(1500);
  st = await desk.evaluate(() => ({ sync: document.querySelector("#sync").textContent, n: document.querySelector("#countAll").textContent }));
  check("after a reload the device is still signed in and shows the account's events", st.sync === "Synced" && st.n === "7", st);

  await desk.click("#tabAll"); await desk.click(".data-tools .btn >> text=Sign out"); await desk.waitForTimeout(800);
  st = await desk.evaluate(() => ({ sync: document.querySelector("#sync").textContent, n: document.querySelector("#countAll").textContent, empty: document.querySelector("#listItems .empty")?.innerText.slice(0, 60), btn: !document.querySelector("#signInBtn").hidden }));
  check("signing out leaves an empty browser logbook that offers Sign in", st.sync === "Saved in this browser" && st.n === "0" && /Sign in/.test(st.empty || "") && st.btn, st);
  await desk.click("#addBtn");
  await desk.fill("#fTitle", "Added while signed out"); await desk.fill("#fYear", "1666");
  await desk.fill("#fPlace", "London, United Kingdom"); await desk.dispatchEvent("#fPlace", "input");
  await desk.selectOption("#fCat", "culture"); if (!(await desk.inputValue("#fDesc"))) await desk.fill("#fDesc", "Test description.");
  await desk.click("#fSave"); await desk.waitForTimeout(400);
  await desk.click("#signInBtn"); await desk.waitForTimeout(1500);
  st = { n: await count(desk), cloud: inCloud().length, local: await desk.evaluate(() => localStorage.getItem("chronoglobe:events:v1")) };
  check("signing back in adds events made while signed out, with no duplicates", st.n === "8" && st.cloud === 8 && inCloud().includes("Added while signed out") && st.local === "[]", st);
  const narrowPhone = await device(null, { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  st = await narrowPhone.evaluate(() => ({ sw: document.documentElement.scrollWidth, btn: !document.querySelector("#signInBtn").hidden }));
  check("the phone header fits at 360px with the Sign in button", st.sw === 360 && st.btn, st);
  await narrowPhone.context().close();
  await desk.context().close(); await phone.context().close(); cloudServer.close();

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
